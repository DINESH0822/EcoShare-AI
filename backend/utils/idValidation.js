const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  const raw = String(value).trim();
  if (!raw) {
    return false;
  }

  return mongoose.Types.ObjectId.isValid(raw) && String(new mongoose.Types.ObjectId(raw)) === raw;
};

const requireValidObjectId = (value, label = 'ID') => {
  if (!isValidObjectId(value)) {
    return {
      valid: false,
      error: {
        status: 400,
        message: `Invalid ${label} format. Expected a Mongo ObjectId.`,
        code: 'INVALID_ID'
      }
    };
  }

  return { valid: true };
};

module.exports = {
  isValidObjectId,
  requireValidObjectId
};
