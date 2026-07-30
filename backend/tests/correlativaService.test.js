jest.mock("../src/repositories/materiaRepository", () => ({ findCorrelativasDe: jest.fn() }));
jest.mock("../src/repositories/inscripcionRepository", () => ({ historialDe: jest.fn() }));

const materiaRepository = require("../src/repositories/materiaRepository");
const inscripcionRepository = require("../src/repositories/inscripcionRepository");
const { verificarCorrelatividad } = require("../src/services/correlativaService");

describe("correlativaService.verificarCorrelatividad (RF03)", () => {
  test("permite cuando todas las correlativas fueron aprobadas", async () => {
    materiaRepository.findCorrelativasDe.mockResolvedValue([2, 3]);
    inscripcionRepository.historialDe.mockResolvedValue([1, 2, 3]);
    await expect(verificarCorrelatividad(1001, 4)).resolves.toEqual({ cumple: true, faltantes: [] });
  });

  test("informa las correlativas faltantes", async () => {
    materiaRepository.findCorrelativasDe.mockResolvedValue([2, 3]);
    inscripcionRepository.historialDe.mockResolvedValue([1]);
    await expect(verificarCorrelatividad(1002, 4)).resolves.toEqual({ cumple: false, faltantes: [2, 3] });
  });

  test("permite una materia sin correlativas", async () => {
    materiaRepository.findCorrelativasDe.mockResolvedValue([]);
    await expect(verificarCorrelatividad(1002, 1)).resolves.toEqual({ cumple: true, faltantes: [] });
  });
});
