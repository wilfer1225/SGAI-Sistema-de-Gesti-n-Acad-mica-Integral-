jest.mock("../src/db/pool", () => ({ query: jest.fn() }));

const pool = require("../src/db/pool");
const alumnoRepo = require("../src/repositories/alumnoRepository");

describe("alumnoRepository", () => {
  beforeEach(() => {
    pool.query.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("debe obtener un alumno por email", async () => {
    pool.query.mockResolvedValue({ rows: [{ legajo: 1001, nombre_completo: "Alumno", email: "a@b.com", password_hash: "h" }] });

    const alumno = await alumnoRepo.findByEmail("a@b.com");

    expect(pool.query).toHaveBeenCalled();
    expect(alumno).toBeDefined();
    expect(alumno.legajo).toBe(1001);
    expect(alumno.email).toBe("a@b.com");
  });

  test("devuelve null cuando no existe el email", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const alumno = await alumnoRepo.findByEmail("noexiste@x.com");
    expect(alumno).toBeNull();
  });

  test("propaga error de la base de datos en findByEmail", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    await expect(alumnoRepo.findByEmail("a@b.com")).rejects.toThrow("DB error");
  });

  test("create inserta y devuelve el alumno creado", async () => {
    pool.query.mockResolvedValue({ rows: [{ legajo: 2002, nombre_completo: "Nuevo", email: "n@x.com", password_hash: "ph" }] });
    const nuevo = await alumnoRepo.create({ legajo: 2002, nombreCompleto: "Nuevo", email: "n@x.com", passwordHash: "ph" });
    expect(pool.query).toHaveBeenCalled();
    expect(nuevo).toBeDefined();
    expect(nuevo.legajo).toBe(2002);
  });

  test("propaga error de la base de datos en create", async () => {
    pool.query.mockRejectedValue(new Error("insert error"));
    await expect(alumnoRepo.create({ legajo: 1, nombreCompleto: "x", email: "x@x", passwordHash: "h" })).rejects.toThrow("insert error");
  });
});
