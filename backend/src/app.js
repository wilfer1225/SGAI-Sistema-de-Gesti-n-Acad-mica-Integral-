const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

function createApp() {
  const app = express();
  app.use(cors()); // Habilita peticiones cross-origin (necesario para Flutter Web en otro puerto)
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json());
  app.use("/api", routes);
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
