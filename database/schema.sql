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
