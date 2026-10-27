const app = require('./app');
const db = require('./db');

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`API de usuarios de biblioteca escuchando en http://localhost:${PORT}`);
  console.log(`Base de datos SQLite: ${db.dbFile}`);
});

function cerrar(senal) {
  console.log(`\n${senal} recibido: cerrando servidor...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => cerrar('SIGINT'));
process.on('SIGTERM', () => cerrar('SIGTERM'));
