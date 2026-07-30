const pool = require("../db/pool");

function mapAlumno(row) {
  return { legajo: row.legajo, nombreCompleto: row.nombre_completo, email: row.email, passwordHash: row.password_hash };
}

async function findByEmail(email) {
  const { rows } = await pool.query("SELECT legajo, nombre_completo, email, password_hash FROM alumno WHERE email = $1", [email]);
  return rows[0] ? mapAlumno(rows[0]) : null;
}

async function create({ legajo, nombreCompleto, email, passwordHash }) {
  const { rows } = await pool.query(
    "INSERT INTO alumno (legajo, nombre_completo, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING legajo, nombre_completo, email, password_hash",
    [legajo, nombreCompleto, email, passwordHash],
  );
  return mapAlumno(rows[0]);
}

module.exports = { findByEmail, create };
