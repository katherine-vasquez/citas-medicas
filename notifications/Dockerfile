# Imagen del microservicio de notificaciones (sin dependencias externas → imagen liviana)
FROM node:20-alpine

WORKDIR /app
COPY package.json ./
COPY src ./src

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

# Usuario sin privilegios (buena práctica de seguridad)
USER node

CMD ["node", "src/server.js"]
