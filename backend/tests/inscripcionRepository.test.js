jest.mock("../src/db/pool", () => ({ query: jest.fn() }));

const pool = require("../src/db/pool");
const insRepo = require("../src/repositories/inscripcionRepository");

describe("inscripcionRepository", () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  test("historialDe devuelve lista de ids", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_materia: 2 }, { id_materia: 4 }] });
    const ids = await insRepo.historialDe(1001);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1001]);
    expect(ids).toEqual([2, 4]);
  });

  test("crear devuelve inscripcion mapeada", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          id_inscripcion: 10,
          legajo: 1001,
          id_materia: 3,
          fecha_inscripcion: "2026-01-01",
          tipo_instancia: "Cursada",
          estado: "Activa",
        },
      ],
    });
    const r = await insRepo.crear({ legajo: 1001, idMateria: 3, tipoInstancia: "Cursada" });
    expect(r.idInscripcion).toBe(10);
    expect(pool.query).toHaveBeenCalled();
  });

  test("listarPorAlumno mapea correctamente", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          id_inscripcion: 5,
          legajo: 1001,
          id_materia: 3,
          fecha_inscripcion: "2026-01-05",
          tipo_instancia: "Final",
          estado: "Activa",
        },
      ],
    });
    const list = await insRepo.listarPorAlumno(1001);
    expect(list).toHaveLength(1);
    expect(list[0].legajo).toBe(1001);
  });

  test("propaga errores", async () => {
    pool.query.mockRejectedValue(new Error("DB err"));
    await expect(insRepo.historialDe(1)).rejects.toThrow("DB err");
  });
});
