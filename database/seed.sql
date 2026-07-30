-- SGAI - Datos de ejemplo (simulación del alcance: Admin/Docente pre-cargados)

INSERT INTO alumno (legajo, nombre_completo, email, password_hash) VALUES
    -- Contraseñas de desarrollo: Gianella2026! y Wilfer2026!. Cambiarlas fuera de desarrollo.
    (1001, 'Gianella Chiappello', 'gianella@utn.edu.ar', '$2b$12$mUF8nAM68LQLr/Oqt/3rMeAB83U7clO5IsEWncDX3u05mPyFxQ6DK'),
    (1002, 'Wilfer Florentin', 'wilfer@utn.edu.ar', '$2b$12$KsAbjJZRflLNOxCqWtXt3egWLxi7ZmFS1fWETWxnP28L7Pok1jZGK')
ON CONFLICT DO NOTHING;

INSERT INTO materia (id_materia, nombre_materia, anio_carrera) VALUES
    (1, 'Algoritmos y Estructuras de Datos', 1),
    (2, 'Programación II', 2),
    (3, 'Base de Datos', 2),
    (4, 'Ingeniería y Calidad de Software', 3),
    (5, 'Seminario Integrador', 3)
ON CONFLICT DO NOTHING;

INSERT INTO historial_academico (legajo, id_materia, estado) VALUES
    (1001, 1, 'Aprobada'), (1001, 2, 'Aprobada'), (1001, 3, 'Aprobada'),
    (1002, 1, 'Aprobada')
ON CONFLICT DO NOTHING;

INSERT INTO correlativa (id_materia_principal, id_materia_requerida) VALUES
    (2, 1),
    (4, 2),
    (4, 3),
    (5, 4)
ON CONFLICT DO NOTHING;
