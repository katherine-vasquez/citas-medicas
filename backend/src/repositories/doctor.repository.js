// Capa de acceso a datos de médicos.
module.exports = (prisma) => ({
  findAll: () => prisma.doctor.findMany({ orderBy: { id: 'asc' } }),
  findById: (id) => prisma.doctor.findUnique({ where: { id } }),
  findByEmail: (email) => prisma.doctor.findUnique({ where: { email } }),
  create: (data) => prisma.doctor.create({ data }),
});
