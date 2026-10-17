// Instancia única de Prisma Client + conexión con reintentos.
const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Estrategia de reintentos: la BD puede tardar en estar lista al arrancar con Docker Compose.
async function connectWithRetry(maxRetries = env.dbMaxRetries, delayMs = env.dbRetryDelayMs) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[db] Conectado a MySQL (intento ${attempt})`);
      return;
    } catch (err) {
      console.warn(`[db] Intento ${attempt}/${maxRetries} fallido: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await sleep(delayMs);
    }
  }
}

module.exports = { prisma, connectWithRetry };
