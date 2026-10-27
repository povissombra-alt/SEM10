const { query, run, get } = require('../config/database');

// Capa de Modelo / Repositorio: maneja exclusivamente la persistencia y SQL
class PostModel {
  static async findAll() {
    const sql = 'SELECT * FROM posts ORDER BY created_at DESC';
    return await query(sql);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM posts WHERE id = ?';
    return await get(sql, [id]);
  }

  static async create({ title, content, author }) {
    const sql = `
      INSERT INTO posts (title, content, author)
      VALUES (?, ?, ?)
    `;
    const result = await run(sql, [title, content, author || 'Anónimo']);
    return await this.findById(result.id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM posts WHERE id = ?';
    const result = await run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = PostModel;
