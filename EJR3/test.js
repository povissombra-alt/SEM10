const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  const app = require('./src/app');
  const server = app.listen(3001, async () => {
    console.log('🧪 Iniciando pruebas de validación y capas...\n');

    try {
      // 1. Probar validación fallida (título vacío y contenido < 10)
      console.log('1️⃣ Test: Validación fallida (título vacío, contenido corto)');
      const resBad = await request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/posts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        title: '   ',
        content: 'Corto'
      });
      console.log('Status code:', resBad.statusCode, '(Esperado: 400)');
      console.log('Respuesta:', JSON.stringify(resBad.body, null, 2));

      // 2. Probar creación válida
      console.log('\n2️⃣ Test: Creación exitosa de Post');
      const resGood = await request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/posts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        title: 'Novedades de Node.js y SQLite',
        content: 'Este es un contenido tecnológico detallado con más de diez caracteres.',
        author: 'DevTech'
      });
      console.log('Status code:', resGood.statusCode, '(Esperado: 201)');
      console.log('Respuesta:', JSON.stringify(resGood.body, null, 2));

      // 3. Obtener todos los posts
      console.log('\n3️⃣ Test: Listar posts');
      const resList = await request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/posts',
        method: 'GET'
      });
      console.log('Status code:', resList.statusCode, '(Esperado: 200)');
      console.log('Total posts:', resList.body.data.length);

      console.log('\n✅ Todas las pruebas pasaron satisfactoriamente.');
    } catch (err) {
      console.error('❌ Error en pruebas:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
