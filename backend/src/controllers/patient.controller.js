// Controlador de pacientes: recibe la petición HTTP, llama al servicio y responde.
module.exports = (patientService) => ({
  list: async (req, res) => res.status(200).json(await patientService.list()),
  create: async (req, res) => res.status(201).json(await patientService.create(req.body)),
});
