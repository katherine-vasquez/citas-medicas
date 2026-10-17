// Microservicio de notificaciones de citas médicas (segunda imagen Docker propia).
// Responsabilidad: recibir eventos del backend (cita creada, estado cambiado, cancelada)
// y generar el mensaje de aviso para el paciente. En producción aquí se enviaría
// un correo/SMS; para el proyecto se registra en consola y se guarda en memoria.
// Sin dependencias externas: solo el módulo http nativo de Node.js.
const http = require('node:http');

const PORT = Number(process.env.PORT) || 4000;
const notifications = [];

const MESSAGES = {
  APPOINTMENT_CREATED: (n) => `Hola ${n.patient}, su cita con ${n.doctor} quedó programada para ${n.dateTime}.`,
  APPOINTMENT_STATUS_CHANGED: (n) => `Hola ${n.patient}, su cita #${n.appointmentId} cambió a estado ${n.status}.`,
  APPOINTMENT_CANCELLED: (n) => `Hola ${n.patient}, su cita #${n.appointmentId} con ${n.doctor} fue cancelada.`,
};

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('JSON inválido')); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { status: 'ok', service: 'notifications' });

  if (req.method === 'GET' && req.url === '/notifications') return send(res, 200, notifications);

  if (req.method === 'POST' && req.url === '/notifications') {
    try {
      const event = await readBody(req);
      const build = MESSAGES[event.type];
      if (!build || !event.appointmentId) return send(res, 400, { error: 'type y appointmentId son obligatorios' });
      const notification = { id: notifications.length + 1, ...event, message: build(event), sentAt: new Date().toISOString() };
      notifications.push(notification);
      console.log(`[notificación] ${notification.message}`);
      return send(res, 201, notification);
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
  }

  return send(res, 404, { error: 'Ruta no encontrada' });
});

server.listen(PORT, () => console.log(`[notifications] Escuchando en el puerto ${PORT}`));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
