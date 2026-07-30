const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token no provisto." });
  try { req.user = jwt.verify(token, getJwtSecret()); return next(); }
  catch (error) { return res.status(401).json({ error: "Token inválido o expirado." }); }
}

module.exports = { requireAuth };
