jest.mock("../src/db/pool", () => ({ query: jest.fn() }));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const pool = require("../src/db/pool");
const { createApp } = require("../src/app");
const { getJwtSecret } = require("../src/config");

const app = createApp();
function tokenPara(legajo) {
  return jwt.sign({ legajo }, getJwtSecret(), { expiresIn: "1h" });
}

beforeEach(() => {
  pool.query.mockReset();
});

describe("Portal - Mi Analítico (RF02)", () => {
  test("deniega el acceso al analítico de otro legajo", async () => {
    const res = await request(app)
      .get("/api/alumnos/9999/analitico")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("devuelve el resumen de avance y el listado de materias del propio alumno", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            idMateria: 4,
            nombreMateria: "Ingeniería y Calidad de Software",
            anioCarrera: 3,
            estado: "Aprobada",
            notaFinal: 8,
            fechaAprobacion: "2025-12-15",
            tomo: "T-2025",
            folio: "052",
            desbloquea: [5],
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ total: "5", aprobadas: "3", promedio: "7.67" }],
      });

    const res = await request(app)
      .get("/api/alumnos/1001/analitico")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);

    expect(res.status).toBe(200);
    expect(res.body.resumen).toEqual({
      total: 5,
      aprobadas: 3,
      avance: 60,
      promedio: "7.67",
    });
    expect(res.body.materias).toHaveLength(1);
    expect(res.body.materias[0].tomo).toBe("T-2025");
  });

  test("si la base de datos falla, responde 500 en vez de colgar la petición (errorMiddleware)", async () => {
    pool.query.mockRejectedValueOnce(new Error("connection timeout"));
    const res = await request(app)
      .get("/api/alumnos/1001/analitico")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe("Manejo global de errores (errorMiddleware)", () => {
  test("una ruta inexistente responde 404", async () => {
    const res = await request(app).get("/api/esto-no-existe");
    expect(res.status).toBe(404);
  });

  test("un body con JSON malformado responde 400, no 500", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ esto no es json valido");
    expect(res.status).toBe(400);
  });
});

describe("Portal - Mis Asistencias (RF05)", () => {
  test("deniega el acceso a asistencias de otro legajo", async () => {
    const res = await request(app)
      .get("/api/alumnos/9999/asistencias")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("devuelve el panel de asistencia por comisión con el % calculado", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          idComision: 1,
          nombreMateria: "Ingeniería y Calidad de Software",
          nombre: "Comisión A",
          diasHorarios: "Lunes y jueves · 19:00 a 22:00",
          clases: "5",
          presentes: "4",
          ausentes: "1",
          porcentaje: "80",
        },
      ],
    });
    const res = await request(app)
      .get("/api/alumnos/1001/asistencias")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(200);
    expect(res.body[0].porcentaje).toBe("80");
  });

  test("devuelve el detalle de fechas de una comisión, con justificación", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { fecha: "2026-07-15", estado: "Ausente", justificada: true },
        { fecha: "2026-07-08", estado: "Ausente", justificada: false },
      ],
    });
    const res = await request(app)
      .get("/api/asistencias/1")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].justificada).toBe(true);
  });
});

describe("Portal - Oferta de Cursadas y Finales (RF03/RF04)", () => {
  test("la oferta de cursadas viene pre-filtrada por correlativas, con cupos", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          idComision: 1,
          idMateria: 4,
          nombreMateria: "Ingeniería y Calidad de Software",
          nombre: "Comisión A",
          diasHorarios: "Lunes y jueves",
          docente: "Ing. María López",
          cupos: "5",
        },
      ],
    });
    const res = await request(app)
      .get("/api/oferta/cursadas")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(200);
    expect(res.body[0].cupos).toBe("5");
    expect(res.body[0].docente).toBe("Ing. María López");
  });

  test("las mesas de examen exponen la condición (Regular/Libre) del alumno", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          idMesa: 1,
          nombreMateria: "Programación II",
          fechaHora: "2026-11-18T18:00:00.000Z",
          aula: "Aula 12",
          tribunal: "Presidente: Ing. López · Vocales: Ing. Pérez, Ing. Díaz",
          fechaLimiteBaja: "2026-11-16T18:00:00.000Z",
          condicion: "Regular",
        },
      ],
    });
    const res = await request(app)
      .get("/api/oferta/mesas")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(200);
    expect(res.body[0].condicion).toBe("Regular");
  });
});

describe("Portal - Inscripción a Cursada (control de cupos)", () => {
  test("rechaza la inscripción con 409 cuando no hay cupos disponibles", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id_materia: 4,
          nombre_materia: "Ingeniería y Calidad de Software",
          cupos: "0",
        },
      ],
    });
    const res = await request(app)
      .post("/api/inscripcion/cursada")
      .set("Authorization", `Bearer ${tokenPara(1001)}`)
      .send({ idComision: 1 });
    expect(res.status).toBe(409);
  });

  test("inscribe y devuelve un comprobante cuando hay cupo disponible", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id_materia: 4,
            nombre_materia: "Ingeniería y Calidad de Software",
            cupos: "5",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ idInscripcion: 10, comprobante: "a1b2c3d4e5f6" }],
      });
    const res = await request(app)
      .post("/api/inscripcion/cursada")
      .set("Authorization", `Bearer ${tokenPara(1001)}`)
      .send({ idComision: 1 });
    expect(res.status).toBe(201);
    expect(res.body.comprobante).toBe("a1b2c3d4e5f6");
    expect(res.body.materia).toBe("Ingeniería y Calidad de Software");
  });

  test("rechaza con 400 si idComision no es un número válido", async () => {
    const res = await request(app)
      .post("/api/inscripcion/cursada")
      .set("Authorization", `Bearer ${tokenPara(1001)}`)
      .send({ idComision: "no-numero" });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("Portal - Inscripción a Final (condición Regular/Libre)", () => {
  test("devuelve 404 si la mesa de examen no existe", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post("/api/inscripcion/final")
      .set("Authorization", `Bearer ${tokenPara(1001)}`)
      .send({ idMesa: 999 });
    expect(res.status).toBe(404);
  });

  test("inscribe detectando automáticamente la condición del alumno", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id_materia: 2, condicion: "Regular" }],
      })
      .mockResolvedValueOnce({
        rows: [{ idInscripcion: 11, comprobante: "f6e5d4c3b2a1" }],
      });
    const res = await request(app)
      .post("/api/inscripcion/final")
      .set("Authorization", `Bearer ${tokenPara(1001)}`)
      .send({ idMesa: 1 });
    expect(res.status).toBe(201);
    expect(res.body.comprobante).toBe("f6e5d4c3b2a1");
  });
});

describe("Portal - Baja de inscripción a Final (respeta el plazo del reglamento)", () => {
  test("devuelve 409 si la baja ya no está disponible (fuera de plazo, ajena, o inexistente)", async () => {
    pool.query.mockResolvedValueOnce({ rowCount: 0 });
    const res = await request(app)
      .delete("/api/inscripcion/5")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(409);
  });

  test("da de baja correctamente una inscripción propia dentro del plazo", async () => {
    pool.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id_inscripcion: 5 }],
    });
    const res = await request(app)
      .delete("/api/inscripcion/5")
      .set("Authorization", `Bearer ${tokenPara(1001)}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
