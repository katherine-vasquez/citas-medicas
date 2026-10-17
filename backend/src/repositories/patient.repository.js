// Capa de acceso a datos de pacientes (única capa que conoce Prisma).
module.exports = (prisma) => ({
  findAll: () => prisma.patient.findMany({ orderBy: { id: 'asc' } }),
  findById: (id) => prisma.patient.findUnique({ where: { id } }),
  findByDocumentOrEmail: (document, email) =>
    prisma.patient.findFirst({ where: { OR: [{ document }, { email }] } }),
  create: (data) => prisma.patient.create({ data }),
});
