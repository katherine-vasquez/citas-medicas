// Lógica de negocio de pacientes.
const AppError = require('../utils/AppError');
const { validatePatient } = require('../utils/validators');

module.exports = ({ patientRepo }) => ({
  list: () => patientRepo.findAll(),

  async create(body) {
    const data = validatePatient(body);
    const existing = await patientRepo.findByDocumentOrEmail(data.document, data.email);
    if (existing) throw new AppError(409, 'Ya existe un paciente con ese documento o correo');
    return patientRepo.create(data);
  },
});
