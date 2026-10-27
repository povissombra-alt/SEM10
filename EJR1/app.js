
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tienda.db');


function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const esEscritura = /^\s*(INSERT|UPDATE|DELETE)/i.test(sql);

    if (esEscritura) {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    } else {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    }
  });
}


async function main() {
  try {

    await query(`DROP TABLE IF EXISTS productos`);

    await query(`
      CREATE TABLE productos (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre  TEXT    NOT NULL,
        precio  REAL    NOT NULL,
        stock   INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log('✅ Tabla "productos" creada.');

    const productos = [
      ['Mouse Gamer', 25.5, 10],
      ['Teclado Mecánico', 45.0, 0],
      ['Monitor 24"', 180.0, 5],
    ];

    for (const [nombre, precio, stock] of productos) {
      const resultado = await query(
        'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
        [nombre, precio, stock]
      );
      console.log(
        `   ➕ Insertado "${nombre}" con id=${resultado.lastID}`
      );
    }
    console.log('✅ 3 productos insertados.\n');


    const todos = await query('SELECT * FROM productos ORDER BY id');
    console.log('📦 Productos en inventario:');
    console.table(todos);


    const idActualizar = 1;
    const nuevoStock = 15;

    const actualizacion = await query(
      'UPDATE productos SET stock = ? WHERE id = ?',
      [nuevoStock, idActualizar]
    );
    console.log(
      `✅ Stock actualizado: ${actualizacion.changes} fila(s) afectada(s).`
    );

    const actualizado = await query(
      'SELECT * FROM productos WHERE id = ?',
      [idActualizar]
    );
    console.log(
      `   → "${actualizado[0].nombre}" ahora tiene stock ${actualizado[0].stock}.\n`
    );

    const sinStock = await query(
      'SELECT * FROM productos WHERE stock = 0 LIMIT 1'
    );

    if (sinStock.length > 0) {
      const producto = sinStock[0];
      const borrado = await query('DELETE FROM productos WHERE id = ?', [
        producto.id,
      ]);
      console.log(
        `🗑️  Eliminado "${producto.nombre}" (id=${producto.id}, stock=0). ` +
        `Filas borradas: ${borrado.changes}.\n`
      );
    } else {
      console.log('ℹ️  No hay productos con stock 0 para eliminar.\n');
    }


    const final = await query('SELECT * FROM productos ORDER BY id');
    console.log('📋 Inventario final:');
    console.table(final);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    db.close((err) => {
      if (err) console.error('Error al cerrar la BD:', err.message);
      else console.log('\n🔌 Conexión cerrada.');
    });
  }
}

main();
