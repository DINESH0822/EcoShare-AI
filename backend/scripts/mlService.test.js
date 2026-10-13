const test = require("node:test");
const { after } = require("node:test");
const assert = require("node:assert/strict");
const { runMlPrediction, warmUpMlWorker, fallbackDeterministicScore, shutdownMlWorker } = require("../services/mlService");

after(() => shutdownMlWorker());

test("ML Service - valid donation input uses a real model result or an explicit fallback", async () => {
  // Warm the worker first so the first real prediction is not lost to cold-start.
  await warmUpMlWorker().catch(() => {});
  const input = {
    distance_km: 4.5,
    quantity: 80,
    remaining_shelf_life_hours: 4.5,
    ngo_capacity: 300,
    category: "cooked_meals",
    is_emergency: false,
    requires_refrigeration: false
  };

  const result = await runMlPrediction(input);
  assert.equal(result.success, result.predictionSource === "python-model");
  assert.ok(Array.isArray(result.explanations));
  assert.ok(result.explanations.length > 0);
  if (result.success) {
    assert.ok(typeof result.claimProbability === "number");
    assert.ok(result.claimProbability >= 0 && result.claimProbability <= 1);
    assert.ok(typeof result.mlScore === "number");
    assert.equal(result.datasetProvenance.includes("Synthetic"), true);
  } else {
    assert.equal(result.predictionSource, "deterministic-fallback");
    assert.ok(typeof result.fallbackScore === "number");
  }
});

test("ML Service - handles edge inputs (extreme distance)", async () => {
  const input = {
    distance_km: 45.0,
    quantity: 500,
    remaining_shelf_life_hours: 0.5,
    ngo_capacity: 50,
    category: "cooked_meals",
    is_emergency: true,
    requires_refrigeration: true
  };

  const result = await runMlPrediction(input);
  if (result.success) {
    assert.ok(typeof result.mlScore === "number");
    assert.ok(result.mlScore <= 70);
  } else {
    assert.equal(result.predictionSource, "deterministic-fallback");
    assert.ok(typeof result.fallbackScore === "number");
  }
});

test("ML Service - deterministic fallback is never labelled as an ML prediction", () => {
  const result = fallbackDeterministicScore({});
  assert.equal(result.success, false);
  assert.equal(result.predictionSource, "deterministic-fallback");
  assert.equal(typeof result.fallbackScore, "number");
  assert.equal(result.claimProbability, undefined);
});
