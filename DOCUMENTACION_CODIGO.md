# SGAI — Estructura y código fuente

Este documento reúne la estructura funcional y el código fuente del proyecto **SGAI (Sistema de Gestión Académica Integral)**. El backend expone una API REST en Node.js/Express; el frontend es una aplicación Flutter que la consume. La persistencia se simula en memoria durante desarrollo, aunque se incluye el modelo PostgreSQL.

> No se incluyen directorios o archivos generados: `node_modules/`, `frontend/.dart_tool/`, `package-lock.json`, `pubspec.lock`, cachés y archivos de navegador. Se regeneran con `npm install` o `flutter pub get`.

## Estructura

```text
SGAI_repositorio/
├── README.md
├── DOCUMENTACION_CODIGO.md                 # Este documento
├── backend/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── inscripcionController.js
│   │   │   └── materiaController.js
│   │   ├── db/mockData.js
│   │   ├── middleware/authMiddleware.js
│   │   ├── repositories/
│   │   │   ├── inscripcionRepository.js
│   │   │   └── materiaRepository.js
│   │   ├── routes/index.js
│   │   └── services/correlativaService.js
│   └── tests/
│       ├── correlativaService.test.js
│       └── inscripcion.integration.test.js
├── frontend/
│   ├── pubspec.yaml
│   └── lib/
│       ├── main.dart
│       ├── models/{alumno.dart,materia.dart}
│       ├── screens/
│       │   ├── analitico/analitico_screen.dart
│       │   ├── asistencias/asistencias_screen.dart
│       │   ├── inscripcion/inscripcion_screen.dart
│       │   └── login/login_screen.dart
│       └── services/api_service.dart
├── database/{schema.sql,seed.sql}
└── docs/test_output.txt
```

## Visión rápida

| Componente | Responsabilidad |
| --- | --- |
| Backend | Autenticación JWT, materias e inscripción con control de correlatividades. |
| Repositories | Aíslan el acceso a datos; actualmente usan `mockData.js`. |
| Service | Centraliza la regla de negocio para validar correlatividades. |
| Frontend | Login y pantalla de inscripción; analítico y asistencias están como pantallas iniciales. |
| Database | DDL y datos semilla PostgreSQL para reemplazar la simulación en memoria. |

## Código de la raíz

### `README.md`

Descripción general, instrucciones de ejecución y explicación de la arquitectura.

~~~~md
# SGAI — Sistema de Gestión Académica Integral

Proyecto del Seminario Integrador — Ingeniería en Sistemas, UTN Facultad Regional Venado Tuerto.
Autores: Gianella Ariadna Chiappello, Wilfer Reyel Florentin Cabrera.

Plataforma de autogestión académica que permite al Alumno iniciar sesión, consultar su analítico,
inscribirse a cursadas y finales (validando correlatividades) y revisar sus asistencias.
El alcance del proyecto simula los datos de Administrador/Docente pre-cargados en base de datos
(ver Sección 3 de la documentación).

## Cómo correr el backend localmente

```bash
cd backend
npm install
npm start
npm test
```

## Cómo correr el frontend localmente

```bash
cd frontend
flutter pub get
flutter run -d chrome
```

## Base de datos

El esquema PostgreSQL está en `database/schema.sql` y los datos de ejemplo en
`database/seed.sql`. Para desarrollo y pruebas, el backend usa `src/db/mockData.js`.
~~~~

## Backend

La API utiliza Express, JWT y el patrón Repository. Los controllers atienden HTTP, los repositories acceden a datos y el service aplica las correlatividades.

### `backend/package.json`

Define dependencias y comandos para iniciar, desarrollar y ejecutar pruebas.

```json
{
  "name": "sgai-backend",
  "version": "0.1.0",
  "description": "Backend del Sistema de Gestión Académica Integral (SGAI) - UTN FRVT",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.6",
    "express": "^4.22.2",
    "jsonwebtoken": "^9.0.3"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.2.2"
  }
}
```

### `backend/src/app.js`

Crea la aplicación Express, habilita JSON y registra las rutas.

```js
const express = require("express");
const routes = require("./routes");

function createApp() {
  const app = express();
  const cors = require("cors");
  app.use(express.json());
  app.use("/api", routes);
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  return app;
}

module.exports = { createApp };
```

### `backend/src/server.js`

Punto de entrada: levanta la API en el puerto indicado por `PORT` o en el 3000.

```js
const { createApp } = require("./app");

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`SGAI backend escuchando en http://localhost:${PORT}`);
});
```

### `backend/src/routes/index.js`

Declara los endpoints y aplica autenticación a las rutas privadas.

```js
const express = require("express");
const { login } = require("../controllers/authController");
const { listarMaterias } = require("../controllers/materiaController");
const { crearInscripcion, listarInscripciones } = require("../controllers/inscripcionController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/auth/login", login);
router.get("/materias", requireAuth, listarMaterias);
router.post("/inscripcion", requireAuth, crearInscripcion);
router.get("/inscripcion/:legajo", requireAuth, listarInscripciones);

module.exports = router;
```

### `backend/src/controllers/authController.js`

Busca al alumno por correo y devuelve un JWT. En este alcance la contraseña no se verifica contra un hash real.

```js
const jwt = require("jsonwebtoken");
const { alumnos } = require("../db/mockData");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function login(req, res) {
  const { email } = req.body;
  const alumno = alumnos.find((a) => a.email === email);
  if (!alumno) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }
  const token = jwt.sign({ legajo: alumno.legajo, email: alumno.email }, JWT_SECRET, { expiresIn: "2h" });
  return res.status(200).json({ token, alumno: { legajo: alumno.legajo, nombreCompleto: alumno.nombreCompleto } });
}

module.exports = { login };
```

### `backend/src/controllers/materiaController.js`

Entrega el catálogo de materias.

```js
const materiaRepository = require("../repositories/materiaRepository");

function listarMaterias(req, res) {
  return res.status(200).json(materiaRepository.findAll());
}

module.exports = { listarMaterias };
```

### `backend/src/controllers/inscripcionController.js`

Valida existencia de la materia y correlatividades antes de crear la inscripción.

```js
const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");
const correlativaService = require("../services/correlativaService");

function crearInscripcion(req, res) {
  const { legajo, idMateria, tipoInstancia } = req.body;
  const materia = materiaRepository.findById(idMateria);
  if (!materia) return res.status(404).json({ error: "La materia solicitada no existe." });

  const { cumple, faltantes } = correlativaService.verificarCorrelatividad(legajo, idMateria);
  if (!cumple) {
    return res.status(403).json({ error: "No cumple las correlatividades requeridas.", faltantes });
  }
  const inscripcion = inscripcionRepository.crear({ legajo, idMateria, tipoInstancia });
  return res.status(201).json(inscripcion);
}

function listarInscripciones(req, res) {
  const legajo = Number(req.params.legajo);
  return res.status(200).json(inscripcionRepository.listarPorAlumno(legajo));
}

module.exports = { crearInscripcion, listarInscripciones };
```

### `backend/src/middleware/authMiddleware.js`

Exige y verifica un token Bearer JWT.

```js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token no provisto." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

module.exports = { requireAuth };
```

### `backend/src/db/mockData.js`

Representa la base de datos en memoria utilizada por la API durante desarrollo.

```js
const alumnos = [
  { legajo: 1001, nombreCompleto: "Gianella Chiappello", email: "gianella@utn.edu.ar", passwordHash: "$2b$10$mockhash1" },
  { legajo: 1002, nombreCompleto: "Wilfer Florentin", email: "wilfer@utn.edu.ar", passwordHash: "$2b$10$mockhash2" },
];
const materias = [
  { idMateria: 1, nombreMateria: "Algoritmos y Estructuras de Datos", anioCarrera: 1 },
  { idMateria: 2, nombreMateria: "Programación II", anioCarrera: 2 },
  { idMateria: 3, nombreMateria: "Base de Datos", anioCarrera: 2 },
  { idMateria: 4, nombreMateria: "Ingeniería y Calidad de Software", anioCarrera: 3 },
  { idMateria: 5, nombreMateria: "Seminario Integrador", anioCarrera: 3 },
];
const correlativas = [
  { idMateriaPrincipal: 2, idMateriaRequerida: 1 },
  { idMateriaPrincipal: 4, idMateriaRequerida: 2 },
  { idMateriaPrincipal: 4, idMateriaRequerida: 3 },
  { idMateriaPrincipal: 5, idMateriaRequerida: 4 },
];
const historialAprobadas = { 1001: [1, 2, 3], 1002: [1] };
const inscripciones = [];
let nextInscripcionId = 1;

module.exports = { alumnos, materias, correlativas, historialAprobadas, inscripciones, nextInscripcionId: () => nextInscripcionId++ };
```

### `backend/src/repositories/materiaRepository.js`

Encapsula las consultas de materias y correlatividades.

```js
const { materias, correlativas } = require("../db/mockData");

function findAll() {
  return materias;
}
function findById(idMateria) {
  return materias.find((m) => m.idMateria === idMateria) || null;
}
function findCorrelativasDe(idMateria) {
  return correlativas
    .filter((c) => c.idMateriaPrincipal === idMateria)
    .map((c) => c.idMateriaRequerida);
}

module.exports = { findAll, findById, findCorrelativasDe };
```

### `backend/src/repositories/inscripcionRepository.js`

Obtiene el historial y crea/lista inscripciones en la fuente de datos actual.

```js
const db = require("../db/mockData");

function historialDe(legajo) {
  return db.historialAprobadas[legajo] || [];
}
function crear({ legajo, idMateria, tipoInstancia }) {
  const nueva = {
    idInscripcion: db.nextInscripcionId(),
    legajo,
    idMateria,
    fechaInscripcion: new Date().toISOString(),
    tipoInstancia,
    estado: "Confirmada",
  };
  db.inscripciones.push(nueva);
  return nueva;
}
function listarPorAlumno(legajo) {
  return db.inscripciones.filter((i) => i.legajo === legajo);
}

module.exports = { historialDe, crear, listarPorAlumno };
```

### `backend/src/services/correlativaService.js`

Implementa RF03: compara las materias requeridas con el historial aprobado del alumno.

```js
const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");

function verificarCorrelatividad(legajo, idMateria) {
  const requeridas = materiaRepository.findCorrelativasDe(idMateria);
  if (requeridas.length === 0) return { cumple: true, faltantes: [] };
  const aprobadas = new Set(inscripcionRepository.historialDe(legajo));
  const faltantes = requeridas.filter((idReq) => !aprobadas.has(idReq));
  return { cumple: faltantes.length === 0, faltantes };
}

module.exports = { verificarCorrelatividad };
```

### `backend/tests/correlativaService.test.js`

Pruebas unitarias de la regla de correlatividades.

```js
const { verificarCorrelatividad } = require("../src/services/correlativaService");

describe("correlativaService.verificarCorrelatividad (RF03)", () => {
  test("un alumno que aprobó las correlativas requeridas puede inscribirse", () => {
    expect(verificarCorrelatividad(1001, 4)).toEqual({ cumple: true, faltantes: [] });
  });
  test("un alumno sin correlativas aprobadas no puede inscribirse", () => {
    const resultado = verificarCorrelatividad(1002, 4);
    expect(resultado.cumple).toBe(false);
    expect(resultado.faltantes).toEqual(expect.arrayContaining([2, 3]));
  });
  test("una materia sin correlativas registradas siempre se puede cursar", () => {
    expect(verificarCorrelatividad(1002, 1).cumple).toBe(true);
  });
  test("un alumno inexistente no cumple una materia que requiere correlativas", () => {
    expect(verificarCorrelatividad(9999, 2).faltantes).toContain(1);
  });
});
```

### `backend/tests/inscripcion.integration.test.js`

Pruebas de integración de salud, login, autorización y flujo de inscripción.

```js
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
  });
  test("POST /api/auth/login con email válido devuelve token", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "gianella@utn.edu.ar" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
  test("GET /api/materias sin token devuelve 401", async () => {
    expect((await request(app).get("/api/materias")).status).toBe(401);
  });
  test("POST /api/inscripcion cumpliendo correlativas devuelve 201", async () => {
    const res = await request(app).post("/api/inscripcion")
      .set("Authorization", `Bearer ${tokenPara(1001)}`)
      .send({ legajo: 1001, idMateria: 4, tipoInstancia: "Cursada" });
    expect(res.status).toBe(201);
  });
  test("POST /api/inscripcion sin correlativas devuelve 403", async () => {
    const res = await request(app).post("/api/inscripcion")
      .set("Authorization", `Bearer ${tokenPara(1002)}`)
      .send({ legajo: 1002, idMateria: 4, tipoInstancia: "Cursada" });
    expect(res.status).toBe(403);
  });
});
```

## Frontend

La aplicación Flutter inicia en Login, centraliza las llamadas HTTP en `ApiService` y modela alumno y materia.

### `frontend/pubspec.yaml`

Configura Flutter y las dependencias HTTP, Provider y almacenamiento seguro.

```yaml
name: sgai_app
description: Frontend Flutter del Sistema de Gestión Académica Integral (SGAI) - UTN FRVT
publish_to: "none"
version: 0.1.0
environment:
  sdk: ">=3.3.0 <4.0.0"
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.1
  provider: ^6.1.2
  flutter_secure_storage: ^9.2.2
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
flutter:
  uses-material-design: true
```

### `frontend/lib/main.dart`

Configura el tema Material y la pantalla inicial.

```dart
import 'package:flutter/material.dart';
import 'screens/login/login_screen.dart';

void main() => runApp(const SgaiApp());

class SgaiApp extends StatelessWidget {
  const SgaiApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SGAI',
      theme: ThemeData(colorSchemeSeed: const Color(0xFF1F3864), useMaterial3: true),
      home: const LoginScreen(),
    );
  }
}
```

### `frontend/lib/models/alumno.dart`

Modelo de alumno recibido desde la API.

```dart
class Alumno {
  final int legajo;
  final String nombreCompleto;
  Alumno({required this.legajo, required this.nombreCompleto});
  factory Alumno.fromJson(Map<String, dynamic> json) =>
      Alumno(legajo: json['legajo'] as int, nombreCompleto: json['nombreCompleto'] as String);
}
```

### `frontend/lib/models/materia.dart`

Modelo tipado de una materia.

```dart
class Materia {
  final int idMateria;
  final String nombreMateria;
  final int anioCarrera;
  Materia({required this.idMateria, required this.nombreMateria, required this.anioCarrera});
  factory Materia.fromJson(Map<String, dynamic> json) => Materia(
    idMateria: json['idMateria'] as int,
    nombreMateria: json['nombreMateria'] as String,
    anioCarrera: json['anioCarrera'] as int,
  );
}
```

### `frontend/lib/services/api_service.dart`

Cliente HTTP centralizado: inicia sesión, conserva el JWT en memoria y consume materias/inscripciones.

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl;
  String? _token;
  ApiService({required this.baseUrl});
  void setToken(String token) => _token = token;
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<Map<String, dynamic>> login(String email) async {
    final res = await http.post(Uri.parse('$baseUrl/api/auth/login'),
      headers: _headers, body: jsonEncode({'email': email}));
    if (res.statusCode != 200) throw Exception('Credenciales inválidas');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
  Future<List<dynamic>> getMaterias() async {
    final res = await http.get(Uri.parse('$baseUrl/api/materias'), headers: _headers);
    if (res.statusCode != 200) throw Exception('Error al obtener materias');
    return jsonDecode(res.body) as List<dynamic>;
  }
  Future<Map<String, dynamic>> inscribirse(int legajo, int idMateria, String tipoInstancia) async {
    final res = await http.post(Uri.parse('$baseUrl/api/inscripcion'), headers: _headers,
      body: jsonEncode({'legajo': legajo, 'idMateria': idMateria, 'tipoInstancia': tipoInstancia}));
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 403) throw Exception('No cumple correlativas: ${body['faltantes']}');
    if (res.statusCode != 201) throw Exception('Error al inscribirse');
    return body;
  }
}
```

### `frontend/lib/screens/login/login_screen.dart`

Solicita el correo institucional y almacena el token tras el login; la navegación posterior está pendiente.

```dart
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}
class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _api = ApiService(baseUrl: 'http://localhost:3000');
  String? _error;
  Future<void> _login() async {
    try {
      final result = await _api.login(_emailController.text.trim());
      _api.setToken(result['token'] as String);
      // TODO: navegar a Analítico pasando el ApiService autenticado.
    } catch (e) {
      setState(() => _error = 'No se pudo iniciar sesión. Verificá tus credenciales.');
    }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 400),
      child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Text('SGAI', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email institucional')),
        const SizedBox(height: 16),
        if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
        const SizedBox(height: 16),
        FilledButton(onPressed: _login, child: const Text('Iniciar sesión')),
      ]))),
    ),
  );
}
```

### `frontend/lib/screens/inscripcion/inscripcion_screen.dart`

Carga materias y permite solicitar una inscripción a cursada mediante la API.

```dart
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/materia.dart';

class InscripcionScreen extends StatefulWidget {
  final ApiService api;
  const InscripcionScreen({super.key, required this.api});
  @override
  State<InscripcionScreen> createState() => _InscripcionScreenState();
}
class _InscripcionScreenState extends State<InscripcionScreen> {
  List<Materia> _materias = [];
  String? _mensaje;
  @override
  void initState() { super.initState(); _cargarMaterias(); }
  Future<void> _cargarMaterias() async {
    final data = await widget.api.getMaterias();
    setState(() => _materias = data.map((m) => Materia.fromJson(m)).toList());
  }
  Future<void> _inscribirse(int idMateria) async {
    try {
      await widget.api.inscribirse(1001, idMateria, 'Cursada');
      setState(() => _mensaje = 'Inscripción confirmada.');
    } catch (e) { setState(() => _mensaje = e.toString()); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Inscripción a Cursadas')),
    body: Column(children: [
      if (_mensaje != null) Padding(padding: const EdgeInsets.all(8), child: Text(_mensaje!)),
      Expanded(child: ListView.builder(itemCount: _materias.length, itemBuilder: (context, i) {
        final m = _materias[i];
        return ListTile(title: Text(m.nombreMateria), subtitle: Text('Año ${m.anioCarrera}'),
          trailing: ElevatedButton(onPressed: () => _inscribirse(m.idMateria), child: const Text('Inscribirse')));
      })),
    ]),
  );
}
```

### `frontend/lib/screens/analitico/analitico_screen.dart`

Pantalla base para RF02; todavía no consulta ni muestra datos académicos.

```dart
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class AnaliticoScreen extends StatelessWidget {
  final ApiService api;
  const AnaliticoScreen({super.key, required this.api});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Mi Analítico')),
    body: const Center(child: Text('Listado de materias aprobadas/pendientes (a implementar).')),
  );
}
```

### `frontend/lib/screens/asistencias/asistencias_screen.dart`

Pantalla base para RF05; la funcionalidad de asistencias está pendiente.

```dart
import 'package:flutter/material.dart';

class AsistenciasScreen extends StatelessWidget {
  const AsistenciasScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Mis Asistencias')),
    body: const Center(child: Text('Registro de asistencias por materia (a implementar).')),
  );
}
```

## Base de datos

Estos scripts modelan la persistencia PostgreSQL. El backend actual no los consulta aún: opera contra los datos mock.

### `database/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS alumno (
    legajo INTEGER PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS materia (
    id_materia SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(150) NOT NULL,
    anio_carrera SMALLINT NOT NULL CHECK (anio_carrera BETWEEN 1 AND 5)
);
CREATE TABLE IF NOT EXISTS correlativa (
    id_materia_principal INTEGER NOT NULL REFERENCES materia(id_materia),
    id_materia_requerida INTEGER NOT NULL REFERENCES materia(id_materia),
    PRIMARY KEY (id_materia_principal, id_materia_requerida)
);
CREATE TABLE IF NOT EXISTS inscripcion (
    id_inscripcion SERIAL PRIMARY KEY,
    legajo INTEGER NOT NULL REFERENCES alumno(legajo),
    id_materia INTEGER NOT NULL REFERENCES materia(id_materia),
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo_instancia VARCHAR(20) NOT NULL CHECK (tipo_instancia IN ('Cursada', 'Final')),
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada'
      CHECK (estado IN ('Confirmada', 'Rechazada', 'Anulada'))
);
CREATE INDEX IF NOT EXISTS idx_inscripcion_legajo ON inscripcion(legajo);
CREATE INDEX IF NOT EXISTS idx_inscripcion_materia ON inscripcion(id_materia);
```

### `database/seed.sql`

```sql
INSERT INTO alumno (legajo, nombre_completo, email, password_hash) VALUES
  (1001, 'Gianella Chiappello', 'gianella@utn.edu.ar', '$2b$10$mockhash1'),
  (1002, 'Wilfer Florentin', 'wilfer@utn.edu.ar', '$2b$10$mockhash2')
ON CONFLICT DO NOTHING;
INSERT INTO materia (id_materia, nombre_materia, anio_carrera) VALUES
  (1, 'Algoritmos y Estructuras de Datos', 1),
  (2, 'Programación II', 2), (3, 'Base de Datos', 2),
  (4, 'Ingeniería y Calidad de Software', 3), (5, 'Seminario Integrador', 3)
ON CONFLICT DO NOTHING;
INSERT INTO correlativa (id_materia_principal, id_materia_requerida) VALUES
  (2, 1), (4, 2), (4, 3), (5, 4)
ON CONFLICT DO NOTHING;
```

## Endpoints disponibles

| Método | Ruta | Autenticación | Propósito |
| --- | --- | --- | --- |
| GET | `/health` | No | Comprueba que el servidor responde. |
| POST | `/api/auth/login` | No | Inicia sesión por correo y entrega JWT. |
| GET | `/api/materias` | Sí | Lista materias disponibles. |
| POST | `/api/inscripcion` | Sí | Crea una inscripción tras validar correlatividades. |
| GET | `/api/inscripcion/:legajo` | Sí | Lista inscripciones de un alumno. |

## Estado actual y consideraciones

- El login identifica al alumno solo por email: la verificación de contraseña con `bcrypt.compare` está pendiente.
- El token JWT se mantiene en memoria en Flutter; `flutter_secure_storage` está declarado pero aún no se usa.
- La pantalla de inscripción utiliza provisionalmente el legajo `1001`; debe obtenerse del usuario autenticado.
- Las pantallas de analítico y asistencias son esqueletos, y sus endpoints aún no existen.
- Para producción, los repositories deben reemplazar los datos mock por consultas PostgreSQL.
+

## Anexo — copias literales de los archivos fuente

Esta sección es la referencia íntegra del código actual. Las secciones anteriores lo explican de forma resumida.

### `README.md`

~~~~md
# SGAI — Sistema de Gestión Académica Integral

Proyecto del Seminario Integrador — Ingeniería en Sistemas, UTN Facultad Regional Venado Tuerto.
Autores: Gianella Ariadna Chiappello, Wilfer Reyel Florentin Cabrera.

Plataforma de autogestión académica que permite al Alumno iniciar sesión, consultar su analítico,
inscribirse a cursadas y finales (validando correlatividades) y revisar sus asistencias.
El alcance del proyecto simula los datos de Administrador/Docente pre-cargados en base de datos
(ver Sección 3 de la documentación).

## Estructura del repositorio

```
sgai/
├── backend/          # API REST — Node.js + Express (MVC + Repository Pattern)
│   ├── src/
│   │   ├── controllers/    # Manejan las peticiones HTTP
│   │   ├── repositories/   # Acceso a datos (aísla las consultas SQL)
│   │   ├── services/       # Lógica de negocio (ej. validación de correlativas)
│   │   ├── middleware/     # Autenticación JWT
│   │   ├── routes/         # Definición de endpoints
│   │   └── db/             # Datos simulados (mock) para este alcance académico
│   └── tests/         # Pruebas unitarias y de integración (Jest + Supertest)
├── frontend/          # App Flutter (Web & Mobile)
│   └── lib/
│       ├── screens/    # Una carpeta por módulo funcional (login, analítico, inscripción, asistencias)
│       ├── models/     # Modelos de datos (Alumno, Materia, ...)
│       └── services/   # Cliente HTTP hacia el backend
├── database/          # Esquema SQL (DDL) y datos de ejemplo para PostgreSQL
└── docs/              # Documentación del proyecto (evidencia de pruebas, etc.)
```

## Cómo correr el backend localmente

```bash
cd backend
npm install
npm start          # levanta el servidor en http://localhost:3000
npm test           # corre las pruebas unitarias + integración con cobertura
```

## Cómo correr el frontend localmente

```bash
cd frontend
flutter pub get
flutter run -d chrome     # o -d <dispositivo> para mobile
```

## Base de datos

El esquema real (PostgreSQL) está en `database/schema.sql`, con datos de ejemplo en
`database/seed.sql`. El backend, en este alcance académico, usa datos simulados en memoria
(`backend/src/db/mockData.js`) para no requerir una instancia de PostgreSQL corriendo durante
el desarrollo y las pruebas — la migración a PostgreSQL real solo implica reemplazar las
funciones de `src/repositories/` por consultas SQL, sin tocar controllers ni services
(gracias al Repository Pattern).

## Metodología

Se trabaja con Scrum, en sprints de 2 semanas, según el detalle de la Sección 7.2 de la
documentación del proyecto.
~~~~

### `backend/README.md`

~~~~md
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
~~~~

### `backend/package.json`

```json
{
  "name": "sgai-backend",
  "version": "0.1.0",
  "description": "Backend del Sistema de Gestión Académica Integral (SGAI) - UTN FRVT",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest --coverage"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.6",
    "express": "^4.22.2",
    "jsonwebtoken": "^9.0.3"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.2.2"
  }
}
```

### `backend/src/app.js`

```js
const express = require("express");
const routes = require("./routes");

function createApp() {
  const app = express();
  const cors = require("cors");
  app.use(express.json());
  app.use("/api", routes);
  app.get("/health", (req, res) => res.json({ status: "ok" }));
  return app;
}

module.exports = { createApp };
```

### `backend/src/server.js`

```js
const { createApp } = require("./app");

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`SGAI backend escuchando en http://localhost:${PORT}`);
});
```

### `backend/src/routes/index.js`

```js
const express = require("express");
const { login } = require("../controllers/authController");
const { listarMaterias } = require("../controllers/materiaController");
const { crearInscripcion, listarInscripciones } = require("../controllers/inscripcionController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/auth/login", login);
router.get("/materias", requireAuth, listarMaterias);
router.post("/inscripcion", requireAuth, crearInscripcion);
router.get("/inscripcion/:legajo", requireAuth, listarInscripciones);

module.exports = router;
```

### `backend/src/controllers/authController.js`

```js
const jwt = require("jsonwebtoken");
const { alumnos } = require("../db/mockData");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// POST /api/auth/login  { email, password }
// NOTA: en este scope académico el password no se verifica contra bcrypt real
// (los hashes en mockData son ficticios); en producción se usaría bcrypt.compare().
function login(req, res) {
  const { email } = req.body;
  const alumno = alumnos.find((a) => a.email === email);
  if (!alumno) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }
  const token = jwt.sign({ legajo: alumno.legajo, email: alumno.email }, JWT_SECRET, { expiresIn: "2h" });
  return res.status(200).json({ token, alumno: { legajo: alumno.legajo, nombreCompleto: alumno.nombreCompleto } });
}

module.exports = { login };
```

### `backend/src/controllers/inscripcionController.js`

```js
const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");
const correlativaService = require("../services/correlativaService");

// POST /api/inscripcion  { legajo, idMateria, tipoInstancia }
function crearInscripcion(req, res) {
  const { legajo, idMateria, tipoInstancia } = req.body;

  const materia = materiaRepository.findById(idMateria);
  if (!materia) {
    return res.status(404).json({ error: "La materia solicitada no existe." });
  }

  const { cumple, faltantes } = correlativaService.verificarCorrelatividad(legajo, idMateria);
  if (!cumple) {
    return res.status(403).json({
      error: "No cumple las correlatividades requeridas.",
      faltantes,
    });
  }

  const inscripcion = inscripcionRepository.crear({ legajo, idMateria, tipoInstancia });
  return res.status(201).json(inscripcion);
}

// GET /api/inscripcion/:legajo
function listarInscripciones(req, res) {
  const legajo = Number(req.params.legajo);
  return res.status(200).json(inscripcionRepository.listarPorAlumno(legajo));
}

module.exports = { crearInscripcion, listarInscripciones };
```

### `backend/src/controllers/materiaController.js`

```js
const materiaRepository = require("../repositories/materiaRepository");

// GET /api/materias
function listarMaterias(req, res) {
  return res.status(200).json(materiaRepository.findAll());
}

module.exports = { listarMaterias };
```

### `backend/src/db/mockData.js`

```js
// Simulación de la base de datos (según el alcance definido: Admin/Docente pre-cargados).
// En producción esto se reemplaza por consultas reales a PostgreSQL (ver /database/schema.sql).

const alumnos = [
  { legajo: 1001, nombreCompleto: "Gianella Chiappello", email: "gianella@utn.edu.ar", passwordHash: "$2b$10$mockhash1" },
  { legajo: 1002, nombreCompleto: "Wilfer Florentin", email: "wilfer@utn.edu.ar", passwordHash: "$2b$10$mockhash2" },
];

const materias = [
  { idMateria: 1, nombreMateria: "Algoritmos y Estructuras de Datos", anioCarrera: 1 },
  { idMateria: 2, nombreMateria: "Programación II", anioCarrera: 2 },
  { idMateria: 3, nombreMateria: "Base de Datos", anioCarrera: 2 },
  { idMateria: 4, nombreMateria: "Ingeniería y Calidad de Software", anioCarrera: 3 },
  { idMateria: 5, nombreMateria: "Seminario Integrador", anioCarrera: 3 },
];

// Correlativas: para cursar idMateriaPrincipal se requiere tener aprobada idMateriaRequerida
const correlativas = [
  { idMateriaPrincipal: 2, idMateriaRequerida: 1 },
  { idMateriaPrincipal: 4, idMateriaRequerida: 2 },
  { idMateriaPrincipal: 4, idMateriaRequerida: 3 },
  { idMateriaPrincipal: 5, idMateriaRequerida: 4 },
];

// Historial académico simulado: materias que cada alumno ya tiene aprobadas
const historialAprobadas = {
  1001: [1, 2, 3], // Gianella: puede cursar Ingeniería y Calidad de Software (4)
  1002: [1],       // Wilfer: NO puede cursar Programación II sin más datos... (ejemplo controlado)
};

const inscripciones = [];
let nextInscripcionId = 1;

module.exports = { alumnos, materias, correlativas, historialAprobadas, inscripciones, nextInscripcionId: () => nextInscripcionId++ };
```

### `backend/src/middleware/authMiddleware.js`

```js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token no provisto." });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

module.exports = { requireAuth };
```

### `backend/src/repositories/inscripcionRepository.js`

```js
const db = require("../db/mockData");

function historialDe(legajo) {
  return db.historialAprobadas[legajo] || [];
}

function crear({ legajo, idMateria, tipoInstancia }) {
  const nueva = {
    idInscripcion: db.nextInscripcionId(),
    legajo,
    idMateria,
    fechaInscripcion: new Date().toISOString(),
    tipoInstancia,
    estado: "Confirmada",
  };
  db.inscripciones.push(nueva);
  return nueva;
}

function listarPorAlumno(legajo) {
  return db.inscripciones.filter((i) => i.legajo === legajo);
}

module.exports = { historialDe, crear, listarPorAlumno };
```

### `backend/src/repositories/materiaRepository.js`

```js
const { materias, correlativas } = require("../db/mockData");

/**
 * Repository Pattern: aísla el acceso a datos de materias/correlativas
 * de la lógica de negocio en los services/controllers.
 * En producción, estas funciones ejecutan SQL contra PostgreSQL.
 */
function findAll() {
  return materias;
}

function findById(idMateria) {
  return materias.find((m) => m.idMateria === idMateria) || null;
}

function findCorrelativasDe(idMateria) {
  return correlativas
    .filter((c) => c.idMateriaPrincipal === idMateria)
    .map((c) => c.idMateriaRequerida);
}

module.exports = { findAll, findById, findCorrelativasDe };
```

### `backend/src/services/correlativaService.js`

```js
const materiaRepository = require("../repositories/materiaRepository");
const inscripcionRepository = require("../repositories/inscripcionRepository");

/**
 * RF03: El sistema debe permitir la inscripción a cursadas validando
 * correlatividades previas.
 *
 * Devuelve { cumple: boolean, faltantes: number[] } donde `faltantes`
 * son los ids de materia requeridos que el alumno todavía no aprobó.
 */
function verificarCorrelatividad(legajo, idMateria) {
  const requeridas = materiaRepository.findCorrelativasDe(idMateria);
  if (requeridas.length === 0) {
    return { cumple: true, faltantes: [] };
  }
  const aprobadas = new Set(inscripcionRepository.historialDe(legajo));
  const faltantes = requeridas.filter((idReq) => !aprobadas.has(idReq));
  return { cumple: faltantes.length === 0, faltantes };
}

module.exports = { verificarCorrelatividad };
```

### `backend/tests/correlativaService.test.js`

```js
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
```

### `backend/tests/inscripcion.integration.test.js`

```js
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
```

### `database/schema.sql`

```sql
-- SGAI - Esquema de Base de Datos (PostgreSQL)
-- Corresponde al Diagrama Entidad-Relación de la Sección 6.3

CREATE TABLE IF NOT EXISTS alumno (
    legajo          INTEGER PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS materia (
    id_materia     SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(150) NOT NULL,
    anio_carrera   SMALLINT NOT NULL CHECK (anio_carrera BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS correlativa (
    id_materia_principal  INTEGER NOT NULL REFERENCES materia(id_materia),
    id_materia_requerida  INTEGER NOT NULL REFERENCES materia(id_materia),
    PRIMARY KEY (id_materia_principal, id_materia_requerida)
);

CREATE TABLE IF NOT EXISTS inscripcion (
    id_inscripcion     SERIAL PRIMARY KEY,
    legajo             INTEGER NOT NULL REFERENCES alumno(legajo),
    id_materia         INTEGER NOT NULL REFERENCES materia(id_materia),
    fecha_inscripcion  TIMESTAMP NOT NULL DEFAULT NOW(),
    tipo_instancia     VARCHAR(20) NOT NULL CHECK (tipo_instancia IN ('Cursada', 'Final')),
    estado             VARCHAR(20) NOT NULL DEFAULT 'Confirmada'
                        CHECK (estado IN ('Confirmada', 'Rechazada', 'Anulada'))
);

CREATE INDEX IF NOT EXISTS idx_inscripcion_legajo ON inscripcion(legajo);
CREATE INDEX IF NOT EXISTS idx_inscripcion_materia ON inscripcion(id_materia);
```

### `database/seed.sql`

```sql
-- SGAI - Datos de ejemplo (simulación del alcance: Admin/Docente pre-cargados)

INSERT INTO alumno (legajo, nombre_completo, email, password_hash) VALUES
    (1001, 'Gianella Chiappello', 'gianella@utn.edu.ar', '$2b$10$mockhash1'),
    (1002, 'Wilfer Florentin', 'wilfer@utn.edu.ar', '$2b$10$mockhash2')
ON CONFLICT DO NOTHING;

INSERT INTO materia (id_materia, nombre_materia, anio_carrera) VALUES
    (1, 'Algoritmos y Estructuras de Datos', 1),
    (2, 'Programación II', 2),
    (3, 'Base de Datos', 2),
    (4, 'Ingeniería y Calidad de Software', 3),
    (5, 'Seminario Integrador', 3)
ON CONFLICT DO NOTHING;

INSERT INTO correlativa (id_materia_principal, id_materia_requerida) VALUES
    (2, 1),
    (4, 2),
    (4, 3),
    (5, 4)
ON CONFLICT DO NOTHING;
```

### `frontend/pubspec.yaml`

```yaml
name: sgai_app
description: Frontend Flutter del Sistema de Gestión Académica Integral (SGAI) - UTN FRVT
publish_to: "none"
version: 0.1.0

environment:
  sdk: ">=3.3.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.1
  provider: ^6.1.2
  flutter_secure_storage: ^9.2.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
```

### `frontend/lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'screens/login/login_screen.dart';

void main() {
  runApp(const SgaiApp());
}

class SgaiApp extends StatelessWidget {
  const SgaiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SGAI',
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1F3864),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
```

### `frontend/lib/models/alumno.dart`

```dart
class Alumno {
  final int legajo;
  final String nombreCompleto;

  Alumno({required this.legajo, required this.nombreCompleto});

  factory Alumno.fromJson(Map<String, dynamic> json) {
    return Alumno(
      legajo: json['legajo'] as int,
      nombreCompleto: json['nombreCompleto'] as String,
    );
  }
}
```

### `frontend/lib/models/materia.dart`

```dart
class Materia {
  final int idMateria;
  final String nombreMateria;
  final int anioCarrera;

  Materia({required this.idMateria, required this.nombreMateria, required this.anioCarrera});

  factory Materia.fromJson(Map<String, dynamic> json) {
    return Materia(
      idMateria: json['idMateria'] as int,
      nombreMateria: json['nombreMateria'] as String,
      anioCarrera: json['anioCarrera'] as int,
    );
  }
}
```

### `frontend/lib/screens/analitico/analitico_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

/// RF02: El sistema debe mostrar el estado académico (analítico) del alumno.
/// Pantalla pendiente de desarrollo completo (Hito 3-4, ver planificación de Sprints).
class AnaliticoScreen extends StatelessWidget {
  final ApiService api;
  const AnaliticoScreen({super.key, required this.api});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mi Analítico')),
      body: const Center(child: Text('Listado de materias aprobadas/pendientes (a implementar).')),
    );
  }
}
```

### `frontend/lib/screens/asistencias/asistencias_screen.dart`

```dart
import 'package:flutter/material.dart';

/// RF05: El sistema debe mostrar el registro de asistencias/inasistencias
/// del ciclo lectivo. Pantalla pendiente de desarrollo completo.
class AsistenciasScreen extends StatelessWidget {
  const AsistenciasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Asistencias')),
      body: const Center(child: Text('Registro de asistencias por materia (a implementar).')),
    );
  }
}
```

### `frontend/lib/screens/inscripcion/inscripcion_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/materia.dart';

/// RF03 / RF04: Inscripción a cursadas y a exámenes finales, validando
/// correlatividades a través del backend (correlativaService).
class InscripcionScreen extends StatefulWidget {
  final ApiService api;
  const InscripcionScreen({super.key, required this.api});

  @override
  State<InscripcionScreen> createState() => _InscripcionScreenState();
}

class _InscripcionScreenState extends State<InscripcionScreen> {
  List<Materia> _materias = [];
  String? _mensaje;

  @override
  void initState() {
    super.initState();
    _cargarMaterias();
  }

  Future<void> _cargarMaterias() async {
    final data = await widget.api.getMaterias();
    setState(() => _materias = data.map((m) => Materia.fromJson(m)).toList());
  }

  Future<void> _inscribirse(int idMateria) async {
    try {
      await widget.api.inscribirse(1001, idMateria, 'Cursada');
      setState(() => _mensaje = 'Inscripción confirmada.');
    } catch (e) {
      setState(() => _mensaje = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inscripción a Cursadas')),
      body: Column(
        children: [
          if (_mensaje != null) Padding(padding: const EdgeInsets.all(8), child: Text(_mensaje!)),
          Expanded(
            child: ListView.builder(
              itemCount: _materias.length,
              itemBuilder: (context, i) {
                final m = _materias[i];
                return ListTile(
                  title: Text(m.nombreMateria),
                  subtitle: Text('Año ${m.anioCarrera}'),
                  trailing: ElevatedButton(
                    onPressed: () => _inscribirse(m.idMateria),
                    child: const Text('Inscribirse'),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
```

### `frontend/lib/screens/login/login_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

/// RF01: El sistema debe permitir el inicio de sesión del estudiante.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _api = ApiService(baseUrl: 'http://localhost:3000');
  String? _error;

  Future<void> _login() async {
    try {
      final result = await _api.login(_emailController.text.trim());
      _api.setToken(result['token'] as String);
      // TODO: navegar a la pantalla de Analítico (RF02) pasando el ApiService autenticado.
    } catch (e) {
      setState(() => _error = 'No se pudo iniciar sesión. Verificá tus credenciales.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('SGAI', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email institucional'),
                ),
                const SizedBox(height: 16),
                if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 16),
                FilledButton(onPressed: _login, child: const Text('Iniciar sesión')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

### `frontend/lib/services/api_service.dart`

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

/// Cliente HTTP centralizado que consume la API REST del backend SGAI.
/// Todas las pantallas consumen la API a través de este servicio
/// (nunca hacen llamadas HTTP directas), siguiendo la separación de capas
/// definida en la Arquitectura del Sistema (Sección 6.2).
class ApiService {
  final String baseUrl;
  String? _token;

  ApiService({required this.baseUrl});

  void setToken(String token) => _token = token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> login(String email) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email}),
    );
    if (res.statusCode != 200) {
      throw Exception('Credenciales inválidas');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getMaterias() async {
    final res = await http.get(Uri.parse('$baseUrl/api/materias'), headers: _headers);
    if (res.statusCode != 200) throw Exception('Error al obtener materias');
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> inscribirse(int legajo, int idMateria, String tipoInstancia) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/inscripcion'),
      headers: _headers,
      body: jsonEncode({'legajo': legajo, 'idMateria': idMateria, 'tipoInstancia': tipoInstancia}),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 403) {
      throw Exception('No cumple correlativas: ${body['faltantes']}');
    }
    if (res.statusCode != 201) throw Exception('Error al inscribirse');
    return body;
  }
}
```
