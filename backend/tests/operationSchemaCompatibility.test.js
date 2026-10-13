const test = require("node:test");
const assert = require("node:assert/strict");

const Operation = require("../models/Operation");

test("Operation schema supports assignedVolunteer and assignedNgo compatibility fields", () => {
  assert.ok(Operation.schema.paths.assignedVolunteer, "assignedVolunteer field should exist");
  assert.ok(Operation.schema.paths.assignedNgo, "assignedNgo field should exist");

  const operation = new Operation({
    foodId: "507f1f77bcf86cd799439011",
    assignedVolunteer: "507f1f77bcf86cd799439012",
    assignedNgo: "507f1f77bcf86cd799439013"
  });

  assert.equal(String(operation.assignedVolunteer), "507f1f77bcf86cd799439012");
  assert.equal(String(operation.assignedNgo), "507f1f77bcf86cd799439013");
});
