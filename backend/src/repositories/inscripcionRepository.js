const db = require("../db/mockData");

function historialDe(legajo) {
  return db.historialAprobadas[legajo] || [];
}

function crear({ legajo, idMateria, tipoInstancia }) {
  const nueva = {
    idInscripcion: db.nextInscripcionId(),
    legajo,
    idMateria,
    fechaInscripcion: new Date().toISOString(),
    tipoInstancia,
    estado: "Confirmada",
  };
  db.inscripciones.push(nueva);
  return nueva;
}

function listarPorAlumno(legajo) {
  return db.inscripciones.filter((i) => i.legajo === legajo);
}

module.exports = { historialDe, crear, listarPorAlumno };
