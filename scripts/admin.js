// Mostrar sección específica
async function showSection(section) {
    document.getElementById('usersSection').classList.add('hidden');
    document.getElementById('productsSection').classList.add('hidden');
    document.getElementById('cardsSection').classList.add('hidden');
    document.getElementById('reviewsSection').classList.add('hidden');
    
    document.getElementById(section + 'Section').classList.remove('hidden');
    
    if (section === 'users') await renderUsers();
    if (section === 'products') await renderProductsAdmin();
    if (section === 'cards') await renderCardsAdmin();
    if (section === 'reviews') await renderReviewsAdmin();
}

// ==================== CRUD USUARIOS ====================
async function renderUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    const usersData = await getUsers();
    
    if (usersData.length === 0) {
        usersList.innerHTML = '<p style="text-align: center; color: #999;">No hay usuarios registrados</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    table.innerHTML = `
        <thead>
            <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">ID</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Usuario</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${usersData.map(user => `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${user.id}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${user.username}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button class="btn-secondary" onclick="editUser(${user.id})">Editar</button>
                        <button class="btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    usersList.appendChild(table);
}

function showUserForm() {
    document.getElementById('userForm').classList.remove('hidden');
    document.getElementById('userFormTitle').textContent = 'Nuevo Usuario';
    document.getElementById('editUserId').value = '';
    document.getElementById('userUsername').value = '';
    document.getElementById('userPassword').value = '';
}

function hideUserForm() {
    document.getElementById('userForm').classList.add('hidden');
}

async function saveUser() {
    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('userUsername').value;
    const password = document.getElementById('userPassword').value;
    
    if (!username || !password) {
        showAlert('Por favor completa todos los campos', 'error');
        return;
    }
    
    try {
        if (userId) {
            await updateUser(userId, username, password);
        } else {
            await createUser(username, password);
        }
        showAlert('Usuario guardado exitosamente');
        hideUserForm();
        renderUsers();
    } catch (error) {
        showAlert('Error al guardar usuario', 'error');
    }
}

async function editUser(userId) {
    const user = await getUserById(userId);
    if (!user) return;
    
    document.getElementById('userForm').classList.remove('hidden');
    document.getElementById('userFormTitle').textContent = 'Editar Usuario';
    document.getElementById('editUserId').value = user.id;
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userPassword').value = user.password;
}

async function deleteUser(userId) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
        try {
            await deleteUserApi(userId);
            showAlert('Usuario eliminado');
            renderUsers();
        } catch (error) {
            showAlert('Error al eliminar usuario', 'error');
        }
    }
}

// ==================== CRUD PRODUCTOS ====================
async function renderProductsAdmin() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    
    const productsData = await getProducts();
    
    if (productsData.length === 0) {
        productsList.innerHTML = '<p style="text-align: center; color: #999;">No hay productos registrados</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    table.innerHTML = `
        <thead>
            <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">ID</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Título</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Precio</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Vendedor</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${productsData.map(product => `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${product.id}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${product.title}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">$${parseFloat(product.price).toFixed(2)}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${product.seller_name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button class="btn-secondary" onclick="editProductAdmin(${product.id})">Editar</button>
                        <button class="btn-danger" onclick="deleteProductAdmin(${product.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    productsList.appendChild(table);
}

function showProductForm() {
    document.getElementById('productForm').classList.remove('hidden');
    document.getElementById('productFormTitle').textContent = 'Nuevo Producto';
    document.getElementById('editProductId').value = '';
    document.getElementById('adminProductTitle').value = '';
    document.getElementById('adminProductPrice').value = '';
    document.getElementById('adminProductDescription').value = '';
    document.getElementById('adminProductImage').value = '';
    document.getElementById('adminProductSellerId').value = '';
}

function hideProductForm() {
    document.getElementById('productForm').classList.add('hidden');
}

async function saveProductAdmin() {
    const productId = document.getElementById('editProductId').value;
    const title = document.getElementById('adminProductTitle').value;
    const price = document.getElementById('adminProductPrice').value;
    const description = document.getElementById('adminProductDescription').value;
    const image = document.getElementById('adminProductImage').value;
    const sellerId = document.getElementById('adminProductSellerId').value;
    
    if (!title || !price || !description || !sellerId) {
        showAlert('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    try {
        if (productId) {
            await updateProductApi(productId, title, parseFloat(price), description, image);
        } else {
            await createProduct(title, parseFloat(price), description, image, parseInt(sellerId), 'Admin');
        }
        showAlert('Producto guardado exitosamente');
        hideProductForm();
        renderProductsAdmin();
    } catch (error) {
        showAlert('Error al guardar producto', 'error');
    }
}

async function editProductAdmin(productId) {
    const product = await getProductById(productId);
    if (!product) return;
    
    document.getElementById('productForm').classList.remove('hidden');
    document.getElementById('productFormTitle').textContent = 'Editar Producto';
    document.getElementById('editProductId').value = product.id;
    document.getElementById('adminProductTitle').value = product.title;
    document.getElementById('adminProductPrice').value = product.price;
    document.getElementById('adminProductDescription').value = product.description;
    document.getElementById('adminProductImage').value = product.image || '';
    document.getElementById('adminProductSellerId').value = product.seller_id;
}

async function deleteProductAdmin(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        try {
            await deleteProductApi(productId);
            showAlert('Producto eliminado');
            renderProductsAdmin();
        } catch (error) {
            showAlert('Error al eliminar producto', 'error');
        }
    }
}

// ==================== CRUD TARJETAS ====================
async function renderCardsAdmin() {
    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = '';
    
    const cardsData = await getCards();
    
    if (cardsData.length === 0) {
        cardsList.innerHTML = '<p style="text-align: center; color: #999;">No hay tarjetas guardadas</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    table.innerHTML = `
        <thead>
            <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">ID</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Últimos 4 dígitos</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Titular</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Expiración</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${cardsData.map(card => `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${card.id}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">**** **** **** ${card.last4}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${card.name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${card.expiry}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button class="btn-danger" onclick="deleteCardAdmin(${card.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    cardsList.appendChild(table);
}

async function deleteCardAdmin(cardId) {
    if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
        try {
            await deleteCardApi(cardId);
            showAlert('Tarjeta eliminada');
            renderCardsAdmin();
        } catch (error) {
            showAlert('Error al eliminar tarjeta', 'error');
        }
    }
}

// ==================== CRUD RESEÑAS ====================
async function renderReviewsAdmin() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';
    
    const reviewsData = await getReviews();
    
    if (reviewsData.length === 0) {
        reviewsList.innerHTML = '<p style="text-align: center; color: #999;">No hay reseñas registradas</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    table.innerHTML = `
        <thead>
            <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">ID</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Producto ID</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Autor</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Rating</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Reseña</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${reviewsData.map(review => `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${review.id}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${review.product_id}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${review.author}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${'⭐'.repeat(review.rating)}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${review.text}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        <button class="btn-danger" onclick="deleteReviewAdmin(${review.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    reviewsList.appendChild(table);
}

async function deleteReviewAdmin(reviewId) {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
        try {
            await deleteReviewApi(reviewId);
            showAlert('Reseña eliminada');
            renderReviewsAdmin();
        } catch (error) {
            showAlert('Error al eliminar reseña', 'error');
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si el usuario está logueado y tiene rol admin
    if (!currentUser) {
        alert('Debes iniciar sesión como administrador para acceder al panel');
        window.location.href = '/';
        return;
    }
    
    // Cargar datos del usuario para verificar el rol
    try {
        const user = await getUserById(currentUser.id);
        if (!user || user.role !== 'admin') {
            alert('No tienes permisos de administrador');
            window.location.href = '/';
            return;
        }
    } catch (error) {
        console.error('Error al verificar rol de usuario:', error);
        alert('Error al verificar permisos');
        window.location.href = '/';
        return;
    }
    
    await showSection('users');
});
