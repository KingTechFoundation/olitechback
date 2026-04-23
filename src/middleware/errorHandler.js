const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error",
    code: statusCode,
  });
};

module.exports = errorHandler;
