module.exports = {
  materias: [
    { idMateria: 1, nombreMateria: "Introducción a la Programación", anioCarrera: 1 },
    { idMateria: 2, nombreMateria: "Matemáticas I", anioCarrera: 1 },
    { idMateria: 3, nombreMateria: "Programación II", anioCarrera: 2 },
    { idMateria: 4, nombreMateria: "Ingeniería y Calidad de Software", anioCarrera: 3 },
  ],
  // historialAprobadas maps legajo -> array of materia IDs aprobadas (mock)
  historialAprobadas: {
    1001: [4],
  },
};
