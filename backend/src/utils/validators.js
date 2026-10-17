// Validaciones de los datos recibidos. Lanzan AppError 400 con el detalle de los campos.
const AppError = require('./AppError');

const STATUSES = ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function fail(errors) {
  if (errors.length) throw new AppError(400, 'Datos inválidos', errors);
}

function validatePatient(body = {}) {
  const errors = [];
  if (!isNonEmptyString(body.fullName)) errors.push('fullName es obligatorio');
  if (!isNonEmptyString(body.document)) errors.push('document es obligatorio');
  if (!isNonEmptyString(body.email) || !EMAIL_RE.test(body.email)) errors.push('email no es válido');
  if (!isNonEmptyString(body.phone)) errors.push('phone es obligatorio');
  fail(errors);
  return {
    fullName: body.fullName.trim(),
    document: body.document.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.trim(),
  };
}

function validateDoctor(body = {}) {
  const errors = [];
  if (!isNonEmptyString(body.fullName)) errors.push('fullName es obligatorio');
  if (!isNonEmptyString(body.specialty)) errors.push('specialty es obligatorio');
  if (!isNonEmptyString(body.email) || !EMAIL_RE.test(body.email)) errors.push('email no es válido');
  fail(errors);
  return {
    fullName: body.fullName.trim(),
    specialty: body.specialty.trim(),
    email: body.email.trim().toLowerCase(),
  };
}

function validateAppointment(body = {}) {
  const errors = [];
  const patientId = Number(body.patientId);
  const doctorId = Number(body.doctorId);
  const dateTime = new Date(body.dateTime);
  if (!Number.isInteger(patientId) || patientId <= 0) errors.push('patientId es obligatorio (entero positivo)');
  if (!Number.isInteger(doctorId) || doctorId <= 0) errors.push('doctorId es obligatorio (entero positivo)');
  if (!body.dateTime || Number.isNaN(dateTime.getTime())) errors.push('dateTime es obligatorio (formato ISO 8601)');
  else if (dateTime.getTime() < Date.now()) errors.push('dateTime no puede estar en el pasado');
  if (!isNonEmptyString(body.reason)) errors.push('reason es obligatorio');
  fail(errors);
  return { patientId, doctorId, dateTime, reason: body.reason.trim() };
}

function validateStatus(body = {}) {
  const status = typeof body.status === 'string' ? body.status.toUpperCase() : '';
  if (!STATUSES.includes(status)) {
    throw new AppError(400, 'Datos inválidos', [`status debe ser uno de: ${STATUSES.join(', ')}`]);
  }
  return status;
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'El id debe ser un entero positivo');
  return id;
}

module.exports = { validatePatient, validateDoctor, validateAppointment, validateStatus, parseId, STATUSES };
