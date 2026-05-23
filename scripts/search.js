// Manejar la tecla Enter para la búsqueda
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchProducts();
    }
}

// Mostrar resultados de búsqueda
function showSearchResults() {
    document.getElementById('cartSection').classList.add('hidden');
    document.getElementById('searchResultsSection').classList.remove('hidden');
}

// Sobrescribir showCart para search.html
function showCart() {
    document.getElementById('searchResultsSection').classList.add('hidden');
    document.getElementById('cartSection').classList.remove('hidden');
    renderCart();
}

// Sobrescribir searchProducts para search.html
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        window.location.href = '/';
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    const searchResultsList = document.getElementById('searchResultsList');
    searchResultsList.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        searchResultsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No se encontraron productos</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const card = createProductCard(product);
        searchResultsList.appendChild(card);
    });
}

// Obtener término de búsqueda del parámetro URL
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('q');

if (searchTerm) {
    document.getElementById('searchInput').value = searchTerm;
    // Ejecutar búsqueda después de cargar la página
    window.addEventListener('DOMContentLoaded', async () => {
        await loadInitialData();
        updateAuthUI();
        searchProducts();
    });
} else {
    window.addEventListener('DOMContentLoaded', async () => {
        await loadInitialData();
        updateAuthUI();
    });
}
