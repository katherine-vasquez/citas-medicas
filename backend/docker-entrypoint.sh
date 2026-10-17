#!/bin/sh
# Arranque del contenedor del backend:
# 1. Espera a que MySQL acepte conexiones aplicando las migraciones con reintentos.
# 2. Carga los datos de prueba (solo si la BD está vacía).
# 3. Inicia la API.
set -e

MAX_RETRIES=${DB_MAX_RETRIES:-10}
DELAY=${DB_RETRY_DELAY_SECONDS:-3}
i=1

until npx prisma migrate deploy; do
  if [ "$i" -ge "$MAX_RETRIES" ]; then
    echo "[entrypoint] La base de datos no respondió tras $MAX_RETRIES intentos."
    exit 1
  fi
  echo "[entrypoint] Base de datos no disponible (intento $i/$MAX_RETRIES). Reintentando en ${DELAY}s..."
  i=$((i + 1))
  sleep "$DELAY"
done

if [ "${SEED_ON_START:-true}" = "true" ]; then
  node prisma/seed.js
fi

exec node src/server.js
