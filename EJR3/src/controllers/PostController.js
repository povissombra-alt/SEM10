const PostModel = require('../models/PostModel');

// Capa de Controlador: Maneja peticiones HTTP (req, res), orquesta servicios/modelos
class PostController {
  // GET /api/posts
  static async getAll(req, res) {
    try {
      const posts = await PostModel.findAll();
      return res.status(200).json({
        success: true,
        count: posts.length,
        data: posts
      });
    } catch (error) {
      console.error('Error al obtener posts:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al consultar posts'
      });
    }
  }

  // GET /api/posts/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const post = await PostModel.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: `No se encontró ningún post con el ID: ${id}`
        });
      }

      return res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error al obtener post:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/posts
  static async create(req, res) {
    try {
      // Los datos ya vienen validados y limpios por el middleware de Zod
      const { title, content, author } = req.body;

      const newPost = await PostModel.create({ title, content, author });

      return res.status(201).json({
        success: true,
        message: 'Post tecnológico creado exitosamente',
        data: newPost
      });
    } catch (error) {
      console.error('Error al crear post:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor al guardar el post'
      });
    }
  }

  // DELETE /api/posts/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await PostModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `No se encontró ningún post con el ID: ${id}`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Post eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar post:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = PostController;
