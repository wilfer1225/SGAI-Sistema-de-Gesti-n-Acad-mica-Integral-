const express = require("express");
const { login } = require("../controllers/authController");
const { listarMaterias } = require("../controllers/materiaController");
const { crearInscripcion, listarInscripciones } = require("../controllers/inscripcionController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/auth/login", login);
router.get("/materias", requireAuth, listarMaterias);
router.post("/inscripcion", requireAuth, crearInscripcion);
router.get("/inscripcion/:legajo", requireAuth, listarInscripciones);

module.exports = router;
