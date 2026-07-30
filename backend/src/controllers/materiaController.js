const materiaRepository = require("../repositories/materiaRepository");

// GET /api/materias
function listarMaterias(req, res) {
  return res.status(200).json(materiaRepository.findAll());
}

module.exports = { listarMaterias };
