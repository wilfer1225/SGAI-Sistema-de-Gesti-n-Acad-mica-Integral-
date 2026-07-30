const jwt = require("jsonwebtoken");
const { alumnos } = require("../db/mockData");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// POST /api/auth/login  { email, password }
// NOTA: en este scope académico el password no se verifica contra bcrypt real
// (los hashes en mockData son ficticios); en producción se usaría bcrypt.compare().
function login(req, res) {
  const { email } = req.body;
  const alumno = alumnos.find((a) => a.email === email);
  if (!alumno) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }
  const token = jwt.sign({ legajo: alumno.legajo, email: alumno.email }, JWT_SECRET, { expiresIn: "2h" });
  return res.status(200).json({ token, alumno: { legajo: alumno.legajo, nombreCompleto: alumno.nombreCompleto } });
}

module.exports = { login };
