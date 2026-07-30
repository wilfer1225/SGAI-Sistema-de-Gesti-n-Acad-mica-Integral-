const materiaRepository = require("../repositories/materiaRepository");

async function listarMaterias(req, res, next) {
  try { return res.status(200).json(await materiaRepository.findAll()); } catch (error) { return next(error); }
}

module.exports = { listarMaterias };
