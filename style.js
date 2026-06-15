let cart = [];

// Image Upload Preview (Owner Profile) - From old doc
function previewOwnerImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('owner-profile-img').src = e.target.result;
            showToast("Profile image updated successfully!");
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Menu Filtering Logic - From old doc
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

// Dynamic Pricing Update - From old doc
function updateDynamicPricing(selectElement) {
    const selectedPrice = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    const priceDisplay = cardBody.querySelector('.dynamic-render-price');
    
    priceDisplay.innerText = '৳ ' + selectedPrice;
    priceDisplay.setAttribute('data-base-price', selectedPrice);
    
    // Check if we need to update inline counters if the variant changes
    renderAllInlineCounters();
}

// Old Qty handler (Kept for compatibility)
function updateQty(btn, change) {
    const input = btn.parentElement.querySelector('.qty-input');
    if(input){
        let val = parseInt(input.value) + change;
        if (val < 1) val = 1;
        input.value = val;
    }
}

// ================= NEW FOODPANDA LOGIC ================= //

// Add Item To Cart (Triggers the green inline counter)
function addToCart(btn, itemName) {
    const cardBody = btn.closest('.product-card-body');
    const priceText = cardBody.querySelector('.dynamic-render-price').getAttribute('data-base-price');
    const itemPrice = parseFloat(priceText);
    
    // Check for qty input (if your old html still has it, fallback to 1)
    const qtyInput = cardBody.querySelector('.qty-input');
    const itemQty = qtyInput ? parseInt(qtyInput.value) : 1;

    const existingItem = cart.find(item => item.name === itemName && item.price === itemPrice);
    
    if (existingItem) {
        existingItem.qty += itemQty;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            qty: itemQty
        });
    }

    if(qtyInput) qtyInput.value = 1;

    showToast(`${itemName} added to your basket!`);
    
    renderAllInlineCounters();
    updateCartUI();
}

// Converts original Add button to Green Inline Counter dynamically
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
            // Save the original HTML structure (The Add button + Qty Box)
            if (!actionGroup.hasAttribute('data-original-html')) {
                actionGroup.setAttribute('data-original-html', actionGroup.innerHTML);
            }

            if (existing && existing.qty > 0) {
                // Change to Green Inline + / - Style
                actionGroup.innerHTML = `
                    <div class="fp-card-inline-selector">
                        <button class="fp-inline-action-btn" onclick="updateCartItemQty('${itemName}', ${itemPrice}, -1)">-</button>
                        <span class="fp-inline-qty-text">${existing.qty}</span>
                        <button class="fp-inline-action-btn" onclick="updateCartItemQty('${itemName}', ${itemPrice}, 1)">+</button>
                    </div>
                `;
            } else {
                // Restore original if quantity is 0
                actionGroup.innerHTML = actionGroup.getAttribute('data-original-html');
            }
        }
    });
}

// Handles +/- clicks directly from the food card or checkout
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
    
    // Refresh checkout screen if it's open
    const checkoutPanel = document.getElementById('direct-checkout-overlay');
    if (checkoutPanel && checkoutPanel.classList.contains('active')) {
        renderBasketItems();
    }
}

// Update Global Floating Cart
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
    if (priceEl) priceEl.innerText = '৳ ' + totalPrice;

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

// Clicking the Floating bar opens the checkout overlay
function openFpSidebar() {
    if (cart.length === 0) {
        showToast("Your basket is empty!");
        return;
    }
    
    const checkoutPanel = document.getElementById('direct-checkout-overlay');
    if (checkoutPanel) {
        renderBasketItems();
        checkoutPanel.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}

// Render items inside the checkout modal (with delete & inline counters)
function renderBasketItems() {
    const listContainer = document.getElementById('checkout-dynamic-items-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p class="empty-basket-text">Your basket is empty.</p>';
        document.getElementById('basket-grand-total-val').innerText = '৳ 0';
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

    document.getElementById('basket-grand-total-val').innerText = '৳ ' + grandTotal;
}

function removeBasketItem(index) {
    cart.splice(index, 1);
    renderAllInlineCounters();
    updateCartUI();
    renderBasketItems();
}

function closeFullCheckout() {
    const panel = document.getElementById('direct-checkout-overlay');
    if (panel) panel.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function submitDirectOrder() {
    if (cart.length === 0) return;
    
    const name = document.getElementById('custName') ? document.getElementById('custName').value.trim() : '';
    const address = document.getElementById('custAddress') ? document.getElementById('custAddress').value.trim() : '';
    const phone = document.getElementById('custPhone') ? document.getElementById('custPhone').value.trim() : '';

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
    document.getElementById('order-success-panel').style.display = 'none';
    if(document.getElementById('direct-otp-input')) document.getElementById('direct-otp-input').value = '';
    
    // Clear Checkout forms
    if(document.getElementById('custName')) document.getElementById('custName').value = '';
    if(document.getElementById('custAddress')) document.getElementById('custAddress').value = '';
    if(document.getElementById('custPhone')) document.getElementById('custPhone').value = '';
}

// Old Handlers from docx
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
