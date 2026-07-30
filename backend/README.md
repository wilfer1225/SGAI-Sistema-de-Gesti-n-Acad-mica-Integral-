# SGAI Backend

API REST construida con Node.js + Express, siguiendo el patrón MVC y el Repository Pattern
(ver Sección 6.2 de la documentación).

## Endpoints

| Método | Ruta                     | Auth | Descripción                                   |
|--------|--------------------------|:----:|------------------------------------------------|
| GET    | /health                  | No   | Chequeo de salud del servidor                  |
| POST   | /api/auth/login          | No   | Login del alumno (devuelve JWT)                |
| GET    | /api/materias            | Sí   | Lista de materias disponibles                  |
| POST   | /api/inscripcion         | Sí   | Crea una inscripción (valida correlatividades) |
| GET    | /api/inscripcion/:legajo | Sí   | Lista las inscripciones de un alumno           |

## Pruebas

```bash
npm test
```

Corre `tests/correlativaService.test.js` (unitarias sobre la lógica de negocio, RF03) y
`tests/inscripcion.integration.test.js` (integración end-to-end sobre los endpoints con
Supertest, sin necesidad de levantar el servidor). Ver evidencia de ejecución en
`/docs/test_output.txt` y en la Sección 7.6 de la documentación del proyecto.
