// Pruebas de la API con repositorios en memoria (no requieren MySQL).
// Se ejecutan con: npm test  (usa el runner nativo de Node: node --test)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

function memoryRepos() {
  const db = { patients: [], doctors: [], appointments: [] };
  const withRelations = (a) =>
    a && {
      ...a,
      patient: db.patients.find((p) => p.id === a.patientId),
      doctor: db.doctors.find((d) => d.id === a.doctorId),
    };

  return {
    patientRepo: {
      findAll: async () => db.patients,
      findById: async (id) => db.patients.find((p) => p.id === id) || null,
      findByDocumentOrEmail: async (doc, email) =>
        db.patients.find((p) => p.document === doc || p.email === email) || null,
      create: async (data) => {
        const p = { id: db.patients.length + 1, ...data };
        db.patients.push(p);
        return p;
      },
    },
    doctorRepo: {
      findAll: async () => db.doctors,
      findById: async (id) => db.doctors.find((d) => d.id === id) || null,
      findByEmail: async (email) => db.doctors.find((d) => d.email === email) || null,
      create: async (data) => {
        const d = { id: db.doctors.length + 1, ...data };
        db.doctors.push(d);
        return d;
      },
    },
    appointmentRepo: {
      findAll: async (f = {}) =>
        db.appointments
          .filter((a) => (!f.patientId || a.patientId === f.patientId))
          .filter((a) => (!f.doctorId || a.doctorId === f.doctorId))
          .filter((a) => (!f.status || a.status === f.status))
          .filter((a) => (!f.date || a.dateTime.toISOString().startsWith(f.date)))
          .map(withRelations),
      findById: async (id) => withRelations(db.appointments.find((a) => a.id === id)) || null,
      findDoctorConflict: async (doctorId, dateTime) =>
        db.appointments.find(
          (a) => a.doctorId === doctorId && a.dateTime.getTime() === dateTime.getTime() && a.status !== 'CANCELADA',
        ) || null,
      create: async (data) => {
        const a = { id: db.appointments.length + 1, status: 'PENDIENTE', ...data };
        db.appointments.push(a);
        return withRelations(a);
      },
      updateStatus: async (id, status) => {
        const a = db.appointments.find((x) => x.id === id);
        a.status = status;
        return withRelations(a);
      },
    },
  };
}

let server;
let base;
const future = new Date(Date.now() + 7 * 24 * 3600 * 1000);
future.setUTCHours(15, 0, 0, 0);
const futureIso = future.toISOString();

const call = async (method, path, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
};

before(async () => {
  const app = createApp({ ...memoryRepos(), notifier: null });
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('GET /health responde ok', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.status, 200);
});

test('POST /patients registra un paciente (201)', async () => {
  const r = await call('POST', '/patients', {
    fullName: 'Ana Gómez', document: '111', email: 'ana@correo.com', phone: '300',
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.id, 1);
});

test('POST /patients con datos inválidos devuelve 400', async () => {
  const r = await call('POST', '/patients', { fullName: '', email: 'no-es-correo' });
  assert.equal(r.status, 400);
  assert.ok(r.body.details.length >= 3);
});

test('POST /patients duplicado devuelve 409', async () => {
  const r = await call('POST', '/patients', {
    fullName: 'Otra', document: '111', email: 'otra@correo.com', phone: '1',
  });
  assert.equal(r.status, 409);
});

test('POST /doctors y GET /doctors', async () => {
  const c = await call('POST', '/doctors', { fullName: 'Dr. Medina', specialty: 'General', email: 'm@clinica.com' });
  assert.equal(c.status, 201);
  const l = await call('GET', '/doctors');
  assert.equal(l.body.length, 1);
  assert.equal(l.body[0].specialty, 'General');
});

test('POST /appointments sin paciente/médico/fecha devuelve 400', async () => {
  const r = await call('POST', '/appointments', { reason: 'x' });
  assert.equal(r.status, 400);
});

test('POST /appointments con paciente inexistente devuelve 404', async () => {
  const r = await call('POST', '/appointments', { patientId: 99, doctorId: 1, dateTime: futureIso, reason: 'x' });
  assert.equal(r.status, 404);
});

test('POST /appointments programa una cita (201)', async () => {
  const r = await call('POST', '/appointments', { patientId: 1, doctorId: 1, dateTime: futureIso, reason: 'Chequeo' });
  assert.equal(r.status, 201);
  assert.equal(r.body.status, 'PENDIENTE');
});

test('Evita dos citas simultáneas con el mismo médico (409)', async () => {
  const r = await call('POST', '/appointments', { patientId: 1, doctorId: 1, dateTime: futureIso, reason: 'Otra' });
  assert.equal(r.status, 409);
});

test('GET /appointments con filtros (fecha, paciente, médico, estado)', async () => {
  const date = futureIso.slice(0, 10);
  assert.equal((await call('GET', `/appointments?date=${date}`)).body.length, 1);
  assert.equal((await call('GET', '/appointments?patientId=1')).body.length, 1);
  assert.equal((await call('GET', '/appointments?doctorId=1')).body.length, 1);
  assert.equal((await call('GET', '/appointments?status=pendiente')).body.length, 1);
});

test('GET /appointments/:id inexistente devuelve 404', async () => {
  assert.equal((await call('GET', '/appointments/50')).status, 404);
});

test('PATCH /appointments/:id/status actualiza el estado', async () => {
  const r = await call('PATCH', '/appointments/1/status', { status: 'CONFIRMADA' });
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'CONFIRMADA');
  assert.equal((await call('PATCH', '/appointments/1/status', { status: 'INVENTADO' })).status, 400);
});

test('DELETE /appointments/:id cancela sin borrar (conserva historial)', async () => {
  const r = await call('DELETE', '/appointments/1');
  assert.equal(r.status, 200);
  assert.equal(r.body.status, 'CANCELADA');
  const g = await call('GET', '/appointments/1');
  assert.equal(g.status, 200); // sigue existiendo
});

test('Tras cancelar, el horario del médico queda libre', async () => {
  const r = await call('POST', '/appointments', { patientId: 1, doctorId: 1, dateTime: futureIso, reason: 'Nueva' });
  assert.equal(r.status, 201);
});
