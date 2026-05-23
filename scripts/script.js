// Initialize data
let users = [];
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let reviews = [];

// Load data from API on page load
async function loadInitialData() {
    try {
        users = await getUsers();
        products = await getProducts();
        reviews = await getReviews();
    } catch (error) {
        console.error('Error loading data from API:', error);
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Navigation functions
function showHome() {
    hideAllSections();
    document.getElementById('productsSection').classList.remove('hidden');
    renderProducts();
    updateAuthUI();
}

function showLogin() {
    hideAllSections();
    document.getElementById('loginSection').classList.remove('hidden');
}

function showRegister() {
    hideAllSections();
    document.getElementById('registerSection').classList.remove('hidden');
}

function showAddProduct() {
    hideAllSections();
    document.getElementById('addProductSection').classList.remove('hidden');
}

function showEditProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductTitle').value = product.title;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductImage').value = product.image || '';

    hideAllSections();
    document.getElementById('editProductSection').classList.remove('hidden');
}

function showProducts() {
    hideAllSections();
    document.getElementById('productsSection').classList.remove('hidden');
    renderProducts();
}

function showCart() {
    hideAllSections();
    document.getElementById('cartSection').classList.remove('hidden');
    renderCart();
}

function hideAllSections() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('registerSection').classList.add('hidden');
    document.getElementById('addProductSection').classList.add('hidden');
    document.getElementById('editProductSection').classList.add('hidden');
    document.getElementById('productsSection').classList.add('hidden');
    document.getElementById('productDetailSection').classList.add('hidden');
}

// Authentication functions
function updateAuthUI() {
    const navButtons = document.getElementById('navButtons');
    const userInfo = document.getElementById('userInfo');
    const addProductBtn = document.getElementById('addProductBtn');
    const adminButton = document.getElementById('adminButton');
    const adminButtonLoggedIn = document.getElementById('adminButtonLoggedIn');

    if (currentUser) {
        navButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('userAvatar').textContent = currentUser.username[0].toUpperCase();
        addProductBtn.style.display = 'block';
        
        // Mostrar botón de admin solo si el usuario tiene rol admin
        if (currentUser.role === 'admin') {
            if (adminButtonLoggedIn) adminButtonLoggedIn.classList.remove('hidden');
            if (adminButton) adminButton.classList.remove('hidden');
        } else {
            if (adminButtonLoggedIn) adminButtonLoggedIn.classList.add('hidden');
            if (adminButton) adminButton.classList.add('hidden');
        }
    } else {
        navButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
        addProductBtn.style.display = 'none';
        
        // Ocultar botones de admin cuando no hay usuario logueado
        if (adminButton) adminButton.classList.add('hidden');
        if (adminButtonLoggedIn) adminButtonLoggedIn.classList.add('hidden');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const allUsers = await getUsers();
        const user = allUsers.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = {
                id: user.id,
                username: user.username,
                role: user.role || 'user'
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert(`¡Bienvenido, ${username}!`);
            showHome();
        } else {
            showAlert('Usuario o contraseña incorrectos', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showAlert('Error al iniciar sesión', 'error');
    }
}

async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (!username || !password || !passwordConfirm) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showAlert('Las contraseñas no coinciden', 'error');
        return;
    }

    if (users.find(u => u.username === username)) {
        showAlert('El usuario ya existe', 'error');
        return;
    }

    try {
        const newUser = await createUser(username, password);
        users.push(newUser);
        showAlert('¡Registro exitoso! Ahora puedes iniciar sesión');
        showLogin();
    } catch (error) {
        showAlert('Error al registrar usuario', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    showAlert('Has cerrado sesión');
    showHome();
}

// Product CRUD functions
function renderProducts() {
    const productsList = document.getElementById('productsList');
    const recommendedList = document.getElementById('recommendedList');
    productsList.innerHTML = '';
    recommendedList.innerHTML = '';

    if (products.length === 0) {
        productsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay productos disponibles</p>';
        document.getElementById('recommendedSection').style.display = 'none';
        return;
    }

    // Render recommended products (first 4 products)
    const recommendedProducts = products.slice(0, 4);
    if (recommendedProducts.length > 0) {
        document.getElementById('recommendedSection').style.display = 'block';
        recommendedProducts.forEach(product => {
            const card = createProductCard(product);
            recommendedList.appendChild(card);
        });
    } else {
        document.getElementById('recommendedSection').style.display = 'none';
    }

    // Render all products
    products.forEach(product => {
        const card = createProductCard(product);
        productsList.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const imageHtml = product.image 
        ? `<img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="product-image" style="display:none;">📦</div>`
        : '<div class="product-image">📦</div>';

    const actionsHtml = currentUser && currentUser.id === product.sellerId
        ? `<button class="btn-secondary" onclick="showEditProduct(${product.id})">Editar</button>
           <button class="btn-danger" onclick="deleteProduct(${product.id})">Eliminar</button>`
        : `<button class="btn-success" onclick="addToCart(${product.id})">Agregar al Carrito</button>`;

    card.innerHTML = `
        ${imageHtml}
        <div class="product-info">
            <div class="product-title">${product.title}</div>
            <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-description">${product.description}</div>
            <div class="product-seller">Vendedor: ${product.sellerName}</div>
            <div class="product-actions">
                <button class="btn-secondary" onclick="showProductDetail(${product.id})">Ver Detalles</button>
                ${actionsHtml}
            </div>
        </div>
    `;
    return card;
}

// Handle Enter key press for search
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchProducts();
    }
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        if (window.location.pathname.includes('search.html')) {
            window.location.href = '/';
        }
        return;
    }
    
    // Navigate to search.html with query parameter
    window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
}

// Show product detail
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    hideAllSections();
    document.getElementById('productDetailSection').classList.remove('hidden');
    
    const productReviews = reviews.filter(r => r.productId === productId);
    const averageRating = productReviews.length > 0 
        ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
        : 'Sin reseñas';
    
    const recommendedProducts = getRecommendedProducts(productId);
    
    const detailContent = document.getElementById('productDetailContent');
    detailContent.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image">
                ${product.image 
                    ? `<img src="${product.image}" alt="${product.title}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" onerror="this.style.display='none'; this.parentElement.innerHTML='📦';">`
                    : '📦'}
            </div>
            <div class="product-detail-info">
                <h2>${product.title}</h2>
                <div class="product-detail-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-detail-description">${product.description}</div>
                <div class="product-detail-seller">Vendedor: ${product.sellerName}</div>
                <div style="margin-bottom: 20px;">
                    <strong>Rating:</strong> ⭐ ${averageRating} (${productReviews.length} reseñas)
                </div>
                <div class="product-actions">
                    <button class="btn-success" onclick="addToCart(${product.id})" style="flex:1; padding:15px;">Agregar al Carrito</button>
                </div>
            </div>
        </div>
        
        <div class="reviews-section">
            <h3>📝 Reseñas</h3>
            ${currentUser ? `
                <div class="review-form">
                    <div class="form-group">
                        <label>Tu reseña</label>
                        <textarea id="reviewText" placeholder="Comparte tu experiencia con este producto"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Rating (1-5)</label>
                        <select id="reviewRating">
                            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                            <option value="4">⭐⭐⭐⭐ (4)</option>
                            <option value="3">⭐⭐⭐ (3)</option>
                            <option value="2">⭐⭐ (2)</option>
                            <option value="1">⭐ (1)</option>
                        </select>
                    </div>
                    <button class="btn-primary" onclick="addReview(${productId})">Publicar Reseña</button>
                </div>
            ` : '<p style="color:#999; margin-bottom:20px;">Inicia sesión para dejar una reseña</p>'}
            
            <div id="reviewsList">
                ${productReviews.length === 0 
                    ? '<p style="color:#999;">No hay reseñas aún. ¡Sé el primero en opinar!</p>'
                    : productReviews.map(review => `
                        <div class="review-item">
                            <div class="review-header">
                                <span class="review-author">${review.author}</span>
                                <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                            </div>
                            <div class="review-text">${review.text}</div>
                        </div>
                    `).join('')}
            </div>
        </div>
        
        <div class="recommendations-section">
            <h3>🔗 Productos Recomendados</h3>
            <div class="products-grid">
                ${recommendedProducts.length === 0 
                    ? '<p style="color:#999;">No hay productos recomendados</p>'
                    : recommendedProducts.map(p => createProductCardHTML(p)).join('')}
            </div>
        </div>
    `;
}

function createProductCardHTML(product) {
    const imageHtml = product.image 
        ? `<img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="product-image" style="display:none;">📦</div>`
        : '<div class="product-image">📦</div>';

    return `
        <div class="product-card">
            ${imageHtml}
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-seller">Vendedor: ${product.sellerName}</div>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="showProductDetail(${product.id})">Ver Detalles</button>
                    <button class="btn-success" onclick="addToCart(${product.id})">Agregar al Carrito</button>
                </div>
            </div>
        </div>
    `;
}

// Get recommended products based on synergy
function getRecommendedProducts(currentProductId) {
    const currentProduct = products.find(p => p.id === currentProductId);
    if (!currentProduct) return [];
    
    // Simple recommendation algorithm: products from same seller or similar price range
    const recommended = products.filter(p => 
        p.id !== currentProductId && 
        (p.sellerId === currentProduct.sellerId || 
         Math.abs(p.price - currentProduct.price) < currentProduct.price * 0.5)
    ).slice(0, 4);
    
    return recommended;
}

// Add review
async function addReview(productId) {
    if (!currentUser) {
        showAlert('Debes iniciar sesión para dejar una reseña', 'error');
        return;
    }
    
    const text = document.getElementById('reviewText').value;
    const rating = parseInt(document.getElementById('reviewRating').value);
    
    if (!text) {
        showAlert('Por favor escribe tu reseña', 'error');
        return;
    }
    
    try {
        const newReview = await createReview(productId, currentUser.username, text, rating);
        reviews.push(newReview);
        showAlert('¡Reseña publicada exitosamente!');
        showProductDetail(productId);
    } catch (error) {
        showAlert('Error al publicar reseña', 'error');
    }
}

async function saveProduct() {
    if (!currentUser) {
        showAlert('Debes iniciar sesión para publicar productos', 'error');
        return;
    }

    const title = document.getElementById('productTitle').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const image = document.getElementById('productImage').value;
    const imageFile = document.getElementById('productImageFile').files[0];

    if (!title || !price || !description) {
        showAlert('Por favor completa los campos obligatorios', 'error');
        return;
    }

    let finalImage = image;
    
    // If a file was uploaded, convert it to base64
    if (imageFile) {
        try {
            finalImage = await fileToBase64(imageFile);
        } catch (error) {
            showAlert('Error al procesar la imagen', 'error');
            return;
        }
    }

    try {
        const newProduct = await createProduct(title, parseFloat(price), description, finalImage, currentUser.id, currentUser.username);
        products.push(newProduct);
        showAlert('¡Producto publicado exitosamente!');
        
        // Clear form
        document.getElementById('productTitle').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productImageFile').value = '';
        
        showProducts();
    } catch (error) {
        showAlert('Error al publicar producto', 'error');
    }
}

async function updateProduct() {
    const productId = parseInt(document.getElementById('editProductId').value);
    const title = document.getElementById('editProductTitle').value;
    const price = document.getElementById('editProductPrice').value;
    const description = document.getElementById('editProductDescription').value;
    const image = document.getElementById('editProductImage').value;
    const imageFile = document.getElementById('editProductImageFile').files[0];

    if (!title || !price || !description) {
        showAlert('Por favor completa los campos obligatorios', 'error');
        return;
    }

    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        showAlert('Producto no encontrado', 'error');
        return;
    }

    if (products[productIndex].sellerId !== currentUser.id) {
        showAlert('No tienes permiso para editar este producto', 'error');
        return;
    }

    let finalImage = image || products[productIndex].image;
    
    // If a file was uploaded, convert it to base64
    if (imageFile) {
        try {
            finalImage = await fileToBase64(imageFile);
        } catch (error) {
            showAlert('Error al procesar la imagen', 'error');
            return;
        }
    }

    try {
        await updateProductApi(productId, title, parseFloat(price), description, finalImage);
        products[productIndex] = {
            ...products[productIndex],
            title,
            price: parseFloat(price),
            description,
            image: finalImage
        };
        showAlert('¡Producto actualizado exitosamente!');
        showProducts();
    } catch (error) {
        showAlert('Error al actualizar producto', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        showAlert('Producto no encontrado', 'error');
        return;
    }

    if (products[productIndex].sellerId !== currentUser.id) {
        showAlert('No tienes permiso para eliminar este producto', 'error');
        return;
    }

    try {
        await deleteProductApi(productId);
        products.splice(productIndex, 1);
        showAlert('¡Producto eliminado exitosamente!');
        renderProducts();
    } catch (error) {
        showAlert('Error al eliminar producto', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    updateAuthUI();
    showHome();
});
