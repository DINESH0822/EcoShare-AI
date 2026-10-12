const { spawn } = require("child_process");
const path = require("path");

const PREDICTOR_PATH = path.join(__dirname, "../ml/predictor.py");

// Configurable Python binary path via environment variable or default
const PYTHON_BIN = process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");

/**
 * Call Python Random Forest Inference Service
 * @param {Object} input - Operational donation and NGO features
 * @returns {Promise<Object>}
 */
function runMlPrediction(input) {
  return new Promise((resolve) => {
    let resolved = false;

    // Timeout watchdog (4000ms max)
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn("[MLService] Prediction timed out (4s), invoking fallback scoring");
        try {
          if (pythonProcess && !pythonProcess.killed) pythonProcess.kill();
        } catch (_) {}
        resolve(fallbackDeterministicScore(input));
      }
    }, 4000);

    let pythonProcess;
    try {
      pythonProcess = spawn(PYTHON_BIN, [
        PREDICTOR_PATH,
        JSON.stringify(input)
      ], {
        cwd: path.join(__dirname, "../ml"),
        windowsHide: true
      });

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProcess.on("close", (code) => {
        clearTimeout(timeout);
        if (resolved) return;
        resolved = true;

        if (code === 0 && stdout) {
          try {
            // Find JSON in output (skipping any sklearn deprecation/user warnings)
            const jsonStart = stdout.indexOf("{");
            if (jsonStart !== -1) {
              const parsed = JSON.parse(stdout.slice(jsonStart));
              if (parsed.success) {
                return resolve(parsed);
              }
            }
          } catch (e) {
            console.error("[MLService] Failed to parse ML output JSON:", stdout);
          }
        }

        // Graceful deterministic fallback if python script fails
        resolve(fallbackDeterministicScore(input));
      });

      pythonProcess.on("error", (err) => {
        clearTimeout(timeout);
        if (resolved) return;
        resolved = true;
        console.warn("[MLService] Python process error, using fallback scoring:", err.message);
        resolve(fallbackDeterministicScore(input));
      });
    } catch (err) {
      clearTimeout(timeout);
      if (resolved) return;
      resolved = true;
      resolve(fallbackDeterministicScore(input));
    }
  });
}

function fallbackDeterministicScore(input) {
  const dist = Number(input.distance_km) || 10;
  const shelf = Number(input.remaining_shelf_life_hours) || 4;
  let score = 70 - Math.min(dist * 2, 40) + Math.min(shelf * 3, 20);
  score = Math.max(10, Math.min(95, Math.round(score)));

  return {
    success: true,
    claimProbability: score / 100,
    mlScore: score,
    modelVersion: "deterministic-heuristic-fallback",
    algorithm: "Deterministic Rules Engine",
    explanations: [
      `Distance: ${dist.toFixed(1)} km`,
      `Shelf life remaining: ${shelf.toFixed(1)} hours`
    ]
  };
}

module.exports = {
  runMlPrediction
};
