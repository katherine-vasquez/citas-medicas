// Datos ficticios: 5 pacientes, 3 médicos y 5 citas. Solo se insertan si la BD está vacía.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  if ((await prisma.patient.count()) > 0) {
    console.log('[seed] La base de datos ya tiene datos, se omite.');
    return;
  }

  await prisma.patient.createMany({
    data: [
      { fullName: 'Ana María Gómez', document: '1001001001', email: 'ana.gomez@correo.com', phone: '3001112233' },
      { fullName: 'Luis Fernando Rojas', document: '1002002002', email: 'luis.rojas@correo.com', phone: '3012223344' },
      { fullName: 'Carolina Pérez', document: '1003003003', email: 'carolina.perez@correo.com', phone: '3023334455' },
      { fullName: 'Andrés Castillo', document: '1004004004', email: 'andres.castillo@correo.com', phone: '3034445566' },
      { fullName: 'Valentina Herrera', document: '1005005005', email: 'valentina.herrera@correo.com', phone: '3045556677' },
    ],
  });

  await prisma.doctor.createMany({
    data: [
      { fullName: 'Dr. Jorge Medina', specialty: 'Medicina General', email: 'jorge.medina@clinica.com' },
      { fullName: 'Dra. Paula Ríos', specialty: 'Pediatría', email: 'paula.rios@clinica.com' },
      { fullName: 'Dr. Ricardo Salazar', specialty: 'Cardiología', email: 'ricardo.salazar@clinica.com' },
    ],
  });

  await prisma.appointment.createMany({
    data: [
      { patientId: 1, doctorId: 1, dateTime: new Date('2026-11-02T14:00:00Z'), reason: 'Chequeo general', status: 'PENDIENTE' },
      { patientId: 2, doctorId: 3, dateTime: new Date('2026-11-02T15:00:00Z'), reason: 'Dolor en el pecho', status: 'CONFIRMADA' },
      { patientId: 3, doctorId: 2, dateTime: new Date('2026-11-03T13:30:00Z'), reason: 'Control de crecimiento', status: 'PENDIENTE' },
      { patientId: 1, doctorId: 3, dateTime: new Date('2026-11-04T16:00:00Z'), reason: 'Resultados de electrocardiograma', status: 'PENDIENTE' },
      { patientId: 4, doctorId: 1, dateTime: new Date('2026-11-02T16:00:00Z'), reason: 'Gripe persistente', status: 'CANCELADA' },
    ],
  });

  console.log('[seed] Datos de prueba insertados.');
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
