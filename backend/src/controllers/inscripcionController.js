const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");
const correlativaService = require("../services/correlativaService");

async function crearInscripcion(req, res, next) {
  try {
    const { legajo, idMateria, tipoInstancia } = req.body;
    if (req.user.legajo !== legajo) return res.status(403).json({ error: "No puede inscribir a otro alumno." });
    const materia = await materiaRepository.findById(idMateria);
    if (!materia) return res.status(404).json({ error: "La materia solicitada no existe." });
    const { cumple, faltantes } = await correlativaService.verificarCorrelatividad(legajo, idMateria);
    if (!cumple) return res.status(403).json({ error: "No cumple las correlatividades requeridas.", faltantes });
    return res.status(201).json(await inscripcionRepository.crear({ legajo, idMateria, tipoInstancia }));
  } catch (error) { return next(error); }
}

async function listarInscripciones(req, res, next) {
  try {
    const legajo = req.params.legajo;
    if (req.user.legajo !== legajo) return res.status(403).json({ error: "No puede consultar a otro alumno." });
    return res.status(200).json(await inscripcionRepository.listarPorAlumno(legajo));
  } catch (error) { return next(error); }
}

module.exports = { crearInscripcion, listarInscripciones };
