let cart = [];

// Menu Filtering Logic
function filterMenu(category) {
    const buttons = document.querySelectorAll('.filter-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (typeof event !== 'undefined' && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    const items = document.querySelectorAll('.product-item-card');
    items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Dynamic Pricing Update
function updateDynamicPricing(selectElement) {
    const selectedPrice = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    if (cardBody) {
        const priceDisplay = cardBody.querySelector('.dynamic-render-price');
        priceDisplay.innerText = '৳ ' + selectedPrice;
        priceDisplay.setAttribute('data-base-price', selectedPrice);
    }
    // Update inline buttons if variant changes
    renderAllInlineCounters();
}

// Old qty button handler (for the initial Add button)
function updateQty(btn, change) {
    const input = btn.parentElement.querySelector('.qty-input');
    if (input) {
        let val = parseInt(input.value) + change;
        if (val < 1) val = 1;
        input.value = val;
    }
}

// Add Item To Cart
function addToCart(btn, itemName) {
    const cardBody = btn.closest('.product-card-body');
    const priceText = cardBody.querySelector('.dynamic-render-price').getAttribute('data-base-price');
    const itemPrice = parseFloat(priceText);
    
    const input = cardBody.querySelector('.qty-input');
    const addedQty = input ? parseInt(input.value) : 1;
    
    const existingItem = cart.find(item => item.name === itemName && item.price === itemPrice);
    
    if (existingItem) {
        existingItem.qty += addedQty;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            qty: addedQty
        });
    }

    if (input) input.value = 1; // Reset input field

    showToast(`${itemName} added to your basket!`);
    
    renderAllInlineCounters();
    updateCartUI();
}

// Magic Function: Converts Add button to Foodpanda Inline Counter
function renderAllInlineCounters() {
    const allCards = document.querySelectorAll('.product-card-body');
    
    allCards.forEach(cardBody => {
        const itemNameObj = cardBody.querySelector('h3');
        const priceObj = cardBody.querySelector('.dynamic-render-price');
        if (!itemNameObj || !priceObj) return;

        const itemName = itemNameObj.innerText.trim();
        const itemPrice = parseFloat(priceObj.getAttribute('data-base-price'));
        
        const existing = cart.find(i => i.name === itemName && i.price === itemPrice);
        const actionGroup = cardBody.querySelector('.cart-action-group');
        
        if (actionGroup) {
            // Save the original HTML structure (Input + Add button)
            if (!actionGroup.hasAttribute('data-original-html')) {
                actionGroup.setAttribute('data-original-html', actionGroup.innerHTML);
            }

            if (existing && existing.qty > 0) {
                // Change to Foodpanda Inline + / - Style
                actionGroup.innerHTML = `
                    <div class="fp-card-inline-selector">
                        <button class="fp-inline-action-btn" onclick="updateCartItemQty('${itemName}', ${itemPrice}, -1)">-</button>
                        <span class="fp-inline-qty-text">${existing.qty}</span>
                        <button class="fp-inline-action-btn" onclick="updateCartItemQty('${itemName}', ${itemPrice}, 1)">+</button>
                    </div>
                `;
            } else {
                // Restore original if quantity becomes 0
                actionGroup.innerHTML = actionGroup.getAttribute('data-original-html');
            }
        }
    });
}

// Handles +/- clicks directly from the food card
function updateCartItemQty(name, price, change) {
    const index = cart.findIndex(i => i.name === name && i.price === price);
    if (index > -1) {
        cart[index].qty += change;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    
    renderAllInlineCounters();
    updateCartUI();
    
    // Refresh checkout screen if it's currently open
    const checkoutPanel = document.getElementById('direct-checkout-overlay');
    if (checkoutPanel && checkoutPanel.style.display === 'block') {
        renderBasketItems();
    }
}

// Update Global UI Elements (Floating Cart)
function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += (item.price * item.qty);
    });

    const countEl = document.getElementById('cart-item-count');
    const priceEl = document.getElementById('cart-total-price');
    if (countEl) countEl.innerText = totalItems;
    if (priceEl) priceEl.innerText = '৳' + totalPrice;

    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        if (totalItems > 0) {
            floatingCart.classList.remove('hidden');
        } else {
            floatingCart.classList.add('hidden');
            closeFullCheckout();
        }
    }
}

// Floating bar click opens checkout layout
function openFpSidebar() {
    if (cart.length === 0) {
        showToast("Your basket is empty!");
        return;
    }
    openFoodpandaCheckout();
}

// Checkout Engine
function openFoodpandaCheckout() {
    let checkoutPanel = document.getElementById('direct-checkout-overlay');
    
    if (!checkoutPanel) {
        checkoutPanel = document.createElement('div');
        checkoutPanel.id = 'direct-checkout-overlay';
        document.body.appendChild(checkoutPanel);
    }

    checkoutPanel.innerHTML = `
        <div class="checkout-fullscreen-wrapper active">
            <div class="checkout-header-bar">
                <span class="close-checkout-x" onclick="closeFullCheckout()">×</span>
                <h2 class="checkout-title-text">Checkout</h2>
            </div>
            
            <div class="checkout-body-form">
                <div class="foodpanda-cart-container">
                    <h3 class="basket-heading"><i class="fa-solid fa-basket-shopping"></i> Your Basket</h3>
                    <div id="checkout-dynamic-items-list"></div>
                    <div class="basket-grand-total-row">
                        <span>Grand Total:</span>
                        <span id="basket-grand-total-val">৳0</span>
                    </div>
                </div>
                
                <div class="input-flat-group" style="margin-top: 25px;">
                    <label>Full Name</label>
                    <input type="text" id="custName" placeholder="Enter your name" required>
                </div>
                <div class="input-flat-group">
                    <label>Delivery Address</label>
                    <input type="text" id="custAddress" placeholder="House, Road, Area" required>
                </div>
                <div class="input-flat-group">
                    <label>Phone Number</label>
                    <input type="tel" id="custPhone" placeholder="017xxxxxxxx" required>
                </div>
                
                <div class="payment-method-flat-group">
                    <label class="payment-section-title">Payment Method</label>
                    <div class="radio-flat-option">
                        <input type="radio" id="cod" name="payment" value="Cash on Delivery" checked>
                        <label for="cod">Cash on Delivery</label>
                    </div>
                    <div class="radio-flat-option">
                        <input type="radio" id="nagad" name="payment" value="Nagad">
                        <label for="nagad">Nagad</label>
                    </div>
                </div>
            </div>
            <button class="btn-green-place-order" onclick="submitDirectOrder()">Place Order</button>
        </div>

        <div id="otp-verification-panel" class="otp-modal-overlay" style="display: none;">
            <div class="otp-modal-content">
                <h2>OTP Verification</h2>
                <p>Enter the 4-digit verification code:</p>
                <input type="text" id="direct-otp-input" placeholder="0 0 0 0" maxlength="4">
                <button class="btn-verify-otp" onclick="confirmDirectOtp()">Verify & Complete</button>
            </div>
        </div>

        <div id="order-success-panel" class="success-modal-overlay" style="display: none;">
            <div class="success-modal-content">
                <h2 style="color: #1ebd60; margin-bottom: 10px;">Order Placed Successfully!</h2>
                <p>Your food will arrive soon.</p>
                <button class="btn-success-close" onclick="resetToMenu()">Back to Menu</button>
            </div>
        </div>
    `;

    renderBasketItems();
    checkoutPanel.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

function renderBasketItems() {
    const listContainer = document.getElementById('checkout-dynamic-items-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p class="empty-basket-text">Your basket is empty.</p>';
        document.getElementById('basket-grand-total-val').innerText = '৳0';
        closeFullCheckout();
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;

        listContainer.innerHTML += `
            <div class="fp-cart-item-row">
                <div class="fp-item-info">
                    <span class="fp-item-name">${item.name}</span>
                    <span class="fp-item-unit-price">৳${item.price} each</span>
                </div>
                
                <div class="fp-qty-actions-box">
                    <button class="fp-qty-inline-btn" onclick="updateCartItemQty('${item.name}', ${item.price}, -1)">-</button>
                    <span class="fp-qty-inline-value">${item.qty}</span>
                    <button class="fp-qty-inline-btn" onclick="updateCartItemQty('${item.name}', ${item.price}, 1)">+</button>
                </div>

                <span class="fp-item-total-price">৳${itemTotal}</span>
                
                <button class="fp-item-delete-btn" onclick="removeBasketItem(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    document.getElementById('basket-grand-total-val').innerText = '৳' + grandTotal;
}

function removeBasketItem(index) {
    cart.splice(index, 1);
    renderAllInlineCounters();
    updateCartUI();
    renderBasketItems();
}

function closeFullCheckout() {
    const panel = document.getElementById('direct-checkout-overlay');
    if (panel) panel.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function submitDirectOrder() {
    if (cart.length === 0) return;
    
    const name = document.getElementById('custName').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const phone = document.getElementById('custPhone').value.trim();

    if (!name || !address || !phone) {
        showToast("Please fill up all delivery information!");
        return;
    }
    document.getElementById('otp-verification-panel').style.display = 'flex';
}

function confirmDirectOtp() {
    const otpInput = document.getElementById('direct-otp-input').value.trim();
    if (otpInput.length !== 4) {
        showToast("Enter a 4-digit OTP!");
        return;
    }
    document.getElementById('otp-verification-panel').style.display = 'none';
    document.getElementById('order-success-panel').style.display = 'flex';
}

function resetToMenu() {
    cart = [];
    renderAllInlineCounters();
    updateCartUI();
    closeFullCheckout();
}

// Generic Handlers
function handleReservation(event) {
    event.preventDefault();
    showToast("Table Reservation Confirmed! See you soon.");
    event.target.reset();
}

function showToast(message) {
    let toast = document.getElementById("toast-notification");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notification";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.className = "show-alert";
    setTimeout(() => { toast.className = toast.className.replace("show-alert", ""); }, 3000);
}
