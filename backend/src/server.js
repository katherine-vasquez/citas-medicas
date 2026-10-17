// Punto de entrada: conecta a la BD (con reintentos) y levanta el servidor HTTP.
const env = require('./config/env');
const { prisma, connectWithRetry } = require('./config/prisma');
const { createApp } = require('./app');
const notificationClient = require('./services/notification.client');

async function main() {
  await connectWithRetry();

  const app = createApp({
    patientRepo: require('./repositories/patient.repository')(prisma),
    doctorRepo: require('./repositories/doctor.repository')(prisma),
    appointmentRepo: require('./repositories/appointment.repository')(prisma),
    notifier: notificationClient(env.notificationsUrl),
  });

  const server = app.listen(env.port, () => console.log(`[api] Escuchando en el puerto ${env.port}`));

  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('[api] No se pudo iniciar:', err.message);
  process.exit(1);
});
