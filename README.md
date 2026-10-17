# Sistema de Gestión de Citas Médicas — API REST

Proyecto integrador: **Desarrollo Backend, Bases de Datos, Docker, Arquitectura de Software y CI/CD**.

| Componente | Tecnología |
|---|---|
| Backend | Node.js 20 + Express |
| Base de datos | MySQL 8 |
| ORM | Prisma 5 |
| Arquitectura | Por capas (Controlador → Servicio → Repositorio) + microservicio de notificaciones |
| Contenedores | Docker + Docker Compose |
| Registro | Docker Hub |
| CI/CD | GitHub Actions |

## Estructura de carpetas

```
citas-medicas/
├── backend/                        # Imagen 1: API REST
│   ├── prisma/
│   │   ├── schema.prisma           # Modelos Patient, Doctor, Appointment
│   │   ├── migrations/             # Migraciones de Prisma (SQL versionado)
│   │   └── seed.js                 # Datos ficticios (5 pacientes, 3 médicos, 5 citas)
│   ├── src/
│   │   ├── config/                 # Variables de entorno y conexión Prisma con reintentos
│   │   ├── controllers/            # Capa de presentación: reciben HTTP y responden
│   │   ├── services/               # Capa de negocio: validaciones y reglas
│   │   ├── repositories/           # Capa de acceso a datos: única que usa Prisma
│   │   ├── routes/                 # Definición de endpoints
│   │   ├── middlewares/            # Manejo centralizado de errores
│   │   ├── utils/                  # Validadores y AppError
│   │   ├── app.js                  # Ensambla capas (inyección de dependencias)
│   │   └── server.js               # Punto de entrada
│   ├── tests/api.test.js           # 14 pruebas automatizadas
│   ├── Dockerfile
│   └── docker-entrypoint.sh        # Migraciones con reintentos + seed + arranque
├── notifications/                  # Imagen 2: microservicio de notificaciones
│   ├── src/server.js
│   └── Dockerfile
├── sql/                            # Parte 1: scripts SQL puros (tablas, datos, consultas, trigger)
├── docs/                           # Diagramas UML (Mermaid)
├── .github/workflows/ci-cd.yml     # Pipeline CI/CD
├── docker-compose.yml
└── .env.example                    # Plantilla de variables (el .env real NO se sube)
```

## Endpoints

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| POST | `/patients` | Registrar paciente | 201, 400, 409 |
| GET | `/patients` | Listar pacientes | 200 |
| POST | `/doctors` | Registrar médico | 201, 400, 409 |
| GET | `/doctors` | Listar médicos | 200 |
| POST | `/appointments` | Programar cita | 201, 400, 404, 409 |
| GET | `/appointments` | Listar citas. Filtros: `?date=YYYY-MM-DD`, `?patientId=`, `?doctorId=`, `?status=PENDIENTE` | 200, 400 |
| GET | `/appointments/:id` | Consultar una cita | 200, 404 |
| PATCH | `/appointments/:id/status` | Cambiar estado (`PENDIENTE`, `CONFIRMADA`, `ATENDIDA`, `CANCELADA`) | 200, 400, 404, 409 |
| DELETE | `/appointments/:id` | Cancelación lógica (estado `CANCELADA`, conserva historial) | 200, 404, 409 |
| GET | `/health` | Estado del servicio | 200 |

## Cómo levantar el proyecto (cualquier persona, sin clonar el código fuente)

Requisito: Docker con Docker Compose.

```bash
git clone https://github.com/katherine-vasquez/citas-medicas.git
cd citas-medicas
cp .env.example .env        # editar DOCKERHUB_USERNAME y las claves
docker compose pull         # descarga las imágenes publicadas en Docker Hub
docker compose up -d        # levanta db + notifications + backend
```

La API queda en `http://localhost:3000` y el servicio de notificaciones en `http://localhost:4000/notifications`.

### Comandos de Docker Compose

```bash
docker compose up -d              # levantar
docker compose ps                 # ver estado
docker compose logs -f backend    # ver logs
docker compose stop               # detener (conserva contenedores)
docker compose down               # detener y eliminar contenedores (el volumen se conserva)
docker compose up -d --build      # reconstruir las imágenes desde el código y levantar
docker compose down -v            # eliminar también el volumen de datos
```

### Pruebas rápidas

```bash
curl http://localhost:3000/patients
curl "http://localhost:3000/appointments?date=2026-11-02"
curl -X POST http://localhost:3000/appointments -H "Content-Type: application/json" \
  -d '{"patientId":5,"doctorId":2,"dateTime":"2026-11-10T15:00:00Z","reason":"Control"}'
curl -X PATCH http://localhost:3000/appointments/1/status -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMADA"}'
curl -X DELETE http://localhost:3000/appointments/1
curl http://localhost:4000/notifications
```

## Docker Hub

Imágenes propias:

- [`katherinevasquez/citas-backend`](https://hub.docker.com/r/katherinevasquez/citas-backend) — etiquetas `latest`, `1.0.0` y SHA del commit
- [`katherinevasquez/citas-notifications`](https://hub.docker.com/r/katherinevasquez/citas-notifications) — etiquetas `latest`, `1.0.0` y SHA del commit

Las publica automáticamente el pipeline de GitHub Actions. Proceso manual equivalente:

```bash
docker login
docker build -t USUARIO/citas-backend:1.0.0 ./backend
docker tag USUARIO/citas-backend:1.0.0 USUARIO/citas-backend:latest
docker push USUARIO/citas-backend:1.0.0
docker push USUARIO/citas-backend:latest
# igual para ./notifications → USUARIO/citas-notifications
```

## CI/CD (GitHub Actions)

Archivo: `.github/workflows/ci-cd.yml`. Se ejecuta en cada `push` y `pull request` a `main`:

1. **test**: descarga el código, instala Node 20, `npm ci`, `prisma validate`, verificación de sintaxis y `npm test`.
2. **build-and-push**: construye ambas imágenes; en `push` a `main` inicia sesión en Docker Hub con los secretos `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` y publica las imágenes con etiquetas `latest`, versión y commit.

Secretos requeridos en GitHub → *Settings → Secrets and variables → Actions*: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Desarrollo local sin Docker

```bash
cd backend
npm install
# DATABASE_URL apuntando a un MySQL (local o en la nube, ej. Aiven)
export DATABASE_URL="mysql://usuario:clave@host:3306/citas_medicas"
npx prisma migrate deploy
npm run seed
npm run dev
npm test        # pruebas (no necesitan base de datos)
```
