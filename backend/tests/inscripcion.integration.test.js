const request = require("supertest");
const jwt = require("jsonwebtoken");
const { createApp } = require("../src/app");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const app = createApp();

function tokenPara(legajo) {
  return jwt.sign({ legajo }, JWT_SECRET, { expiresIn: "1h" });
}

describe("Integración: flujo de inscripción (RF01, RF03)", () => {
  test("GET /health responde 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /api/auth/login con email válido devuelve token", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "gianella@utn.edu.ar" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("POST /api/auth/login con email inválido devuelve 401", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "no-existe@utn.edu.ar" });
    expect(res.status).toBe(401);
  });

  test("GET /api/materias sin token devuelve 401", async () => {
    const res = await request(app).get("/api/materias");
    expect(res.status).toBe(401);
  });

  test("GET /api/materias con token devuelve la lista de materias", async () => {
    const res = await request(app).get("/api/materias").set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("POST /api/inscripcion cumpliendo correlativas devuelve 201", async () => {
    const res = await request(app)
      .post("/api/inscripcion")
      .set("Authorization", `Bearer ${tokenPara(1001)}`)
      .send({ legajo: 1001, idMateria: 4, tipoInstancia: "Cursada" });
    expect(res.status).toBe(201);
    expect(res.body.estado).toBe("Confirmada");
  });

  test("POST /api/inscripcion sin cumplir correlativas devuelve 403", async () => {
    const res = await request(app)
      .post("/api/inscripcion")
      .set("Authorization", `Bearer ${tokenPara(1002)}`)
      .send({ legajo: 1002, idMateria: 4, tipoInstancia: "Cursada" });
    expect(res.status).toBe(403);
    expect(res.body.faltantes).toEqual(expect.arrayContaining([2, 3]));
  });
});
