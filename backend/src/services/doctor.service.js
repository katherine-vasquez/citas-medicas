// Lógica de negocio de médicos.
const AppError = require('../utils/AppError');
const { validateDoctor } = require('../utils/validators');

module.exports = ({ doctorRepo }) => ({
  list: () => doctorRepo.findAll(),

  async create(body) {
    const data = validateDoctor(body);
    if (await doctorRepo.findByEmail(data.email)) {
      throw new AppError(409, 'Ya existe un médico con ese correo');
    }
    return doctorRepo.create(data);
  },
});
