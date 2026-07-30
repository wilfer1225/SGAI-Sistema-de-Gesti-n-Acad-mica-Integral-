const { verificarCorrelatividad } = require("../src/services/correlativaService");

describe("correlativaService.verificarCorrelatividad (RF03)", () => {
  test("un alumno que aprobó las correlativas requeridas puede inscribirse", () => {
    // Gianella (1001) aprobó [1,2,3] -> Ingeniería y Calidad de Software (4) requiere [2,3]
    const resultado = verificarCorrelatividad(1001, 4);
    expect(resultado.cumple).toBe(true);
    expect(resultado.faltantes).toEqual([]);
  });

  test("un alumno que NO aprobó las correlativas requeridas no puede inscribirse", () => {
    // Wilfer (1002) solo aprobó [1] -> Programación II (2) requiere [1]... cumple
    // pero Base de Datos (3) no tiene correlativas registradas por diseño de este ejemplo,
    // usamos Ingeniería y Calidad de Software (4) que requiere [2,3], que Wilfer no tiene.
    const resultado = verificarCorrelatividad(1002, 4);
    expect(resultado.cumple).toBe(false);
    expect(resultado.faltantes).toEqual(expect.arrayContaining([2, 3]));
  });

  test("una materia sin correlativas registradas siempre se puede cursar", () => {
    const resultado = verificarCorrelatividad(1002, 1); // Algoritmos y Estructuras de Datos
    expect(resultado.cumple).toBe(true);
  });

  test("un alumno inexistente sin historial no cumple correlativas de una materia que las requiere", () => {
    const resultado = verificarCorrelatividad(9999, 2);
    expect(resultado.cumple).toBe(false);
    expect(resultado.faltantes).toContain(1);
  });
});
