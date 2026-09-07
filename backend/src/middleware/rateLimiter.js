const rateLimit = require("express-rate-limit");

const skipInTest = () => process.env.NODE_ENV === "test";

// Strict limiter for auth routes — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

// General limiter for the whole API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
});

module.exports = { authLimiter, apiLimiter };