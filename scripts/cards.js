// Inicializar datos de tarjetas
let savedCards = [];

// Cargar tarjetas desde la API
async function loadSavedCards() {
    try {
        savedCards = await getCards();
    } catch (error) {
        console.error('Error loading cards from API:', error);
    }
}

// Formatear número de tarjeta
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
}

// Formatear fecha de expiración
function formatCardExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    input.value = value;
}

// Renderizar tarjetas guardadas
function renderSavedCards() {
    const savedCardsList = document.getElementById('savedCardsList');
    savedCardsList.innerHTML = '';

    if (savedCards.length === 0) {
        savedCardsList.innerHTML = '<p style="color: #999;">No tienes tarjetas guardadas</p>';
        return;
    }

    savedCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'saved-card';
        cardElement.innerHTML = `
            <div class="card-info">
                <strong>**** **** **** ${card.last4}</strong><br>
                <small>${card.name} - ${card.expiry}</small>
            </div>
            <div class="card-actions">
                <button class="btn-secondary" onclick="selectCard(${index})">Usar</button>
                <button class="btn-danger" onclick="deleteCard(${index})">Eliminar</button>
            </div>
        `;
        savedCardsList.appendChild(cardElement);
    });
}

// Guardar tarjeta
async function saveCard() {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;

    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        showAlert('Por favor completa todos los campos de la tarjeta', 'error');
        return;
    }

    try {
        const newCard = await createCard(cardNumber, cardNumber.slice(-4), cardName, cardExpiry, cardCvv, currentUser.id);
        savedCards.push(newCard);
        showAlert('¡Tarjeta guardada exitosamente!');
        
        // Limpiar formulario
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardName').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCvv').value = '';
        document.getElementById('saveCard').checked = false;

        renderSavedCards();
    } catch (error) {
        showAlert('Error al guardar tarjeta', 'error');
    }
}

// Seleccionar tarjeta guardada
function selectCard(index) {
    const card = savedCards[index];
    document.getElementById('cardNumber').value = card.number;
    document.getElementById('cardName').value = card.name;
    document.getElementById('cardExpiry').value = card.expiry;
    document.getElementById('cardCvv').value = card.cvv;
    showAlert('Tarjeta seleccionada');
}

// Eliminar tarjeta
async function deleteCard(index) {
    if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
        try {
            await deleteCardApi(savedCards[index].id);
            savedCards.splice(index, 1);
            showAlert('Tarjeta eliminada');
            renderSavedCards();
        } catch (error) {
            showAlert('Error al eliminar tarjeta', 'error');
        }
    }
}

// Validar tarjeta antes de confirmar compra
function validateCard() {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;

    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        showAlert('Por favor completa todos los campos de la tarjeta', 'error');
        return false;
    }

    // Validar longitud del número de tarjeta
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length !== 16) {
        showAlert('El número de tarjeta debe tener 16 dígitos', 'error');
        return false;
    }

    // Validar CVV
    if (cardCvv.length !== 3) {
        showAlert('El CVV debe tener 3 dígitos', 'error');
        return false;
    }

    return true;
}
