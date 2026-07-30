const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");

/**
 * RF03: El sistema debe permitir la inscripción a cursadas validando
 * correlatividades previas.
 *
 * Devuelve { cumple: boolean, faltantes: number[] } donde `faltantes`
 * son los ids de materia requeridos que el alumno todavía no aprobó.
 */
function verificarCorrelatividad(legajo, idMateria) {
  const requeridas = materiaRepository.findCorrelativasDe(idMateria);
  if (requeridas.length === 0) {
    return { cumple: true, faltantes: [] };
  }
  const aprobadas = new Set(inscripcionRepository.historialDe(legajo));
  const faltantes = requeridas.filter((idReq) => !aprobadas.has(idReq));
  return { cumple: faltantes.length === 0, faltantes };
}

module.exports = { verificarCorrelatividad };
