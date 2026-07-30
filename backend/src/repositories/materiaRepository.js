const pool = require("../db/pool");

function mapMateria(row) {
  return { idMateria: row.id_materia, nombreMateria: row.nombre_materia, anioCarrera: row.anio_carrera };
}

async function findAll() {
  const { rows } = await pool.query("SELECT id_materia, nombre_materia, anio_carrera FROM materia ORDER BY anio_carrera, id_materia");
  return rows.map(mapMateria);
}

async function findById(idMateria) {
  const { rows } = await pool.query("SELECT id_materia, nombre_materia, anio_carrera FROM materia WHERE id_materia = $1", [idMateria]);
  return rows[0] ? mapMateria(rows[0]) : null;
}

async function findCorrelativasDe(idMateria) {
  const { rows } = await pool.query("SELECT id_materia_requerida FROM correlativa WHERE id_materia_principal = $1", [idMateria]);
  return rows.map((row) => row.id_materia_requerida);
}

module.exports = { findAll, findById, findCorrelativasDe };
