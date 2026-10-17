-- =====================================================================
-- PARTE 1 - Datos ficticios: 5 pacientes, 3 médicos, 5 citas
-- =====================================================================
USE citas_medicas;

INSERT INTO patients (fullName, document, email, phone) VALUES
('Ana María Gómez',     '1001001001', 'ana.gomez@correo.com',         '3001112233'),
('Luis Fernando Rojas', '1002002002', 'luis.rojas@correo.com',        '3012223344'),
('Carolina Pérez',      '1003003003', 'carolina.perez@correo.com',    '3023334455'),
('Andrés Castillo',     '1004004004', 'andres.castillo@correo.com',   '3034445566'),
('Valentina Herrera',   '1005005005', 'valentina.herrera@correo.com', '3045556677');

INSERT INTO doctors (fullName, specialty, email) VALUES
('Dr. Jorge Medina',    'Medicina General', 'jorge.medina@clinica.com'),
('Dra. Paula Ríos',     'Pediatría',        'paula.rios@clinica.com'),
('Dr. Ricardo Salazar', 'Cardiología',      'ricardo.salazar@clinica.com');

INSERT INTO appointments (patientId, doctorId, dateTime, reason, status) VALUES
(1, 1, '2026-11-02 09:00:00', 'Chequeo general',                  'PENDIENTE'),
(2, 3, '2026-11-02 10:00:00', 'Dolor en el pecho',                'CONFIRMADA'),
(3, 2, '2026-11-03 08:30:00', 'Control de crecimiento',           'PENDIENTE'),
(1, 3, '2026-11-04 11:00:00', 'Resultados de electrocardiograma', 'PENDIENTE'),
(4, 1, '2026-11-02 11:00:00', 'Gripe persistente',                'CANCELADA');
