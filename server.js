const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// Ruta raíz - servir main.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

// Conexión a la base de datos MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mercado_libre'
};

let db;

async function connectDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Conectado a la base de datos MySQL');
        await initializeDatabase();
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        console.log('Asegúrate de tener XAMPP iniciado y la base de datos creada');
    }
}

// Inicializar base de datos
async function initializeDatabase() {
    try {
        // Tabla de usuarios
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de productos
        await db.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                description TEXT NOT NULL,
                image TEXT,
                seller_id INT NOT NULL,
                seller_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES users(id)
            )
        `);

        // Tabla de tarjetas
        await db.execute(`
            CREATE TABLE IF NOT EXISTS cards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                number VARCHAR(255) NOT NULL,
                last4 VARCHAR(4) NOT NULL,
                name VARCHAR(255) NOT NULL,
                expiry VARCHAR(10) NOT NULL,
                cvv VARCHAR(3) NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Tabla de reseñas
        await db.execute(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                author VARCHAR(255) NOT NULL,
                text TEXT NOT NULL,
                rating INT NOT NULL,
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
        const [rows] = await db.execute('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
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
        const [result] = await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role || 'user']);
        res.json({ id: result.insertId, username, password, role: role || 'user' });
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
        await db.execute('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, req.params.id]);
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rutas de productos
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
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
        const [result] = await db.execute('INSERT INTO products (title, price, description, image, seller_id, seller_name) VALUES (?, ?, ?, ?, ?, ?)', 
            [title, price, description, image, sellerId, sellerName]);
        res.json({ id: result.insertId, title, price, description, image, sellerId, sellerName });
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
        await db.execute('UPDATE products SET title = ?, price = ?, description = ?, image = ? WHERE id = ?', 
            [title, price, description, image, req.params.id]);
        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rutas de tarjetas
app.get('/api/cards', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM cards');
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
        const [result] = await db.execute('INSERT INTO cards (number, last4, name, expiry, cvv, user_id) VALUES (?, ?, ?, ?, ?, ?)', 
            [number, last4, name, expiry, cvv, userId]);
        res.json({ id: result.insertId, number, last4, name, expiry, cvv, userId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cards/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM cards WHERE id = ?', [req.params.id]);
        res.json({ message: 'Tarjeta eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rutas de reseñas
app.get('/api/reviews', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM reviews');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reviews/product/:productId', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM reviews WHERE product_id = ?', [req.params.productId]);
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
        const [result] = await db.execute('INSERT INTO reviews (product_id, author, text, rating) VALUES (?, ?, ?, ?)', 
            [productId, author, text, rating]);
        res.json({ id: result.insertId, productId, author, text, rating });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
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
