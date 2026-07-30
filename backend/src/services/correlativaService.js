const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");

async function verificarCorrelatividad(legajo, idMateria) {
  const requeridas = await materiaRepository.findCorrelativasDe(idMateria);
  if (requeridas.length === 0) return { cumple: true, faltantes: [] };
  const aprobadas = new Set(await inscripcionRepository.historialDe(legajo));
  const faltantes = requeridas.filter((idReq) => !aprobadas.has(idReq));
  return { cumple: faltantes.length === 0, faltantes };
}

module.exports = { verificarCorrelatividad };
