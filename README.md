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
