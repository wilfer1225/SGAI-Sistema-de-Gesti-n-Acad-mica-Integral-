const { materias, correlativas } = require("../db/mockData");

/**
 * Repository Pattern: aísla el acceso a datos de materias/correlativas
 * de la lógica de negocio en los services/controllers.
 * En producción, estas funciones ejecutan SQL contra PostgreSQL.
 */
function findAll() {
  return materias;
}

function findById(idMateria) {
  return materias.find((m) => m.idMateria === idMateria) || null;
}

function findCorrelativasDe(idMateria) {
  return correlativas
    .filter((c) => c.idMateriaPrincipal === idMateria)
    .map((c) => c.idMateriaRequerida);
}

module.exports = { findAll, findById, findCorrelativasDe };
