// Controlador de médicos.
module.exports = (doctorService) => ({
  list: async (req, res) => res.status(200).json(await doctorService.list()),
  create: async (req, res) => res.status(201).json(await doctorService.create(req.body)),
});
