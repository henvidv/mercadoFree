// Configuración de la API
// Usa ruta relativa para funcionar tanto en local como en Vercel
const API_BASE_URL = '/api';

// ==================== API USUARIOS ====================
async function getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    return response.json();
}

async function getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return response.json();
}

async function createUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return response.json();
}

async function updateUser(id, username, password) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return response.json();
}

async function deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
    });
    return response.json();
}

// ==================== API PRODUCTOS ====================
async function getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    return response.json();
}

async function getProductById(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
}

async function createProduct(title, price, description, image, sellerId, sellerName) {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price, description, image, sellerId, sellerName })
    });
    return response.json();
}

async function updateProduct(id, title, price, description, image) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price, description, image })
    });
    return response.json();
}

async function deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
    });
    return response.json();
}

// ==================== API TARJETAS ====================
async function getCards() {
    const response = await fetch(`${API_BASE_URL}/cards`);
    return response.json();
}

async function createCard(number, last4, name, expiry, cvv, userId) {
    const response = await fetch(`${API_BASE_URL}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, last4, name, expiry, cvv, userId })
    });
    return response.json();
}

async function deleteCard(id) {
    const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
        method: 'DELETE'
    });
    return response.json();
}

// ==================== API RESEÑAS ====================
async function getReviews() {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    return response.json();
}

async function getReviewsByProductId(productId) {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    return response.json();
}

async function createReview(productId, author, text, rating) {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, author, text, rating })
    });
    return response.json();
}

async function deleteReview(id) {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE'
    });
    return response.json();
}
