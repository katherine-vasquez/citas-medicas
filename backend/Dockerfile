# Imagen del backend (API REST de citas médicas)
FROM node:20-slim

# Prisma necesita OpenSSL dentro del contenedor
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Dependencias primero (aprovecha la caché de capas de Docker)
COPY package*.json ./
RUN npm ci --omit=dev

# 2) Esquema de Prisma y generación de Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# 3) Código fuente
COPY src ./src
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production \
    PORT=3000

# EXPOSE documenta el puerto; se publica en docker-compose.yml con "ports"
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Ejecuta migraciones + datos iniciales y arranca la API
ENTRYPOINT ["./docker-entrypoint.sh"]
