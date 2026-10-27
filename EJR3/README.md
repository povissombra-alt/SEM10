# Blog Tecnológico - Arquitectura en Capas con SQLite y Zod

Proyecto implementado con Node.js y Express siguiendo el patrón de arquitectura en capas (Rutas -> Validaciones -> Controladores -> Modelos/Repositorio -> Base de Datos).

---

## 📁 Estructura del Proyecto

```text
EJR3/
├── .env                  # Variables de entorno (puerto, ruta base de datos)
├── .env.example          # Plantilla de variables de entorno
├── .gitignore            # Archivos y carpetas excluidas de Git
├── package.json          # Dependencias y scripts
├── test.js               # Script de pruebas automatizadas
└── src/
    ├── app.js            # Punto de entrada de la aplicación Express
    ├── config/
    │   └── database.js   # Conexión persistente y configuración de SQLite
    ├── controllers/
    │   └── PostController.js # Lógica de control HTTP (req, res)
    ├── models/
    │   └── PostModel.js  # Lógica de datos y consultas SQL
    ├── routes/
    │   └── postRoutes.js # Definición de endpoints HTTP
    └── validators/
        └── postValidator.js # Esquemas de validación Zod y middleware
```

---

## ⚙️ Requisitos y Tecnologías

- **Node.js** (Entorno de ejecución)
- **Express** (Framework web para endpoints y middlewares)
- **sqlite3** (Driver de base de datos SQLite)
- **dotenv** (Gestión segura de variables de entorno)
- **Zod** (Validación de esquemas y tipos de datos)
- **Nodemon** (Herramienta de desarrollo para reinicio en caliente)

---

## 🚀 Instalación y Ejecución

### 1. Variables de entorno
El archivo `.env` ya está creado con la configuración básica:
```env
PORT=3000
DB_FILE=./database.sqlite
```

### 2. Modo Desarrollo (con Nodemon)
```bash
npm run dev
```

### 3. Modo Producción
```bash
npm start
```

### 4. Ejecutar Pruebas Automatizadas
```bash
node test.js
```

---

## 🛡️ Reglas de Validación (Zod)

Antes de interactuar con la base de datos, el middleware valida:
- `title`: Obligatorio, texto no vacío (después de trim), máximo 120 caracteres.
- `content`: Obligatorio, texto con mínimo 10 caracteres.
- `author`: Opcional, texto con máximo 50 caracteres (por defecto `"Anónimo"`).

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción | Body (JSON) |
|---|---|---|---|
| `GET` | `/api/posts` | Obtener todos los posts | N/A |
| `GET` | `/api/posts/:id` | Obtener un post por ID | N/A |
| `POST` | `/api/posts` | Crear un post | `{"title": "...", "content": "...", "author": "..."}` |
| `DELETE` | `/api/posts/:id` | Eliminar un post | N/A |
