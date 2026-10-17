// Cliente HTTP hacia el microservicio de notificaciones (segunda imagen Docker).
// Se comunica por la red interna de Docker Compose: http://notifications:4000
// Si el servicio no responde, la cita igual se guarda (el aviso no es crítico).
module.exports = (baseUrl) => ({
  send(type, appointment) {
    if (!baseUrl) return;
    fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        appointmentId: appointment.id,
        patient: appointment.patient?.fullName,
        doctor: appointment.doctor?.fullName,
        dateTime: appointment.dateTime,
        status: appointment.status,
      }),
      signal: AbortSignal.timeout(3000),
    }).catch((err) => console.warn(`[notifications] No se pudo notificar: ${err.message}`));
  },
});
