/**
 * Centralized API Response Helpers
 * Ensures consistent response format across all routes.
 *
 * Success: { success: true, data: {}, message: "...", meta: {} }
 * Error:   { success: false, message: "...", code: "...", details: [] }
 */

const successResponse = (data = {}, message = "OK", meta = {}) => {
  if (typeof message === "object" && meta === {}) {
    meta = message;
    message = "OK";
  }

  return {
    success: true,
    message,
    data,
    ...(Object.keys(meta || {}).length > 0 ? { meta } : {})
  };
};

const errorResponse = (message = "Internal Server Error", code = "INTERNAL_ERROR", details = []) => {
  if (Array.isArray(code)) {
    details = code;
    code = "INTERNAL_ERROR";
  }

  return {
    success: false,
    message,
    code,
    ...(details && details.length > 0 ? { details } : {})
  };
};

const sendSuccess = (res, data, message = "OK", statusCode = 200, meta = {}) => {
  return res.status(statusCode).json(successResponse(data, message, meta));
};

const sendError = (res, message, statusCode = 500, code = "INTERNAL_ERROR", details = []) => {
  return res.status(statusCode).json(errorResponse(message, code, details));
};

const sendNotFound = (res, entity = "Resource") => {
  return sendError(res, `${entity} not found`, 404, "NOT_FOUND");
};

const sendUnauthorized = (res, message = "Not authorized") => {
  return sendError(res, message, 401, "UNAUTHORIZED");
};

const sendForbidden = (res, message = "Forbidden") => {
  return sendError(res, message, 403, "FORBIDDEN");
};

const sendValidationError = (res, message, details = []) => {
  return sendError(res, message, 400, "VALIDATION_ERROR", details);
};

module.exports = {
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError
};
