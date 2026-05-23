// Agregar producto al carrito
function addToCart(productId) {
    if (!currentUser) {
        showAlert('Debes iniciar sesión para comprar', 'error');
        if (window.location.pathname.includes('search.html')) {
            window.location.href = '/';
        } else {
            showLogin();
        }
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    showAlert('Producto agregado al carrito');
}

// Renderizar carrito
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #999;">El carrito está vacío</p>';
        document.getElementById('cartTotal').textContent = 'Total: $0.00';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <strong>${item.title}</strong><br>
                <small>$${item.price.toFixed(2)} x ${item.quantity}</small>
            </div>
            <div>
                <strong>$${itemTotal.toFixed(2)}</strong>
                <button class="btn-danger" onclick="removeFromCart(${index})" style="margin-left: 10px; padding: 5px 10px;">×</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    document.getElementById('cartTotal').textContent = `Total: $${total.toFixed(2)}`;
}

// Eliminar producto del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Mostrar vista de simulación de compra
function showCheckout() {
    if (cart.length === 0) {
        showAlert('El carrito está vacío', 'error');
        return;
    }

    window.location.href = 'checkout.html';
}

// Confirmar compra
function confirmPurchase() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    alert(`¡Compra simulada exitosa!\n\nTotal: $${total.toFixed(2)}\n\nGracias por tu compra, ${currentUser.username}!`);
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    
    window.location.href = '/';
}

// Finalizar compra (simulación) - función de compatibilidad
function checkout() {
    showCheckout();
}

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    updateAuthUI();
    renderCart();
});
