const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");
const correlativaService = require("../services/correlativaService");

// POST /api/inscripcion  { legajo, idMateria, tipoInstancia }
function crearInscripcion(req, res) {
  const { legajo, idMateria, tipoInstancia } = req.body;

  const materia = materiaRepository.findById(idMateria);
  if (!materia) {
    return res.status(404).json({ error: "La materia solicitada no existe." });
  }

  const { cumple, faltantes } = correlativaService.verificarCorrelatividad(legajo, idMateria);
  if (!cumple) {
    return res.status(403).json({
      error: "No cumple las correlatividades requeridas.",
      faltantes,
    });
  }

  const inscripcion = inscripcionRepository.crear({ legajo, idMateria, tipoInstancia });
  return res.status(201).json(inscripcion);
}

// GET /api/inscripcion/:legajo
function listarInscripciones(req, res) {
  const legajo = Number(req.params.legajo);
  return res.status(200).json(inscripcionRepository.listarPorAlumno(legajo));
}

module.exports = { crearInscripcion, listarInscripciones };
