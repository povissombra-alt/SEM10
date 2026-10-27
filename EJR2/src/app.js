const express = require('express');
const usuariosRouter = require('./routes/usuarios');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ estado: 'ok' });
});

app.use('/usuarios', usuariosRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});


app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El body no contiene JSON válido.' });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
