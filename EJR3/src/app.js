require('dotenv').config();
const express = require('express');
const postRoutes = require('./routes/postRoutes');
require('./config/database'); // Inicializa la conexión y tablas de SQLite

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/posts', postRoutes);

// Ruta de bienvenida / salud
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API del Blog Tecnológico - Arquitectura en Capas con SQLite & Zod',
    endpoints: {
      getPosts: 'GET /api/posts',
      getPostById: 'GET /api/posts/:id',
      createPost: 'POST /api/posts',
      deletePost: 'DELETE /api/posts/:id'
    }
  });
});

// Middleware 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Iniciar servidor solo si no es importado en pruebas
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
