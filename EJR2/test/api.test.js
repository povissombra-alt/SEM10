// Pruebas de humo de la API. Usan una base de datos SQLite en memoria.
// Ejecutar con: npm test
process.env.DB_FILE = ':memory:';

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let servidor;
let baseUrl;

test.before(async () => {
  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${servidor.address().port}`;
});

test.after(() => {
  servidor.close();
  require('../src/db').close();
});

async function pedir(metodo, ruta, body) {
  const res = await fetch(baseUrl + ruta, {
    method: metodo,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await res.text();
  return { status: res.status, body: texto ? JSON.parse(texto) : null };
}

test('POST /usuarios crea un usuario y responde 201', async () => {
  const res = await pedir('POST', '/usuarios', {
    nombre: 'Ana Pérez',
    correo: 'Ana.Perez@Example.com',
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.nombre, 'Ana Pérez');
  assert.equal(res.body.correo, 'ana.perez@example.com');
  assert.ok(res.body.id);
});

test('GET /usuarios devuelve la lista completa', async () => {
  const res = await pedir('GET', '/usuarios');

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.some((u) => u.correo === 'ana.perez@example.com'));
});

test('POST /usuarios rechaza datos inválidos con 400', async () => {
  const res = await pedir('POST', '/usuarios', { nombre: '', correo: 'no-es-correo' });

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Datos inválidos.');
  assert.ok(res.body.detalles.length >= 2);
});

test('POST /usuarios rechaza un correo duplicado con 409', async () => {
  const res = await pedir('POST', '/usuarios', {
    nombre: 'Otra Ana',
    correo: 'ana.perez@example.com',
  });

  assert.equal(res.status, 409);
});

test('PUT /usuarios/:id actualiza el nombre y responde 200', async () => {
  const creado = await pedir('POST', '/usuarios', {
    nombre: 'Luis Soto',
    correo: 'luis@example.com',
  });

  const res = await pedir('PUT', `/usuarios/${creado.body.id}`, { nombre: 'Luis Soto Rojas' });

  assert.equal(res.status, 200);
  assert.equal(res.body.nombre, 'Luis Soto Rojas');
  assert.equal(res.body.correo, 'luis@example.com');
});

test('PUT /usuarios/:id con id inexistente responde 404', async () => {
  const res = await pedir('PUT', '/usuarios/99999', { nombre: 'Nadie' });

  assert.equal(res.status, 404);
});

test('DELETE /usuarios/:id borra el usuario y responde 204', async () => {
  const creado = await pedir('POST', '/usuarios', {
    nombre: 'Temporal',
    correo: 'temporal@example.com',
  });

  const res = await pedir('DELETE', `/usuarios/${creado.body.id}`);
  assert.equal(res.status, 204);

  const otraVez = await pedir('DELETE', `/usuarios/${creado.body.id}`);
  assert.equal(otraVez.status, 404);
});

test('JSON mal formado responde 400', async () => {
  const res = await fetch(`${baseUrl}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{esto no es json',
  });

  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'El body no contiene JSON válido.');
});
