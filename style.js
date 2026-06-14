// Global cart array
let cart = [];

// Add Item Function (Foodpanda Style)
function addToCart(itemName, itemPrice) {
    let existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name: itemName, price: itemPrice, qty: 1 });
    }
    syncCardButtons();
    renderCartData();
}

// Update Qty (+/-)
function updateCardItemQty(name, factor) {
    let index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart[index].qty += factor;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    syncCardButtons();
    renderCartData();
}

// UI Sync for Add Buttons vs Qty Control
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

// Cart Data Renderer (Sidebar-e dekhanor jonno)
function renderCartData() {
    let cartList = document.getElementById('cart-items-display-list');
    let totalDisplay = document.getElementById('cart-total-price-tag');
    let total = 0;
    
    cartList.innerHTML = '';
    cart.forEach(item => {
        total += (item.price * item.qty);
        cartList.innerHTML += `
            <div class="cart-item">
                <span>${item.name} (x${item.qty})</span>
                <span>৳ ${item.price * item.qty}</span>
                <button onclick="updateCardItemQty('${item.name}', -1)">❌</button>
            </div>
        `;
    });
    totalDisplay.innerText = "৳ " + total;
}
