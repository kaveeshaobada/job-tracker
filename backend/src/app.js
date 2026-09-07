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
const contactRoutes = require("./routes/contacts");

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  pinoHttp({
    logger,
    redact: ["req.headers.authorization"],
  })
);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((u) => u.trim().replace(/\/$/, "")) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        (process.env.NODE_ENV !== "production" && origin.includes("localhost"));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
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

app.use("/api/contacts", contactRoutes);

module.exports = app;