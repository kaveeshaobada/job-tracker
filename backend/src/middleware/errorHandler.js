function errorHandler(err, req, res, next) {
  req.log?.error({ err }, "Request error");

  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with this value already exists" });
  }

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Something went wrong"
      : err.message || "Something went wrong";

  res.status(status).json({ error: message });
}

module.exports = errorHandler;