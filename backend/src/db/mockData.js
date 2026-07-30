// Simulación de la base de datos (según el alcance definido: Admin/Docente pre-cargados).
// En producción esto se reemplaza por consultas reales a PostgreSQL (ver /database/schema.sql).

const alumnos = [
  { legajo: 1001, nombreCompleto: "Gianella Chiappello", email: "gianella@utn.edu.ar", passwordHash: "$2b$10$mockhash1" },
  { legajo: 1002, nombreCompleto: "Wilfer Florentin", email: "wilfer@utn.edu.ar", passwordHash: "$2b$10$mockhash2" },
];

const materias = [
  { idMateria: 1, nombreMateria: "Algoritmos y Estructuras de Datos", anioCarrera: 1 },
  { idMateria: 2, nombreMateria: "Programación II", anioCarrera: 2 },
  { idMateria: 3, nombreMateria: "Base de Datos", anioCarrera: 2 },
  { idMateria: 4, nombreMateria: "Ingeniería y Calidad de Software", anioCarrera: 3 },
  { idMateria: 5, nombreMateria: "Seminario Integrador", anioCarrera: 3 },
];

// Correlativas: para cursar idMateriaPrincipal se requiere tener aprobada idMateriaRequerida
const correlativas = [
  { idMateriaPrincipal: 2, idMateriaRequerida: 1 },
  { idMateriaPrincipal: 4, idMateriaRequerida: 2 },
  { idMateriaPrincipal: 4, idMateriaRequerida: 3 },
  { idMateriaPrincipal: 5, idMateriaRequerida: 4 },
];

// Historial académico simulado: materias que cada alumno ya tiene aprobadas
const historialAprobadas = {
  1001: [1, 2, 3], // Gianella: puede cursar Ingeniería y Calidad de Software (4)
  1002: [1],       // Wilfer: NO puede cursar Programación II sin más datos... (ejemplo controlado)
};

const inscripciones = [];
let nextInscripcionId = 1;

module.exports = { alumnos, materias, correlativas, historialAprobadas, inscripciones, nextInscripcionId: () => nextInscripcionId++ };
