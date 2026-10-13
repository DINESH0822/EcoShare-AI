const test = require("node:test");
const assert = require("node:assert/strict");
const { getProjectAnswer } = require("../services/projectKnowledge");

test("project FAQ answers disclose synthetic model data and limitations", () => {
  const answer = getProjectAnswer("project_dataset");
  assert.match(answer.reply, /3,000 synthetic examples/);
  assert.match(answer.reply, /not validated real-world performance/);
});

test("project FAQ matching explains eligibility separately from claim prediction", () => {
  const answer = getProjectAnswer("project_matching");
  assert.match(answer.reply, /verified or approved NGOs/);
  assert.match(answer.reply, /distinct from the Random Forest claim-probability estimate/);
});

test("project FAQ citations contain verifiable DOI and official URLs", () => {
  const answer = getProjectAnswer("project_references");
  assert.match(answer.reply, /doi\.org\/10\.1038\/s43016-023-00710-3/);
  assert.match(answer.reply, /unep\.org\/resources\/publication\/food-waste-index-report-2024/);
});
