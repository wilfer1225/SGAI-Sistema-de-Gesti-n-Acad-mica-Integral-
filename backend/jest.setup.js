// Silencia console.error en tests para evitar output ruidoso cuando se prueban errores
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  if (console.error && console.error.mockRestore) console.error.mockRestore();
});
