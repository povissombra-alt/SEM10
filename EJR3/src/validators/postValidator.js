const { z } = require('zod');

// Esquema de validación para la creación de un Post
const createPostSchema = z.object({
  title: z
    .string({
      required_error: 'El título es obligatorio',
      invalid_type_error: 'El título debe ser un texto'
    })
    .trim()
    .min(1, 'El título no puede estar vacío')
    .max(120, 'El título no puede superar los 120 caracteres'),
  content: z
    .string({
      required_error: 'El contenido es obligatorio',
      invalid_type_error: 'El contenido debe ser un texto'
    })
    .trim()
    .min(10, 'El contenido debe tener al menos 10 caracteres'),
  author: z
    .string()
    .trim()
    .max(50, 'El autor no puede superar los 50 caracteres')
    .optional()
});

// Middleware genérico para validar el body con un esquema de Zod
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Formatear los errores de validación de Zod
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados',
      errors
    });
  }

  // Asignamos la data saneada/parseada a req.body
  req.body = result.data;
  next();
};

module.exports = {
  createPostSchema,
  validateBody
};
