const materiaRepository = require("../repositories/materiaRepository");
const db = require("../db/mockData");

// GET /api/analitico/:legajo
async function obtenerAnalitico(req, res, next) {
  try {
    const legajo = Number(req.params.legajo);
    const aprobadasIds = db.historialAprobadas[legajo] || [];

    // Resolve materias (materiaRepository.findById is async)
    const materiasPromises = aprobadasIds.map(async (id) => {
      const m = await materiaRepository.findById(id);
      if (!m) return null;
      return {
        idMateria: m.idMateria,
        nombreMateria: m.nombreMateria,
        anioCarrera: m.anioCarrera,
        estado: "Aprobada",
        notaFinal: 7 + (m.idMateria % 4), // nota mock entre 7-10
        fechaAprobacion: new Date().toISOString(),
        tomo: `T-${m.idMateria}`,
        folio: `${100 + m.idMateria}`,
        planEstudio: "Plan 2015",
      };
    });

    const itemsAll = await Promise.all(materiasPromises);
    const items = itemsAll.filter(Boolean);

    // También devolver resumen rápido
    const totalMaterias = db.materias.length;
    const aprobadas = items.length;
    const porcentajeAprobadas = totalMaterias ? Math.round((aprobadas / totalMaterias) * 100) : 0;

    return res.status(200).json({ resumen: { totalMaterias, aprobadas, porcentajeAprobadas }, materias: items });
  } catch (e) {
    next(e);
  }
}

module.exports = { obtenerAnalitico };
