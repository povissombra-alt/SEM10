const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { createPostSchema, validateBody } = require('../validators/postValidator');

// Rutas de Posts
router.get('/', PostController.getAll);
router.get('/:id', PostController.getById);

// Ruta protegida con validación Zod: el título no vacío y contenido >= 10 chars antes de ir al controlador/BD
router.post('/', validateBody(createPostSchema), PostController.create);

router.delete('/:id', PostController.delete);

module.exports = router;
