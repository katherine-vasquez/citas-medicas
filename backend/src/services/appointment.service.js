// Lógica de negocio de citas médicas.
const AppError = require('../utils/AppError');
const { validateAppointment, validateStatus, parseId, STATUSES } = require('../utils/validators');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

module.exports = ({ appointmentRepo, patientRepo, doctorRepo, notifier }) => ({
  async list(query = {}) {
    const filters = {};
    if (query.date) {
      if (!DATE_RE.test(query.date)) throw new AppError(400, 'date debe tener formato YYYY-MM-DD');
      filters.date = query.date;
    }
    if (query.patientId) filters.patientId = parseId(query.patientId);
    if (query.doctorId) filters.doctorId = parseId(query.doctorId);
    if (query.status) {
      const status = String(query.status).toUpperCase();
      if (!STATUSES.includes(status)) throw new AppError(400, `status debe ser uno de: ${STATUSES.join(', ')}`);
      filters.status = status;
    }
    return appointmentRepo.findAll(filters);
  },

  async getById(rawId) {
    const id = parseId(rawId);
    const appointment = await appointmentRepo.findById(id);
    if (!appointment) throw new AppError(404, `La cita ${id} no existe`);
    return appointment;
  },

  async create(body) {
    const data = validateAppointment(body);

    if (!(await patientRepo.findById(data.patientId))) {
      throw new AppError(404, `El paciente ${data.patientId} no existe`);
    }
    if (!(await doctorRepo.findById(data.doctorId))) {
      throw new AppError(404, `El médico ${data.doctorId} no existe`);
    }
    // Regla de negocio: un médico no puede tener dos citas activas a la misma hora.
    if (await appointmentRepo.findDoctorConflict(data.doctorId, data.dateTime)) {
      throw new AppError(409, 'El médico ya tiene una cita programada en esa fecha y hora');
    }

    const appointment = await appointmentRepo.create(data);
    if (notifier) notifier.send('APPOINTMENT_CREATED', appointment);
    return appointment;
  },

  async updateStatus(rawId, body) {
    const id = parseId(rawId);
    const status = validateStatus(body);
    const current = await appointmentRepo.findById(id);
    if (!current) throw new AppError(404, `La cita ${id} no existe`);
    if (current.status === 'CANCELADA') {
      throw new AppError(409, 'No se puede cambiar el estado de una cita cancelada');
    }
    const updated = await appointmentRepo.updateStatus(id, status);
    if (notifier) notifier.send('APPOINTMENT_STATUS_CHANGED', updated);
    return updated;
  },

  // Cancelación lógica: no se borra el registro, se cambia el estado (se conserva el historial).
  async cancel(rawId) {
    const id = parseId(rawId);
    const current = await appointmentRepo.findById(id);
    if (!current) throw new AppError(404, `La cita ${id} no existe`);
    if (current.status === 'CANCELADA') throw new AppError(409, 'La cita ya estaba cancelada');
    const cancelled = await appointmentRepo.updateStatus(id, 'CANCELADA');
    if (notifier) notifier.send('APPOINTMENT_CANCELLED', cancelled);
    return cancelled;
  },
});
