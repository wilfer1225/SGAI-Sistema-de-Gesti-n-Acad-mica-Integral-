jest.mock("../src/db/pool", () => ({ query: jest.fn() }));

const pool = require("../src/db/pool");
const materiaRepo = require("../src/repositories/materiaRepository");

describe("materiaRepository", () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  test("findAll devuelve lista mapeada", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { id_materia: 1, nombre_materia: "Mat I", anio_carrera: 1 },
        { id_materia: 2, nombre_materia: "Prog I", anio_carrera: 1 },
      ],
    });

    const res = await materiaRepo.findAll();
    expect(pool.query).toHaveBeenCalled();
    expect(res).toHaveLength(2);
    expect(res[0].idMateria).toBe(1);
  });

  test("findById devuelve objeto o null", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id_materia: 3, nombre_materia: "X", anio_carrera: 2 }] });
    let m = await materiaRepo.findById(3);
    expect(m).toBeDefined();
    expect(m.idMateria).toBe(3);

    pool.query.mockResolvedValueOnce({ rows: [] });
    m = await materiaRepo.findById(9999);
    expect(m).toBeNull();
  });

  test("findCorrelativasDe devuelve array de ids", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_materia_requerida: 1 }, { id_materia_requerida: 2 }] });
    const arr = await materiaRepo.findCorrelativasDe(4);
    expect(arr).toEqual([1, 2]);
  });

  test("propaga errores de DB", async () => {
    pool.query.mockRejectedValue(new Error("DB fail"));
    await expect(materiaRepo.findAll()).rejects.toThrow("DB fail");
  });
});
