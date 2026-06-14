let cart = [];

function filterMenu(category) {
    document.querySelectorAll('.food-item-card').forEach(item => {
        if(category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    if(existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({name, price, qty: 1});
    }
    syncCardButtons(); // UI update
    updateCartDisplay();
}

// PDF theke paoa Core Logic
function syncCardButtons() {
    document.querySelectorAll('.fp-card-action-wrapper').forEach(wrapper => {
        const itemName = wrapper.getAttribute('data-name');
        const addBtn = wrapper.querySelector('.fp-card-add-btn');
        const qtyControl = wrapper.querySelector('.fp-card-qty-control');
        const qtyDisplay = wrapper.querySelector('.fp-card-qty-display');
        
        const cartItem = cart.find(item => item.name === itemName);
        if (cartItem) {
            addBtn.style.display = 'none';
            qtyControl.style.display = 'flex';
            qtyDisplay.textContent = cartItem.qty;
        } else {
            addBtn.style.display = 'block';
            qtyControl.style.display = 'none';
        }
    });
}

function updateCardItemQty(name, factor) {
    let index = cart.findIndex(item => item.name === name);
    if(index !== -1) {
        cart[index].qty += factor;
        if(cart[index].qty <= 0) cart.splice(index, 1);
    }
    syncCardButtons();
    updateCartDisplay();
}

function updateCartDisplay() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.qty, 0);
}

function openCheckoutView() {
    if(cart.length === 0) alert("Basket empty!");
    else alert("Opening Checkout page...");
}
