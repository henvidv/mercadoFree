# Mercado Libre - Sistema de Compra y Venta

Sistema de e-commerce con CRUD completo para gestión de usuarios, productos, tarjetas y reseñas. Diseño responsive para móviles y tablets.

## 🚀 Despliegue en Vercel

### Prerrequisitos

1. **Cuenta en Vercel**: [Regístrate gratis](https://vercel.com/signup)
2. **Base de datos PostgreSQL en la nube**: Recomendado usar [Neon](https://neon.tech/) (Gratis para desarrollo)

### Pasos para Desplegar

#### 1. Preparar la Base de Datos

Crea una base de datos PostgreSQL en Neon y obtén la connection string (DATABASE_URL).

#### 2. Configurar Variables de Entorno en Vercel

Durante el despliegue, Vercel te pedirá configurar la siguiente variable de entorno:

```
DATABASE_URL=postgresql://usuario:password@ep-neon-host.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### 3. Desplegar con Vercel CLI

Opción A: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel
```

Opción B: Desde GitHub

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Click en "Add New Project"
4. Importa tu repositorio de GitHub
5. Configura las variables de entorno
6. Click en "Deploy"

#### 4. Configurar Dominio (Opcional)

Vercel te proporcionará un dominio gratuito (ej: `tu-proyecto.vercel.app`). Puedes configurar un dominio personalizado en la configuración del proyecto.

## 📁 Estructura del Proyecto

```
mercado-libre-proyecto/
├── api/                    # Vercel Serverless Functions
│   ├── db.js              # Utilidad de conexión a base de datos
│   ├── users.js           # API de usuarios
│   ├── products.js        # API de productos
│   ├── cards.js           # API de tarjetas
│   └── reviews.js         # API de reseñas
├── views/                  # Archivos HTML
│   ├── main.html          # Página principal
│   ├── admin.html         # Panel de administración
│   ├── cart.html          # Carrito de compras
│   ├── checkout.html      # Página de pago
│   └── search.html        # Página de búsqueda
├── scripts/                # Archivos JavaScript y CSS
│   ├── script.js          # Lógica principal
│   ├── admin.js           # Lógica de administración
│   ├── api.js             # Cliente API
│   ├── cart.js            # Lógica del carrito
│   ├── cards.js           # Lógica de tarjetas
│   ├── search.js          # Lógica de búsqueda
│   └── styles.css         # Estilos CSS (responsive)
├── server.js              # Servidor Express (para desarrollo local)
├── vercel.json            # Configuración de Vercel
├── package.json           # Dependencias de Node.js
└── .env.example           # Ejemplo de variables de entorno
```

## 🛠️ Desarrollo Local

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL de Neon
```

### Ejecutar en Local

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📱 Características Responsive

El diseño es completamente responsive y se adapta a:
- **Móviles** (≤ 480px)
- **Tablets** (481px - 1024px)
- **Desktop** (> 1024px)

## 🔧 API Endpoints

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Tarjetas
- `GET /api/cards` - Obtener todas las tarjetas
- `POST /api/cards` - Crear tarjeta
- `DELETE /api/cards/:id` - Eliminar tarjeta

### Reseñas
- `GET /api/reviews` - Obtener todas las reseñas
- `GET /api/reviews/product/:productId` - Obtener reseñas de un producto
- `POST /api/reviews` - Crear reseña
- `DELETE /api/reviews/:id` - Eliminar reseña

## 🗄️ Base de Datos

El sistema crea automáticamente las siguientes tablas:
- `users` - Usuarios del sistema
- `products` - Productos disponibles
- `cards` - Tarjetas de pago
- `reviews` - Reseñas de productos

## 📝 Notas Importantes

1. **Base de Datos**: El proyecto usa PostgreSQL (Neon) para producción. No uses bases de datos locales para despliegue en Vercel.

2. **Connection Pooling**: La configuración usa connection pooling para optimizar el rendimiento en entorno serverless.

3. **CORS**: Los endpoints de API tienen CORS habilitado para permitir peticiones desde cualquier origen.

4. **Seguridad**: En producción, implementa autenticación real (JWT, OAuth) y encriptación de contraseñas (bcrypt).

## 🐛 Solución de Problemas

### Error de conexión a base de datos
- Verifica que las variables de entorno estén correctamente configuradas en Vercel
- Asegúrate de que la base de datos sea accesible desde Vercel (IP whitelisting si es necesario)

### Error 404 en API
- Verifica que los archivos en `/api` tengan la extensión `.js`
- Asegúrate de que `vercel.json` esté en la raíz del proyecto

### Problemas con imágenes
- Las imágenes se almacenan como URLs. Para producción, considera usar un servicio de almacenamiento como AWS S3 o Cloudinary.

## 📄 Licencia

ISC
