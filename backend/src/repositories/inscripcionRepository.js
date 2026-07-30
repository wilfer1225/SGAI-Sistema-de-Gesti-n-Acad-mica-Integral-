const pool = require("../db/pool");

function mapInscripcion(row) {
  return { idInscripcion: row.id_inscripcion, legajo: row.legajo, idMateria: row.id_materia, fechaInscripcion: row.fecha_inscripcion, tipoInstancia: row.tipo_instancia, estado: row.estado };
}

async function historialDe(legajo) {
  const { rows } = await pool.query("SELECT id_materia FROM historial_academico WHERE legajo = $1 AND estado = 'Aprobada'", [legajo]);
  return rows.map((row) => row.id_materia);
}

async function crear({ legajo, idMateria, tipoInstancia }) {
  const { rows } = await pool.query(
    "INSERT INTO inscripcion (legajo, id_materia, tipo_instancia) VALUES ($1, $2, $3) RETURNING id_inscripcion, legajo, id_materia, fecha_inscripcion, tipo_instancia, estado",
    [legajo, idMateria, tipoInstancia],
  );
  return mapInscripcion(rows[0]);
}

async function listarPorAlumno(legajo) {
  const { rows } = await pool.query("SELECT id_inscripcion, legajo, id_materia, fecha_inscripcion, tipo_instancia, estado FROM inscripcion WHERE legajo = $1 ORDER BY fecha_inscripcion DESC", [legajo]);
  return rows.map(mapInscripcion);
}

module.exports = { historialDe, crear, listarPorAlumno };
