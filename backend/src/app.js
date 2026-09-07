const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
require("dotenv").config();

const logger = require("./logger");
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const userRoutes = require("./routes/users");
const contactRoutes = require("./routes/contacts");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use(
  pinoHttp({
    logger,
    redact: ["req.headers.authorization"],
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const frontendUrl = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.trim().replace(/\/$/, "")
        : null;

      const isAllowed =
        !frontendUrl ||
        (frontendUrl && origin === frontendUrl) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin === "http://localhost:5173" ||
        origin === "http://localhost:3000";

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);

app.get("/", (req, res) => res.send("Job Tracker API running"));

app.use(errorHandler);

module.exports = app;