// Composición de la aplicación: conecta repositorios → servicios → controladores → rutas.
// Recibe las dependencias desde afuera (inyección de dependencias) para poder probarla.
const express = require('express');
const buildRoutes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const patientServiceFactory = require('./services/patient.service');
const doctorServiceFactory = require('./services/doctor.service');
const appointmentServiceFactory = require('./services/appointment.service');
const patientControllerFactory = require('./controllers/patient.controller');
const doctorControllerFactory = require('./controllers/doctor.controller');
const appointmentControllerFactory = require('./controllers/appointment.controller');

function createApp({ patientRepo, doctorRepo, appointmentRepo, notifier }) {
  const patientService = patientServiceFactory({ patientRepo });
  const doctorService = doctorServiceFactory({ doctorRepo });
  const appointmentService = appointmentServiceFactory({ appointmentRepo, patientRepo, doctorRepo, notifier });

  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'backend' }));

  app.use(
    buildRoutes({
      patientController: patientControllerFactory(patientService),
      doctorController: doctorControllerFactory(doctorService),
      appointmentController: appointmentControllerFactory(appointmentService),
    }),
  );

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
