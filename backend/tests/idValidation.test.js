const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidObjectId } = require('../utils/idValidation');

test('accepts valid Mongo ObjectIds', () => {
  assert.equal(isValidObjectId('507f1f77bcf86cd799439011'), true);
  assert.equal(isValidObjectId('67d5d6f2a17a5f1e4fa7d6b1'), true);
});

test('rejects demo or non-Mongo identifiers', () => {
  assert.equal(isValidObjectId('op-101'), false);
  assert.equal(isValidObjectId('invalid-id'), false);
  assert.equal(isValidObjectId(''), false);
});
