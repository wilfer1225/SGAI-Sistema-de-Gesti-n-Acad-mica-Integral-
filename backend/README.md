# SGAI Backend

API REST construida con Node.js + Express, siguiendo el patrón MVC y el Repository Pattern
(ver Sección 6.2 de la documentación).

## Configuración y base de datos

Copiá `.env.example` a `.env` y completá las credenciales. Luego creá la base y aplicá los scripts, en este orden:

```bash
createdb sgai
psql -d sgai -f ../database/schema.sql
psql -d sgai -f ../database/seed.sql
npm start
```

Alternativamente, para desarrollo local con Docker (recomendado), desde la raíz del repositorio ejecutá `docker compose up -d`. El contenedor crea la base, el esquema y los datos iniciales automáticamente; el `.env.example` ya contiene sus credenciales de desarrollo.

En producción `JWT_SECRET` es obligatorio: el servidor se niega a iniciar sin él. Los usuarios de ejemplo son `gianella@utn.edu.ar` / `Gianella2026!` y `wilfer@utn.edu.ar` / `Wilfer2026!`; reemplazarlos en cualquier entorno compartido.

## Endpoints

| Método | Ruta                     | Auth | Descripción                                   |
|--------|--------------------------|:----:|------------------------------------------------|
| GET    | /health                  | No   | Chequeo de salud del servidor                  |
| POST   | /api/auth/login          | No   | Login del alumno (devuelve JWT)                |
| POST   | /api/auth/register       | No   | Registra alumno y almacena contraseña hasheada |
| GET    | /api/materias            | Sí   | Lista de materias disponibles                  |
| POST   | /api/inscripcion         | Sí   | Crea una inscripción (valida correlatividades) |
| GET    | /api/inscripcion/:legajo | Sí   | Lista las inscripciones de un alumno           |

Todos los cuerpos se validan y los errores tienen la forma `{ "error": "..." }`. Las rutas protegidas requieren `Authorization: Bearer <token>`.

### Ejemplos

```http
POST /api/auth/login
Content-Type: application/json

{"email":"gianella@utn.edu.ar","password":"Gianella2026!"}
```

```json
{"token":"eyJ...","alumno":{"legajo":1001,"nombreCompleto":"Gianella Chiappello"}}
```

```http
POST /api/inscripcion
Authorization: Bearer eyJ...
Content-Type: application/json

{"legajo":1001,"idMateria":4,"tipoInstancia":"Cursada"}
```

## Pruebas

```bash
npm test
```

Corre pruebas unitarias de correlatividades e integración para autenticación, materias,
inscripción y cuerpos inválidos. La suite simula el pool en las pruebas HTTP: no requiere
una base de datos local ni iniciar el servidor. GitHub Actions las ejecuta en cada push y PR.
