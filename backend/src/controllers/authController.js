const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const alumnoRepository = require("../repositories/alumnoRepository");
const { getJwtSecret } = require("../config");

function respuestaLogin(alumno) {
  const token = jwt.sign({ legajo: alumno.legajo, email: alumno.email }, getJwtSecret(), { expiresIn: "2h" });
  return { token, alumno: { legajo: alumno.legajo, nombreCompleto: alumno.nombreCompleto } };
}

async function login(req, res, next) {
  try {
    const alumno = await alumnoRepository.findByEmail(req.body.email);
    if (!alumno || !(await bcrypt.compare(req.body.password, alumno.passwordHash))) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }
    return res.status(200).json(respuestaLogin(alumno));
  } catch (error) { return next(error); }
}

async function register(req, res, next) {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const alumno = await alumnoRepository.create({ ...req.body, passwordHash });
    return res.status(201).json(respuestaLogin(alumno));
  } catch (error) { return next(error); }
}

module.exports = { login, register };
