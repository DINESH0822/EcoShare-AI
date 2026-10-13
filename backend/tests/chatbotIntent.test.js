const test = require("node:test");
const assert = require("node:assert/strict");
const { classifyIntent } = require("../services/chatbotIntent");

test("EcoBot recognizes personal donation and claim questions", () => {
  assert.equal(classifyIntent("What donations do I have?"), "my_donations");
  assert.equal(classifyIntent("show my food"), "my_donations");
  assert.equal(classifyIntent("Show my pending claims"), "claims");
});

test("EcoBot recognizes urgent, pickup, impact, and nearby organization questions", () => {
  assert.equal(classifyIntent("Which donations expire soon?"), "expiring_donations");
  assert.equal(classifyIntent("Any pending pickup?"), "operations");
  assert.equal(classifyIntent("How much food have we rescued?"), "impact");
  assert.equal(classifyIntent("Nearest NGO"), "nearest_organizations");
});

test("EcoBot recognizes create-donation, tracking, and platform-help questions", () => {
  assert.equal(classifyIntent("How do I create a donation?"), "workflow");
  assert.equal(classifyIntent("How do I track a rescue?"), "workflow");
  assert.equal(classifyIntent("What is EcoShare AI?"), "project_overview");
});

test("EcoBot separates verification guidance from verified organization listings", () => {
  assert.equal(classifyIntent("How are organizations verified?"), "verification");
  assert.equal(classifyIntent("Show verified organizations"), "organizations");
  assert.equal(classifyIntent("What is my organization capacity?"), "organization_details");
});

test("EcoBot uses recent intent only for short follow-up questions", () => {
  assert.equal(classifyIntent("and pending?", "claims"), "claims");
  assert.equal(classifyIntent("hello", "claims"), "greeting");
  assert.equal(classifyIntent("unrelated phrase", "claims"), "unknown");
});

test("EcoBot recognizes project, methodology, model, data, and limitation questions", () => {
  assert.equal(classifyIntent("Explain the entire EcoShare AI project"), "project_presentation");
  assert.equal(classifyIntent("Explain the project architecture"), "project_architecture");
  assert.equal(classifyIntent("What is the difference between the existing and proposed systems?"), "project_existing_proposed");
  assert.equal(classifyIntent("Explain the methodology in simple words"), "project_methodology");
  assert.equal(classifyIntent("Which machine-learning model is used?"), "project_model");
  assert.equal(classifyIntent("What data trains the model?"), "project_dataset");
  assert.equal(classifyIntent("What are the limitations and future enhancements?"), "project_limitations");
  assert.equal(classifyIntent("How does the AI matching algorithm work?"), "project_matching");
  assert.equal(classifyIntent("What references should I use for my presentation?"), "project_references");
});

test("EcoBot normalizes common project-question misspellings", () => {
  assert.equal(classifyIntent("Explain the project architecure"), "project_architecture");
  assert.equal(classifyIntent("Explain the matching algoritm"), "project_matching");
  assert.equal(classifyIntent("What are the project limtation?"), "project_limitations");
});