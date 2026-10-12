const test = require("node:test");
const assert = require("node:assert/strict");
const { runMlPrediction } = require("../services/mlService");

test("ML Service - valid donation and NGO input executes Python model", async () => {
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
  assert.equal(result.success, true);
  assert.ok(typeof result.claimProbability === "number");
  assert.ok(result.claimProbability >= 0 && result.claimProbability <= 1);
  assert.ok(typeof result.mlScore === "number");
  assert.ok(Array.isArray(result.explanations));
  assert.ok(result.explanations.length > 0);
  assert.ok(result.modelVersion);
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
  assert.equal(result.success, true);
  assert.ok(typeof result.mlScore === "number");
  // Extreme distance + tight shelf life lowers claim probability
  assert.ok(result.mlScore <= 70);
});

test("ML Service - fallback behaves correctly when empty payload provided", async () => {
  const result = await runMlPrediction({});
  assert.equal(result.success, true);
  assert.ok(typeof result.mlScore === "number");
  assert.ok(result.mlScore >= 0 && result.mlScore <= 100);
});
