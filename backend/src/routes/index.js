const express = require("express");
const { z } = require("zod");
const { login, register } = require("../controllers/authController");
const { listarMaterias } = require("../controllers/materiaController");
const { crearInscripcion, listarInscripciones } = require("../controllers/inscripcionController");
const { obtenerAnalitico } = require("../controllers/analiticoController");
const { obtenerAsistencias } = require("../controllers/asistenciasController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const portal = require("../controllers/portalController");

const router = express.Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });
const registerSchema = z.object({
  legajo: z.coerce.number().int().positive(), nombreCompleto: z.string().trim().min(3).max(150),
  email: z.string().email(), password: z.string().min(8).max(128),
});
const inscripcionSchema = z.object({
  legajo: z.coerce.number().int().positive(), idMateria: z.coerce.number().int().positive(),
  tipoInstancia: z.enum(["Cursada", "Final"]),
});
const legajoSchema = z.object({ legajo: z.coerce.number().int().positive() });
const idSchema = z.object({ id: z.coerce.number().int().positive() });
const comisionSchema = z.object({ idComision: z.coerce.number().int().positive() });
const mesaSchema = z.object({ idMesa: z.coerce.number().int().positive() });

router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/register", validate(registerSchema), register);
router.get("/materias", requireAuth, listarMaterias);
router.post("/inscripcion", requireAuth, validate(inscripcionSchema), crearInscripcion);
router.get("/inscripcion/:legajo", requireAuth, validate(legajoSchema, "params"), listarInscripciones);
router.get("/alumnos/:legajo/analitico", requireAuth, validate(legajoSchema, "params"), portal.analitico);
router.get("/alumnos/:legajo/asistencias", requireAuth, validate(legajoSchema, "params"), portal.asistencias);
router.get("/asistencias/:id", requireAuth, validate(idSchema, "params"), portal.detalleAsistencia);
router.get("/oferta/cursadas", requireAuth, portal.oferta);
router.get("/oferta/mesas", requireAuth, portal.mesas);
router.post("/inscripcion/cursada", requireAuth, validate(comisionSchema), portal.crearCursada);
router.post("/inscripcion/final", requireAuth, validate(mesaSchema), portal.crearFinal);
router.delete("/inscripcion/:id", requireAuth, validate(idSchema, "params"), portal.baja);

// Nuevos endpoints para Analítico y Asistencias (mocked para UI)
router.get("/analitico/:legajo", requireAuth, obtenerAnalitico);
router.get("/asistencias/:legajo", requireAuth, obtenerAsistencias);

module.exports = router;
