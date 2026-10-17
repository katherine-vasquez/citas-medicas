// Controlador de citas médicas.
module.exports = (appointmentService) => ({
  list: async (req, res) => res.status(200).json(await appointmentService.list(req.query)),
  getById: async (req, res) => res.status(200).json(await appointmentService.getById(req.params.id)),
  create: async (req, res) => res.status(201).json(await appointmentService.create(req.body)),
  updateStatus: async (req, res) =>
    res.status(200).json(await appointmentService.updateStatus(req.params.id, req.body)),
  cancel: async (req, res) => res.status(200).json(await appointmentService.cancel(req.params.id)),
});
