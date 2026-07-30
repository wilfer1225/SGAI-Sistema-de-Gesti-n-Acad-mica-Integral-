const db = require("../db/mockData");
const materiaRepository = require("../repositories/materiaRepository");

// GET /api/asistencias/:legajo
// Devuelve un objeto con resumen por materia y detalle de fechas (mock).
function obtenerAsistencias(req, res) {
  const legajo = Number(req.params.legajo);

  // Para simplificar usamos las materias actuales y generamos datos mock.
  const materias = db.materias.map((m) => {
    const dictadas = 40 - (m.idMateria % 5) * 2; // número de clases dictadas
    const ausentes = (m.idMateria * 3) % 10; // ausentes mock
    const presentes = Math.max(0, dictadas - ausentes);
    const porcentaje = Math.round((presentes / dictadas) * 100);

    // crear detalle de fechas de faltas (mock)
    const faltas = Array.from({ length: ausentes }).map((_, i) => ({
      fecha: new Date(Date.now() - (i + 1) * 86400000).toISOString().slice(0, 10),
      justificada: i % 2 === 0,
    }));

    return {
      idMateria: m.idMateria,
      nombreMateria: m.nombreMateria,
      anioCarrera: m.anioCarrera,
      dictadas,
      presentes,
      ausentes,
      porcentaje,
      limite: 75, // porcentaje mínimo requerido
      faltas,
    };
  });

  return res.status(200).json({ materias });
}

module.exports = { obtenerAsistencias };