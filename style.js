let cart = [];

// Filter Menu
function filterMenu(category) {
    let btns = document.querySelectorAll('.filter-tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let items = document.querySelectorAll('.product-item-card');
    items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Update Price on Dropdown Change
function updateDynamicPricing(selectElement) {
    let price = selectElement.value;
    let card = selectElement.closest('.product-item-card');
    card.querySelector('.dynamic-render-price').innerText = '৳ ' + price;
    
    // Update wrapper data-price
    let wrapper = card.querySelector('.fp-card-action-wrapper');
    wrapper.setAttribute('data-price', price);

    // If item is in cart, update its price
    let name = wrapper.getAttribute('data-name');
    let itemInCart = cart.find(item => item.name === name);
    if (itemInCart) {
        itemInCart.price = parseInt(price);
        renderSidebarCart();
        updateFloatingCart();
    }
}

// Add to Cart
function addFoodToCart(btnElement, name, price) {
    let wrapper = btnElement.closest('.fp-card-action-wrapper');
    let currentPrice = parseInt(wrapper.getAttribute('data-price'));
    
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty++;
        existingItem.price = currentPrice; // update price if variant changed
    } else {
        cart.push({ name, price: currentPrice, qty: 1 });
    }

    wrapper.classList.add('item-added');
    wrapper.querySelector('.fp-card-qty-display').innerText = existingItem ? existingItem.qty : 1;
    
    renderSidebarCart();
    updateFloatingCart();
}

// Update Quantity from Menu Card
function updateCardItemQty(btnElement, name, delta) {
    let wrapper = btnElement.closest('.fp-card-action-wrapper');
    let item = cart.find(i => i.name === name);
    
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
            wrapper.classList.remove('item-added');
        } else {
            wrapper.querySelector('.fp-card-qty-display').innerText = item.qty;
        }
    }
    
    renderSidebarCart();
    updateFloatingCart();
}

// Update Quantity from Sidebar
function updateSidebarItemQty(name, delta) {
    let item = cart.find(i => i.name === name);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
            // Also update the menu card button
            let cardWrapper = document.querySelector(`.fp-card-action-wrapper[data-name="${name}"]`);
            if(cardWrapper) cardWrapper.classList.remove('item-added');
        }
    }
    renderSidebarCart();
    updateFloatingCart();
}

// Render Sidebar Cart
function renderSidebarCart() {
    let container = document.getElementById('fp-cart-items-container');
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Your cart is empty</p>';
        return;
    }

    cart.forEach(item => {
        container.innerHTML += `
            <div class="sidebar-item">
                <div class="sidebar-item-info">
                    <h4>${item.name}</h4>
                    <span>৳ ${item.price} x ${item.qty}</span>
                </div>
                <div class="sidebar-item-qty">
                    <button onclick="updateSidebarItemQty('${item.name}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateSidebarItemQty('${item.name}', 1)">+</button>
                </div>
            </div>
        `;
    });
}

// Update Floating Cart
function updateFloatingCart() {
    let totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    document.getElementById('cart-item-count').innerText = totalItems;
    document.getElementById('cart-total-price').innerText = 'Tk ' + totalPrice;
    
    let floatingCart = document.getElementById('floating-cart');
    if (cart.length > 0) {
        floatingCart.classList.remove('hidden');
    } else {
        floatingCart.classList.add('hidden');
    }
}

// Sidebar Open/Close
function openFpSidebar() {
    document.getElementById('fp-sidebar').classList.add('open');
    document.getElementById('fp-sidebar-overlay').classList.add('open');
}

function closeFpSidebar() {
    document.getElementById('fp-sidebar').classList.remove('open');
    document.getElementById('fp-sidebar-overlay').classList.remove('open');
}

// Checkout Page Open/Close
function openFullCheckout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    
    closeFpSidebar();
    renderCheckoutSummary();
    document.getElementById('full-checkout-page').classList.add('open');
    document.getElementById('order-success-msg').style.display = 'none';
    document.getElementById('checkout-form-section').style.display = 'block';
    document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeFullCheckout() {
    document.getElementById('full-checkout-page').classList.remove('open');
    document.body.style.overflow = 'auto';
}

// Render Checkout Summary
function renderCheckoutSummary() {
    let list = document.getElementById('checkout-items-list');
    list.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        list.innerHTML += `<div class="chk-item"><span>${item.qty}x ${item.name}</span> <span>৳ ${itemTotal}</span></div>`;
    });

    document.getElementById('chk-final-total').innerText = 'Tk ' + total;
}

// Submit Final Order
function submitFinalOrder() {
    let name = document.getElementById('chk-name').value;
    let phone = document.getElementById('chk-phone').value;
    let address = document.getElementById('chk-address').value;

    if (!name || !phone || !address) {
        alert("Please fill in Name, Phone, and Address.");
        return;
    }

    // Hide form, show success
    document.getElementById('checkout-form-section').style.display = 'none';
    document.getElementById('order-success-msg').style.display = 'block';
}

// Continue Dining (Reset)
function continueDining() {
    cart = [];
    updateFloatingCart();
    
    // Reset all menu cards
    document.querySelectorAll('.fp-card-action-wrapper').forEach(wrapper => {
        wrapper.classList.remove('item-added');
        wrapper.querySelector('.fp-card-qty-display').innerText = '1';
    });
    
    // Clear inputs
    document.getElementById('chk-name').value = '';
    document.getElementById('chk-phone').value = '';
    document.getElementById('chk-address').value = '';

    closeFullCheckout();
    window.location.href = '#menu';
}
