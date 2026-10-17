// Manejo centralizado de errores → respuestas JSON con códigos HTTP adecuados.
const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }
  // Errores conocidos de Prisma
  if (err.code === 'P2002') return res.status(409).json({ error: 'Registro duplicado' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Registro no encontrado' });

  console.error('[error]', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
