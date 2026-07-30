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
