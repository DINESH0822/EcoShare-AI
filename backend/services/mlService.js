const { spawn } = require("child_process");
const path = require("path");

const PREDICTOR_PATH = path.join(__dirname, "../ml/predictor.py");
const PYTHON_BIN = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
const PREDICTION_TIMEOUT_MS = 8000;
const WORKER_START_TIMEOUT_MS = 15000;
const HEALTH_CACHE_MS = 30_000;

let pythonProcess = null;
let workerReadyPromise = null;
let workerReady = false;
let stdoutBuffer = "";
let requestSequence = 0;
let cachedHealth = null;
let healthCheckedAt = 0;
const pendingRequests = new Map();

function completeRequest(id, result) {
  const pending = pendingRequests.get(id);
  if (!pending) return;
  clearTimeout(pending.timeout);
  pendingRequests.delete(id);
  pending.resolve(result);
}

function failPendingRequests(message) {
  for (const [id, pending] of pendingRequests) {
    completeRequest(id, fallbackDeterministicScore(pending.input, message));
  }
}

function handleWorkerOutput(line, worker) {
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    console.error("[MLService] Python worker returned invalid JSON:", error.message);
    return;
  }

  if (message.type === "ready") {
    if (message.success) {
      if (worker !== pythonProcess) return;
      workerReady = true;
      return;
    }
    const error = new Error(message.error || "Python model worker could not load the model.");
    const startPromise = workerReadyPromise;
    workerReadyPromise = null;
    startPromise?.reject(error);
    worker.kill();
    return;
  }

  const result = message.result;
  if (result?.success) {
    result.predictionSource = "python-model";
    completeRequest(message.id, result);
  } else {
    completeRequest(message.id, fallbackDeterministicScore(
      pendingRequests.get(message.id)?.input || {},
      result?.error || "Python model returned no prediction."
    ));
  }
}

function startPythonWorker() {
  if (workerReady && pythonProcess && !pythonProcess.killed) return Promise.resolve();
  if (workerReadyPromise) return workerReadyPromise.promise;

  let resolveStart;
  let rejectStart;
  const promise = new Promise((resolve, reject) => {
    resolveStart = resolve;
    rejectStart = reject;
  });
  workerReadyPromise = { promise, resolve: resolveStart, reject: rejectStart };

  try {
    const worker = spawn(PYTHON_BIN, [PREDICTOR_PATH, "--server"], {
      cwd: path.join(__dirname, "../ml"),
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
    pythonProcess = worker;

    worker.stdout.on("data", (chunk) => {
      if (worker !== pythonProcess) return;
      stdoutBuffer += chunk.toString();
      let newlineIndex = stdoutBuffer.indexOf("\n");
      while (newlineIndex !== -1) {
        const line = stdoutBuffer.slice(0, newlineIndex).trim();
        stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);
        if (line) handleWorkerOutput(line, worker);
        if (workerReady && worker === pythonProcess) {
          clearTimeout(startupTimer);
          startupTimer = null;
          const startPromise = workerReadyPromise;
          workerReadyPromise = null;
          startPromise?.resolve();
        }
        newlineIndex = stdoutBuffer.indexOf("\n");
      }
    });

    worker.stderr.on("data", (chunk) => {
      const warning = chunk.toString().trim();
      if (warning) console.warn("[MLService] Python worker:", warning);
    });

    worker.on("error", (error) => {
      if (worker !== pythonProcess) return;
      if (startupTimer) clearTimeout(startupTimer);
      workerReady = false;
      const startPromise = workerReadyPromise;
      workerReadyPromise = null;
      startPromise?.reject(error);
      failPendingRequests(`Could not start Python model worker: ${error.message}`);
    });

    worker.on("close", (code) => {
      if (worker !== pythonProcess) return;
      if (startupTimer) clearTimeout(startupTimer);
      const startPromise = workerReadyPromise;
      workerReadyPromise = null;
      workerReady = false;
      stdoutBuffer = "";
      if (startPromise) startPromise.reject(new Error(`Python model worker exited with code ${code}.`));
      if (pendingRequests.size) {
        console.warn(`[MLService] Python model worker exited with code ${code}; using deterministic fallback.`);
        failPendingRequests("Python model worker exited before returning a prediction.");
      }
      pythonProcess = null;
    });
  } catch (error) {
    const startPromise = workerReadyPromise;
    workerReadyPromise = null;
    startPromise.reject(error);
    return promise;
  }

  let startupTimer = setTimeout(() => {
    const error = new Error(`Python model worker did not become ready within ${WORKER_START_TIMEOUT_MS}ms.`);
    const processToStop = pythonProcess;
    workerReady = false;
    workerReadyPromise = null;
    processToStop?.kill();
    rejectStart(error);
  }, WORKER_START_TIMEOUT_MS);

  return promise;
}

function runMlPrediction(input) {
  return new Promise((resolve) => {
    const id = ++requestSequence;
    // The inference timeout is armed only AFTER the worker becomes ready and the
    // request is written. Worker cold-start (importing scikit-learn and loading the
    // model) can take several seconds and is already bounded by WORKER_START_TIMEOUT_MS;
    // counting that time against the inference budget caused the first real prediction
    // to fall back before the model could answer.
    let timeout = null;
    pendingRequests.set(id, { input, timeout, resolve });
    startPythonWorker().then(() => {
      if (!pendingRequests.has(id)) return;
      if (!pythonProcess || pythonProcess.killed || !pythonProcess.stdin.writable) {
        completeRequest(id, fallbackDeterministicScore(input, "Python model worker is unavailable."));
        return;
      }
      const pending = pendingRequests.get(id);
      if (!pending) return;
      timeout = setTimeout(() => {
        completeRequest(id, fallbackDeterministicScore(
          input,
          "Python model inference exceeded the request limit; this fallback is not an ML prediction."
        ));
        console.warn("[MLService] Prediction timed out; using deterministic fallback scoring");
      }, PREDICTION_TIMEOUT_MS);
      pending.timeout = timeout;
      pythonProcess.stdin.write(`${JSON.stringify({ id, input })}\n`, (error) => {
        if (error) {
          console.error("[MLService] Could not send prediction to Python worker:", error.message);
          completeRequest(id, fallbackDeterministicScore(input, "Could not send input to Python model worker."));
        }
      });
    }).catch((error) => {
      console.warn("[MLService] Python model worker startup failed:", error.message);
      completeRequest(id, fallbackDeterministicScore(input, "Python model worker could not start."));
    });
  });
}

function fallbackDeterministicScore(input, reason = "Python model prediction was unavailable; this fallback is not an ML prediction.") {
  const dist = Number(input.distance_km) || 10;
  const shelf = Number(input.remaining_shelf_life_hours) || 4;
  let score = 70 - Math.min(dist * 2, 40) + Math.min(shelf * 3, 20);
  score = Math.max(10, Math.min(95, Math.round(score)));

  return {
    success: false,
    predictionSource: "deterministic-fallback",
    fallbackScore: score,
    modelVersion: "deterministic-heuristic-fallback",
    algorithm: "Deterministic Rules Engine",
    error: reason,
    explanations: [
      `Distance: ${dist.toFixed(1)} km`,
      `Shelf life remaining: ${shelf.toFixed(1)} hours`
    ]
  };
}

async function getMlServiceHealth() {
  if (cachedHealth && Date.now() - healthCheckedAt < (cachedHealth.modelAvailable ? HEALTH_CACHE_MS : 1000)) {
    return cachedHealth;
  }

  const prediction = await runMlPrediction({
    distance_km: 5,
    quantity: 50,
    remaining_shelf_life_hours: 4,
    ngo_capacity: 200,
    category: "cooked_meals",
    is_emergency: false,
    requires_refrigeration: false
  });
  const available = prediction.success === true && prediction.predictionSource === "python-model";

  cachedHealth = {
    status: available ? "AVAILABLE" : "DEGRADED",
    provider: "Python scikit-learn claim predictor",
    modelFile: "claim_predictor.joblib",
    modelAvailable: available,
    algorithm: available ? prediction.algorithm : "Model unavailable; deterministic fallback is not ML",
    modelVersion: available ? prediction.modelVersion : null,
    metrics: available ? prediction.metrics : null,
    metricScope: available ? prediction.metricScope : null,
    datasetProvenance: available ? prediction.datasetProvenance : "Training script generates synthetic, formula-labeled examples.",
    runtimeScikitLearnVersion: available ? prediction.runtimeScikitLearnVersion : null,
    trainingScikitLearnVersion: available ? prediction.trainingScikitLearnVersion : null,
    features: available ? prediction.features : [],
    fallback: "The separate matching rules remain available; any claim-score fallback is explicitly marked as a deterministic heuristic."
  };
  healthCheckedAt = Date.now();
  return cachedHealth;
}

function shutdownMlWorker() {
  if (pythonProcess && !pythonProcess.killed) pythonProcess.kill();
  pythonProcess = null;
  workerReady = false;
  workerReadyPromise = null;
  stdoutBuffer = "";
  failPendingRequests("Python model worker was stopped.");
}

// Pre-start the Python worker so the first real prediction does not pay the
// cold-start cost. Safe to call at server boot; failures are non-fatal and the
// service falls back to deterministic scoring until a worker is available.
// Resolves once the worker is ready (or rejects if it cannot start).
function warmUpMlWorker() {
  return startPythonWorker()
    .then(() => console.log("[MLService] Python claim-predictor worker warmed up."))
    .catch((error) => {
      console.warn("[MLService] Worker warm-up skipped:", error.message);
    });
}

module.exports = {
  runMlPrediction,
  fallbackDeterministicScore,
  getMlServiceHealth,
  warmUpMlWorker,
  shutdownMlWorker
};
