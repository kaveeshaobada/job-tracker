const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
require("dotenv").config();

const logger = require("./logger");
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const userRoutes = require("./routes/users");

const app = express();

app.use(helmet());
app.use(
  pinoHttp({
    logger,
    redact: ["req.headers.authorization"],
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => res.send("Job Tracker API running"));

app.use(errorHandler);

app.use("/api/users", userRoutes);

module.exports = app;