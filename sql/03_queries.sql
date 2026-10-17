-- =====================================================================
-- PARTE 1 - Consultas (puntos 15 a 21)
-- =====================================================================
USE citas_medicas;

-- 15. Todos los pacientes registrados
SELECT id, fullName, document, email, phone FROM patients;

-- 16. Todos los médicos y sus especialidades
SELECT id, fullName, specialty FROM doctors ORDER BY specialty;

-- 17. Citas programadas para una fecha específica (2 de noviembre de 2026)
SELECT a.id, a.dateTime, p.fullName AS paciente, d.fullName AS medico, a.reason, a.status
FROM appointments a
INNER JOIN patients p ON p.id = a.patientId
INNER JOIN doctors  d ON d.id = a.doctorId
WHERE DATE(a.dateTime) = '2026-11-02'
ORDER BY a.dateTime;

-- 18. Citas de un paciente determinado (documento 1001001001)
SELECT a.id, a.dateTime, d.fullName AS medico, d.specialty, a.reason, a.status
FROM appointments a
INNER JOIN patients p ON p.id = a.patientId
INNER JOIN doctors  d ON d.id = a.doctorId
WHERE p.document = '1001001001'
ORDER BY a.dateTime;

-- 19. Citas asignadas a un médico específico (id 1)
SELECT a.id, a.dateTime, p.fullName AS paciente, a.reason, a.status
FROM appointments a
INNER JOIN patients p ON p.id = a.patientId
WHERE a.doctorId = 1
ORDER BY a.dateTime;

-- 20. Citas pendientes
SELECT a.id, a.dateTime, p.fullName AS paciente, d.fullName AS medico, a.reason
FROM appointments a
INNER JOIN patients p ON p.id = a.patientId
INNER JOIN doctors  d ON d.id = a.doctorId
WHERE a.status = 'PENDIENTE'
ORDER BY a.dateTime;

-- 21. Validación: evitar dos citas simultáneas con el mismo médico.
-- Se implementa en la BD con un TRIGGER (y también en la capa de servicios de la API).
-- Las citas CANCELADAS no bloquean el horario.
DELIMITER $$
CREATE TRIGGER trg_appointments_no_overlap
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE doctorId = NEW.doctorId
      AND dateTime = NEW.dateTime
      AND status <> 'CANCELADA'
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El médico ya tiene una cita programada en esa fecha y hora';
  END IF;
END$$
DELIMITER ;

-- Prueba de la validación (debe fallar con el mensaje del trigger):
-- INSERT INTO appointments (patientId, doctorId, dateTime, reason)
-- VALUES (5, 1, '2026-11-02 09:00:00', 'Prueba de cruce');
