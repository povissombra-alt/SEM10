# API REST - Gestión de Usuarios de Biblioteca

API REST construida con **Express.js** y **SQLite** (mediante `better-sqlite3`) para gestionar los usuarios de una biblioteca. Responde siempre en JSON y utiliza los códigos de estado HTTP adecuados.

## Requisitos

- Node.js 18 o superior (probado con Node 20).

## Instalación y ejecución

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # modo watch (recarga automática)
npm test           # pruebas de humo con SQLite en memoria
```

La base de datos se crea automáticamente en `data/biblioteca.db` la primera vez que arranca el servidor. Puedes cambiar la ubicación con la variable de entorno `DB_FILE` y el puerto con `PORT`:

```bash
set PORT=4000
set DB_FILE=C:\ruta\mi-base.db
npm start
```

## Estructura del proyecto

```
EJR2/
├── src/
│   ├── app.js              # Configuración de Express, middlewares y manejo de errores
│   ├── server.js           # Arranque del servidor y cierre ordenado
│   ├── db.js               # Conexión SQLite y creación de la tabla
│   └── routes/
│       └── usuarios.js     # Rutas /usuarios y validaciones
├── test/
│   └── api.test.js         # Pruebas de humo (node:test)
├── data/                   # Base de datos SQLite (se crea sola, no se versiona)
└── package.json
```

## Modelo de datos

Tabla `usuarios`:

| Campo            | Tipo    | Descripción                              |
| ---------------- | ------- | ---------------------------------------- |
| `id`             | INTEGER | Clave primaria autoincremental           |
| `nombre`         | TEXT    | Nombre del usuario (obligatorio)         |
| `correo`         | TEXT    | Correo único (obligatorio, en minúsculas)|
| `creado_en`      | TEXT    | Fecha de creación (UTC)                  |
| `actualizado_en` | TEXT    | Fecha de la última actualización (UTC)   |

## Endpoints

| Método   | Ruta            | Descripción                              | Éxito | Errores habituales |
| -------- | --------------- | ---------------------------------------- | ----- | ------------------ |
| `GET`    | `/usuarios`     | Lista completa de usuarios               | 200   | 500                |
| `GET`    | `/usuarios/:id` | Obtiene un usuario                       | 200   | 400, 404, 500      |
| `POST`   | `/usuarios`     | Crea un usuario                          | 201   | 400, 409, 500      |
| `PUT`    | `/usuarios/:id` | Actualiza `nombre` y/o `correo`          | 200   | 400, 404, 409, 500 |
| `DELETE` | `/usuarios/:id` | Elimina un usuario                       | 204   | 400, 404, 500      |
| `GET`    | `/health`       | Comprueba que el servidor está vivo      | 200   | -                  |

### Códigos de estado utilizados

- **200 OK**: consulta o actualización correcta.
- **201 Created**: usuario creado (incluye el usuario con su `id`).
- **204 No Content**: usuario eliminado (sin cuerpo en la respuesta).
- **400 Bad Request**: JSON mal formado, campos ausentes o inválidos, `id` no numérico.
- **404 Not Found**: el usuario o la ruta no existen.
- **409 Conflict**: el correo ya está registrado por otro usuario.
- **500 Internal Server Error**: error inesperado del servidor (se registra en consola).

## Ejemplos de uso

### Crear un usuario (201)

```bash
curl -i -X POST http://localhost:3000/usuarios ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Ana Perez\",\"correo\":\"ana@example.com\"}"
```

Respuesta:

```json
{
  "id": 1,
  "nombre": "Ana Perez",
  "correo": "ana@example.com",
  "creado_en": "2026-10-27 10:00:00",
  "actualizado_en": "2026-10-27 10:00:00"
}
```

### Listar usuarios (200)

```bash
curl http://localhost:3000/usuarios
```

```json
[
  {
    "id": 1,
    "nombre": "Ana Perez",
    "correo": "ana@example.com",
    "creado_en": "2026-10-27 10:00:00",
    "actualizado_en": "2026-10-27 10:00:00"
  }
]
```

### Actualizar un usuario (200)

Se puede enviar solo `nombre`, solo `correo` o ambos.

```bash
curl -i -X PUT http://localhost:3000/usuarios/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"correo\":\"ana.nueva@example.com\"}"
```

### Eliminar un usuario (204)

```bash
curl -i -X DELETE http://localhost:3000/usuarios/1
```

### Errores de ejemplo

```json
// 400 - datos inválidos
{
  "error": "Datos inválidos.",
  "detalles": ["El campo \"correo\" debe tener un formato de correo válido."]
}

// 404 - usuario inexistente
{ "error": "No existe un usuario con id 42." }

// 409 - correo duplicado
{ "error": "Ya existe un usuario con el correo ana@example.com." }

// 500 - error interno
{ "error": "Error interno del servidor." }
```

## Notas de implementación

- Las consultas usan **sentencias preparadas** de `better-sqlite3`, lo que evita inyección SQL.
- El correo se normaliza a minúsculas y la columna tiene una restricción `UNIQUE`; los duplicados se traducen a `409`.
- `express.json()` parsea el body; un JSON mal formado se captura en el middleware de errores y devuelve `400`.
- Cualquier excepción no controlada pasa al manejador central y devuelve `500` sin filtrar detalles internos al cliente.
- El servidor cierra la conexión a SQLite al recibir `SIGINT`/`SIGTERM`.
