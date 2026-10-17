// Capa de acceso a datos de citas médicas.
const include = {
  patient: { select: { id: true, fullName: true, document: true } },
  doctor: { select: { id: true, fullName: true, specialty: true } },
};

module.exports = (prisma) => ({
  // filters: { date?: 'YYYY-MM-DD', patientId?, doctorId?, status? }
  findAll: (filters = {}) => {
    const where = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.status) where.status = filters.status;
    if (filters.date) {
      const start = new Date(`${filters.date}T00:00:00.000Z`);
      const end = new Date(`${filters.date}T23:59:59.999Z`);
      where.dateTime = { gte: start, lte: end };
    }
    return prisma.appointment.findMany({ where, include, orderBy: { dateTime: 'asc' } });
  },
  findById: (id) => prisma.appointment.findUnique({ where: { id }, include }),
  // Cita activa (no cancelada) del mismo médico a la misma fecha y hora.
  findDoctorConflict: (doctorId, dateTime) =>
    prisma.appointment.findFirst({
      where: { doctorId, dateTime, status: { not: 'CANCELADA' } },
    }),
  create: (data) => prisma.appointment.create({ data, include }),
  updateStatus: (id, status) =>
    prisma.appointment.update({ where: { id }, data: { status }, include }),
});
