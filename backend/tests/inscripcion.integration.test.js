jest.mock("../src/repositories/alumnoRepository", () => ({ findByEmail: jest.fn(), create: jest.fn() }));
jest.mock("../src/repositories/materiaRepository", () => ({ findAll: jest.fn(), findById: jest.fn(), findCorrelativasDe: jest.fn() }));
jest.mock("../src/repositories/inscripcionRepository", () => ({ crear: jest.fn(), listarPorAlumno: jest.fn(), historialDe: jest.fn() }));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const alumnoRepository = require("../src/repositories/alumnoRepository");
const materiaRepository = require("../src/repositories/materiaRepository");
const inscripcionRepository = require("../src/repositories/inscripcionRepository");
const { createApp } = require("../src/app");
const { getJwtSecret } = require("../src/config");

const app = createApp();
const passwordHash = bcrypt.hashSync("ClaveSegura1!", 4);
const alumno = { legajo: 1001, nombreCompleto: "Gianella Chiappello", email: "gianella@utn.edu.ar", passwordHash };
function tokenPara(legajo) { return jwt.sign({ legajo }, getJwtSecret(), { expiresIn: "1h" }); }

beforeEach(() => {
  jest.clearAllMocks();
  alumnoRepository.findByEmail.mockResolvedValue(alumno);
  materiaRepository.findAll.mockResolvedValue([{ idMateria: 1, nombreMateria: "Algoritmos", anioCarrera: 1 }]);
  materiaRepository.findById.mockResolvedValue({ idMateria: 4, nombreMateria: "Ingeniería", anioCarrera: 3 });
  materiaRepository.findCorrelativasDe.mockResolvedValue([2, 3]);
  inscripcionRepository.historialDe.mockResolvedValue([1, 2, 3]);
  inscripcionRepository.crear.mockResolvedValue({ idInscripcion: 1, legajo: 1001, idMateria: 4, tipoInstancia: "Cursada", estado: "Confirmada" });
});

describe("API", () => {
  test("login valida email y contraseña", async () => {
    const ok = await request(app).post("/api/auth/login").send({ email: alumno.email, password: "ClaveSegura1!" });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeDefined();
    const invalid = await request(app).post("/api/auth/login").send({ email: alumno.email, password: "incorrecta" });
    expect(invalid.status).toBe(401);
  });

  test("registro hashea la contraseña", async () => {
    alumnoRepository.create.mockImplementation(async (data) => ({ ...data }));
    const res = await request(app).post("/api/auth/register").send({ legajo: 2001, nombreCompleto: "Alumno Nuevo", email: "nuevo@utn.edu.ar", password: "ClaveSegura1!" });
    expect(res.status).toBe(201);
    expect(await bcrypt.compare("ClaveSegura1!", alumnoRepository.create.mock.calls[0][0].passwordHash)).toBe(true);
  });

  test("rechaza cuerpos vacíos o inválidos con 400", async () => {
    const login = await request(app).post("/api/auth/login").send({});
    const inscripcion = await request(app).post("/api/inscripcion").set("Authorization", `Bearer ${tokenPara(1001)}`).send({ legajo: 1001, idMateria: "no-numero" });
    expect(login.status).toBe(400);
    expect(inscripcion.status).toBe(400);
  });

  test("materias exige token y luego lista datos", async () => {
    expect((await request(app).get("/api/materias")).status).toBe(401);
    const res = await request(app).get("/api/materias").set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("inscripción valida correlativas y titularidad", async () => {
    const ok = await request(app).post("/api/inscripcion").set("Authorization", `Bearer ${tokenPara(1001)}`).send({ legajo: 1001, idMateria: 4, tipoInstancia: "Cursada" });
    expect(ok.status).toBe(201);
    inscripcionRepository.historialDe.mockResolvedValue([1]);
    const denied = await request(app).post("/api/inscripcion").set("Authorization", `Bearer ${tokenPara(1001)}`).send({ legajo: 1001, idMateria: 4, tipoInstancia: "Cursada" });
    expect(denied.status).toBe(403);
    expect(denied.body.faltantes).toEqual([2, 3]);
  });
});
