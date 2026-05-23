const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// Ruta raíz - servir main.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

// Conexión a la base de datos PostgreSQL (Neon)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function connectDatabase() {
    try {
        await pool.connect();
        console.log('Conectado a la base de datos PostgreSQL (Neon)');
        await initializeDatabase();
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        console.log('Asegúrate de configurado el DATABASE_URL en el archivo .env');
    }
}

// Inicializar base de datos
async function initializeDatabase() {
    try {
        // Tabla de usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de productos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT NOT NULL,
                image TEXT,
                seller_id INTEGER NOT NULL,
                seller_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES users(id)
            )
        `);

        // Tabla de tarjetas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cards (
                id SERIAL PRIMARY KEY,
                number VARCHAR(255) NOT NULL,
                last4 VARCHAR(4) NOT NULL,
                name VARCHAR(255) NOT NULL,
                expiry VARCHAR(10) NOT NULL,
                cvv VARCHAR(3) NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Tabla de reseñas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                author VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                rating INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
}

// ==================== RUTAS API ====================

// Rutas de usuarios
app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username y password son requeridos' });
        return;
    }

    try {
        const result = await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *', [username, password, role || 'user']);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username y password son requeridos' });
        return;
    }

    try {
        await pool.query('UPDATE users SET username = $1, password = $2 WHERE id = $3', [username, password, req.params.id]);
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rutas de productos
app.get('/api/products', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const { title, price, description, image, sellerId, sellerName } = req.body;
    if (!title || !price || !description || !sellerId || !sellerName) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
    }

    try {
        const result = await pool.query('INSERT INTO products (title, price, description, image, seller_id, seller_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
            [title, price, description, image, sellerId, sellerName]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { title, price, description, image } = req.body;
    if (!title || !price || !description) {
        res.status(400).json({ error: 'Title, price y description son requeridos' });
        return;
    }

    try {
        await pool.query('UPDATE products SET title = $1, price = $2, description = $3, image = $4 WHERE id = $5', 
            [title, price, description, image, req.params.id]);
        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rutas de tarjetas
app.get('/api/cards', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM cards');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cards', async (req, res) => {
    const { number, last4, name, expiry, cvv, userId } = req.body;
    if (!number || !last4 || !name || !expiry || !cvv || !userId) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
    }

    try {
        const result = await pool.query('INSERT INTO cards (number, last4, name, expiry, cvv, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
            [number, last4, name, expiry, cvv, userId]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cards/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM cards WHERE id = $1', [req.params.id]);
        res.json({ message: 'Tarjeta eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rutas de reseñas
app.get('/api/reviews', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM reviews');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reviews/product/:productId', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM reviews WHERE product_id = $1', [req.params.productId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    const { productId, author, text, rating } = req.body;
    if (!productId || !author || !text || !rating) {
        res.status(400).json({ error: 'Todos los campos son requeridos' });
        return;
    }

    try {
        const result = await pool.query('INSERT INTO reviews (product_id, author, text, rating) VALUES ($1, $2, $3, $4) RETURNING *', 
            [productId, author, text, rating]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ message: 'Reseña eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar servidor
connectDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al iniciar el servidor:', err);
});
