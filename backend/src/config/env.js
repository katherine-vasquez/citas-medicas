// Lectura centralizada de variables de entorno (nunca se escriben secretos en el código).
module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  notificationsUrl: process.env.NOTIFICATIONS_URL || '',
  dbMaxRetries: Number(process.env.DB_MAX_RETRIES) || 10,
  dbRetryDelayMs: Number(process.env.DB_RETRY_DELAY_MS) || 3000,
};
