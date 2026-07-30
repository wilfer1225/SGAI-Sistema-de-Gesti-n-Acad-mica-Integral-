const materiaRepository = require("../repositories/materiaRepository");
const db = require("../db/mockData");

// GET /api/analitico/:legajo
function obtenerAnalitico(req, res) {
  const legajo = Number(req.params.legajo);
  const aprobadasIds = db.historialAprobadas[legajo] || [];

  // Mapear a objetos con información administrativa mock
  const items = aprobadasIds.map((id) => {
    const m = materiaRepository.findById(id);
    return {
      idMateria: m.idMateria,
      nombreMateria: m.nombreMateria,
      anioCarrera: m.anioCarrera,
      estado: "Aprobada",
      notaFinal: 7 + (m.idMateria % 4), // nota mock entre 7-10
      fechaAprobacion: new Date().toISOString(),
      tomo: 12 + m.idMateria,
      folio: 100 + m.idMateria,
      planEstudio: "Plan 2015",
    };
  });

  // También devolver resumen rápido
  const totalMaterias = db.materias.length;
  const aprobadas = items.length;
  const porcentajeAprobadas = Math.round((aprobadas / totalMaterias) * 100);

  return res.status(200).json({ resumen: { totalMaterias, aprobadas, porcentajeAprobadas }, materias: items });
}

module.exports = { obtenerAnalitico };