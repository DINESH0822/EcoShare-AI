const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getFoodScope,
  getOperationScope,
  getClaimScope
} = require("../controllers/chatbotController");

test("personal donor donation queries use the schema's donorId field", async () => {
  const user = { _id: "507f1f77bcf86cd799439011", role: "Donor" };
  assert.deepEqual(await getFoodScope(user), { donorId: user._id });
  assert.equal(Object.hasOwn(await getFoodScope(user), "donor"), false);
});

test("available donation queries only return active listings with recorded future expiry", async () => {
  const scope = await getFoodScope({ _id: "507f1f77bcf86cd799439011", role: "Donor" }, { availableOnly: true });
  assert.deepEqual(scope.status.$in, ["Available", "published", "ai_matching", "match_found"]);
  assert.ok(scope.expiryTime.$gt instanceof Date);
});

test("volunteer operation queries use Operation.volunteerId and Volunteer.userId identity", async () => {
  const user = { _id: "507f1f77bcf86cd799439011", role: "Volunteer" };
  assert.deepEqual(await getOperationScope(user), { volunteerId: user._id });
  assert.equal(await getClaimScope(user), null);
});