-- =====================================================================
-- PARTE 1 - Estructura de la base de datos (MySQL 8)
-- Equivalente a la migración de Prisma (backend/prisma/migrations).
-- =====================================================================
CREATE DATABASE IF NOT EXISTS citas_medicas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE citas_medicas;

CREATE TABLE patients (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  fullName   VARCHAR(120) NOT NULL,
  document   VARCHAR(20)  NOT NULL UNIQUE,
  email      VARCHAR(120) NOT NULL UNIQUE,
  phone      VARCHAR(20)  NOT NULL,
  createdAt  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE doctors (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  fullName   VARCHAR(120) NOT NULL,
  specialty  VARCHAR(80)  NOT NULL,
  email      VARCHAR(120) NOT NULL UNIQUE,
  createdAt  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE appointments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  patientId  INT          NOT NULL,
  doctorId   INT          NOT NULL,
  dateTime   DATETIME(3)  NOT NULL,
  reason     VARCHAR(255) NOT NULL,
  status     ENUM('PENDIENTE','CONFIRMADA','ATENDIDA','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
  createdAt  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patientId) REFERENCES patients(id),
  CONSTRAINT fk_appointments_doctor  FOREIGN KEY (doctorId)  REFERENCES doctors(id),
  INDEX idx_doctor_datetime (doctorId, dateTime),
  INDEX idx_patient (patientId)
);
