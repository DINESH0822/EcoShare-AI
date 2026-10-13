const test = require("node:test");
const assert = require("node:assert/strict");

const Food = require("../models/Food");
const History = require("../models/History");
const AIRecommendation = require("../models/AIRecommendation");
const { getFoodById, getFoodByTraceabilityId } = require("../controllers/foodController");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test("food detail populates the schema's donorId reference", async () => {
  const originalFindById = Food.findById;
  const originalRecommendationFindOne = AIRecommendation.findOne;
  const originalHistoryFind = History.find;
  const food = { _id: "507f1f77bcf86cd799439011" };
  const response = createResponse();

  try {
    Food.findById = () => ({
      populate(path, fields) {
        assert.equal(path, "donorId");
        assert.equal(fields, "name email phone");
        return Promise.resolve(food);
      }
    });
    AIRecommendation.findOne = () => Promise.resolve(null);
    History.find = () => ({ sort: () => Promise.resolve([]) });

    await getFoodById({ params: { id: food._id } }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.food, food);
  } finally {
    Food.findById = originalFindById;
    AIRecommendation.findOne = originalRecommendationFindOne;
    History.find = originalHistoryFind;
  }
});

test("food traceability lookup populates the schema's donorId reference", async () => {
  const originalFindOne = Food.findOne;
  const originalHistoryFind = History.find;
  const food = { _id: "507f1f77bcf86cd799439011" };
  const response = createResponse();

  try {
    Food.findOne = () => ({
      populate(path, fields) {
        assert.equal(path, "donorId");
        assert.equal(fields, "name email");
        return Promise.resolve(food);
      }
    });
    History.find = () => ({ sort: () => Promise.resolve([]) });

    await getFoodByTraceabilityId({ params: { traceabilityId: "ECO-TEST-001" } }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.food, food);
  } finally {
    Food.findOne = originalFindOne;
    History.find = originalHistoryFind;
  }
});
