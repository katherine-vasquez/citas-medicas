// Definición de rutas (endpoints) de la API REST.
const { Router } = require('express');

// Envuelve handlers async para que los errores lleguen al middleware de errores.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = ({ patientController, doctorController, appointmentController }) => {
  const router = Router();

  router.get('/patients', wrap(patientController.list));
  router.post('/patients', wrap(patientController.create));

  router.get('/doctors', wrap(doctorController.list));
  router.post('/doctors', wrap(doctorController.create));

  router.get('/appointments', wrap(appointmentController.list));
  router.post('/appointments', wrap(appointmentController.create));
  router.get('/appointments/:id', wrap(appointmentController.getById));
  router.patch('/appointments/:id/status', wrap(appointmentController.updateStatus));
  router.delete('/appointments/:id', wrap(appointmentController.cancel));

  return router;
};
