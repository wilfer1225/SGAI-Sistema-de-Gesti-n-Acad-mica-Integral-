const express = require("express");
const { login } = require("../controllers/authController");
const { listarMaterias } = require("../controllers/materiaController");
const { crearInscripcion, listarInscripciones } = require("../controllers/inscripcionController");
const { obtenerAnalitico } = require("../controllers/analiticoController");
const { obtenerAsistencias } = require("../controllers/asistenciasController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/auth/login", login);
router.get("/materias", requireAuth, listarMaterias);
router.post("/inscripcion", requireAuth, crearInscripcion);
router.get("/inscripcion/:legajo", requireAuth, listarInscripciones);

// Nuevos endpoints para Analítico y Asistencias (mocked para UI)
router.get("/analitico/:legajo", requireAuth, obtenerAnalitico);
router.get("/asistencias/:legajo", requireAuth, obtenerAsistencias);

module.exports = router;
