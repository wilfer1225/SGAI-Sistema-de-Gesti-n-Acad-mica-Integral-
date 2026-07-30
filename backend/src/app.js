const express = require("express");
const cors = require("cors");
const routes = require("./routes");

function createApp() {
  const app = express();
  app.use(cors()); // Habilita peticiones cross-origin (necesario para Flutter Web en otro puerto)
  app.use(express.json());
  app.use("/api", routes);
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  return app;
}

module.exports = { createApp };
