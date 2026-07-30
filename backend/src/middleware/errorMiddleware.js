function notFound(req, res) {
  res.status(404).json({ error: "Recurso no encontrado." });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo debe ser JSON válido." });
  }
  if (err.code === "23505") return res.status(409).json({ error: "El recurso ya existe." });
  console.error(err);
  return res.status(err.status || 500).json({ error: err.message || "Error interno del servidor." });
}

module.exports = { notFound, errorHandler };
