-- Migración del portal de alumno. Es segura para la base local ya creada.
ALTER TABLE historial_academico ADD COLUMN IF NOT EXISTS nota_final NUMERIC(4,2);
ALTER TABLE historial_academico ADD COLUMN IF NOT EXISTS fecha_aprobacion DATE;
ALTER TABLE historial_academico ADD COLUMN IF NOT EXISTS tomo VARCHAR(30);
ALTER TABLE historial_academico ADD COLUMN IF NOT EXISTS folio VARCHAR(30);

CREATE TABLE IF NOT EXISTS periodo_academico (
  id_periodo SERIAL PRIMARY KEY, nombre VARCHAR(80) NOT NULL, activo BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS comision (
  id_comision SERIAL PRIMARY KEY, id_materia INTEGER NOT NULL REFERENCES materia(id_materia), id_periodo INTEGER NOT NULL REFERENCES periodo_academico(id_periodo),
  nombre VARCHAR(60) NOT NULL, dias_horarios VARCHAR(150) NOT NULL, docente VARCHAR(150) NOT NULL, cupo_total INTEGER NOT NULL CHECK (cupo_total > 0)
);
CREATE TABLE IF NOT EXISTS asistencia (
  id_asistencia SERIAL PRIMARY KEY, legajo INTEGER NOT NULL REFERENCES alumno(legajo), id_comision INTEGER NOT NULL REFERENCES comision(id_comision),
  fecha DATE NOT NULL, estado VARCHAR(15) NOT NULL CHECK (estado IN ('Presente','Ausente')), justificada BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(legajo, id_comision, fecha)
);
CREATE TABLE IF NOT EXISTS mesa_examen (
  id_mesa SERIAL PRIMARY KEY, id_materia INTEGER NOT NULL REFERENCES materia(id_materia), id_periodo INTEGER NOT NULL REFERENCES periodo_academico(id_periodo),
  fecha_hora TIMESTAMP NOT NULL, aula VARCHAR(50) NOT NULL, tribunal VARCHAR(300) NOT NULL, fecha_limite_baja TIMESTAMP NOT NULL
);
ALTER TABLE inscripcion ADD COLUMN IF NOT EXISTS id_comision INTEGER REFERENCES comision(id_comision);
ALTER TABLE inscripcion ADD COLUMN IF NOT EXISTS id_mesa INTEGER REFERENCES mesa_examen(id_mesa);
ALTER TABLE inscripcion ADD COLUMN IF NOT EXISTS condicion VARCHAR(15);
ALTER TABLE inscripcion ADD COLUMN IF NOT EXISTS comprobante_hash VARCHAR(64);

INSERT INTO periodo_academico (id_periodo,nombre,activo) VALUES (1,'2° Cuatrimestre 2026',true) ON CONFLICT DO NOTHING;
SELECT setval('periodo_academico_id_periodo_seq', (SELECT MAX(id_periodo) FROM periodo_academico));
INSERT INTO comision (id_comision,id_materia,id_periodo,nombre,dias_horarios,docente,cupo_total) VALUES
 (1,4,1,'Comisión A','Lunes y jueves · 19:00 a 22:00','Ing. María López',35),
 (2,5,1,'Comisión A','Martes · 18:00 a 22:00','Ing. Carlos Pérez',30) ON CONFLICT DO NOTHING;
SELECT setval('comision_id_comision_seq', (SELECT MAX(id_comision) FROM comision));
INSERT INTO mesa_examen (id_mesa,id_materia,id_periodo,fecha_hora,aula,tribunal,fecha_limite_baja) VALUES
 (1,2,1,'2026-11-18 18:00','Aula 12','Presidente: Ing. López · Vocales: Ing. Pérez, Ing. Díaz','2026-11-16 18:00'),
 (2,3,1,'2026-11-20 18:00','Aula 8','Presidente: Ing. Ruiz · Vocales: Ing. Gómez, Ing. Vega','2026-11-18 18:00') ON CONFLICT DO NOTHING;
SELECT setval('mesa_examen_id_mesa_seq', (SELECT MAX(id_mesa) FROM mesa_examen));
UPDATE historial_academico SET nota_final=CASE id_materia WHEN 1 THEN 8 WHEN 2 THEN 7 WHEN 3 THEN 9 END, fecha_aprobacion='2025-12-15', tomo='T-2025', folio=CASE id_materia WHEN 1 THEN '001' WHEN 2 THEN '034' ELSE '052' END WHERE legajo=1001;
INSERT INTO asistencia (legajo,id_comision,fecha,estado,justificada) VALUES
 (1001,1,'2026-07-01','Presente',false),(1001,1,'2026-07-03','Presente',false),(1001,1,'2026-07-08','Ausente',false),(1001,1,'2026-07-10','Presente',false),(1001,1,'2026-07-15','Ausente',true)
ON CONFLICT DO NOTHING;
