const { Router } = require('express');
const db = require('../db');

const router = Router();

const sql = {
  listar: db.prepare('SELECT * FROM usuarios ORDER BY id'),
  obtener: db.prepare('SELECT * FROM usuarios WHERE id = ?'),
  buscarCorreo: db.prepare('SELECT * FROM usuarios WHERE correo = ?'),
  insertar: db.prepare('INSERT INTO usuarios (nombre, correo) VALUES (?, ?)'),
  actualizar: db.prepare(`
    UPDATE usuarios
       SET nombre = ?,
           correo = ?,
           actualizado_en = datetime('now')
     WHERE id = ?
  `),
  eliminar: db.prepare('DELETE FROM usuarios WHERE id = ?'),
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida y normaliza los datos recibidos.
 * En modo parcial (PUT) solo valida los campos presentes.
 * Devuelve { datos, errores }.
 */
function validarUsuario(body, { parcial = false } = {}) {
  const datos = {};
  const errores = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { datos, errores: ['El cuerpo de la petición debe ser un objeto JSON.'] };
  }

  if (!parcial || body.nombre !== undefined) {
    if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
      errores.push('El campo "nombre" es obligatorio y debe ser un texto no vacío.');
    } else {
      datos.nombre = body.nombre.trim();
    }
  }

  if (!parcial || body.correo !== undefined) {
    if (typeof body.correo !== 'string' || body.correo.trim() === '') {
      errores.push('El campo "correo" es obligatorio y debe ser un texto no vacío.');
    } else if (!EMAIL_REGEX.test(body.correo.trim())) {
      errores.push('El campo "correo" debe tener un formato de correo válido.');
    } else {
      datos.correo = body.correo.trim().toLowerCase();
    }
  }

  return { datos, errores };
}

/** Convierte el parámetro :id en un entero positivo o devuelve null. */
function parseId(valor) {
  if (!/^\d+$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * GET /usuarios
 * Devuelve la lista completa de usuarios.
 */
router.get('/', (req, res) => {
  const usuarios = sql.listar.all();
  res.status(200).json(usuarios);
});

/**
 * GET /usuarios/:id
 * Devuelve un usuario concreto (extra, útil para comprobar el 404).
 */
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El "id" debe ser un número entero positivo.' });
  }

  const usuario = sql.obtener.get(id);
  if (!usuario) {
    return res.status(404).json({ error: `No existe un usuario con id ${id}.` });
  }

  res.status(200).json(usuario);
});

/**
 * POST /usuarios
 * Crea un usuario con los datos del body. Responde 201.
 */
router.post('/', (req, res, next) => {
  const { datos, errores } = validarUsuario(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
  }

  try {
    const info = sql.insertar.run(datos.nombre, datos.correo);
    const usuario = sql.obtener.get(info.lastInsertRowid);
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: `Ya existe un usuario con el correo ${datos.correo}.` });
    }
    next(err);
  }
});

/**
 * PUT /usuarios/:id
 * Actualiza el nombre y/o el correo de un usuario. Responde 200 o 404.
 */
router.put('/:id', (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El "id" debe ser un número entero positivo.' });
  }

  const actual = sql.obtener.get(id);
  if (!actual) {
    return res.status(404).json({ error: `No existe un usuario con id ${id}.` });
  }

  const { datos, errores } = validarUsuario(req.body, { parcial: true });
  if (Object.keys(datos).length === 0 && errores.length === 0) {
    errores.push('Debes enviar al menos uno de los campos "nombre" o "correo".');
  }
  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
  }

  const nombre = datos.nombre ?? actual.nombre;
  const correo = datos.correo ?? actual.correo;

  try {
    sql.actualizar.run(nombre, correo, id);
    res.status(200).json(sql.obtener.get(id));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: `Ya existe otro usuario con el correo ${correo}.` });
    }
    next(err);
  }
});

/**
 * DELETE /usuarios/:id
 * Elimina un usuario. Responde 204 o 404.
 */
router.delete('/:id', (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'El "id" debe ser un número entero positivo.' });
  }

  try {
    const info = sql.eliminar.run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}.` });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
