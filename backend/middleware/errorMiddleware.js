const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  return res.status(statusCode).json(errorResponse(
    err.message || "Internal Server Error",
    err.code || "SERVER_ERROR",
    process.env.NODE_ENV === "development" ? err.stack : null
  ));
};

const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
