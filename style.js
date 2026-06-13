function previewOwnerImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('owner-profile-img').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// ==================== Menu Filtering Logic ====================
function filterMenu(category, btn) {
    // Update active button styling
    document.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter Items
    const items = document.querySelectorAll('.product-item-card');
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category').includes(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ==================== Local Menu Quantity (Product Card e) ====================
function updateLocalQty(btn, delta) {
    const input = btn.parentElement.querySelector('.qty-input');
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
}

// ==================== Dynamic Pricing Update ====================
function updateDynamicPricing(selectEl) {
    const card = selectEl.closest('.product-item-card') || selectEl.closest('.product-card-body').parentElement;
    const priceEl = card.querySelector('.dynamic-render-price');
    const newPrice = selectEl.value;
    priceEl.textContent = '৳' + newPrice;
    priceEl.setAttribute('data-base-price', newPrice);
}

// =========================================================================
// ==================== FOODPANDA STYLE CART/SIDEBAR ENGINE ================
// =========================================================================

let cart = [];
let fpOtpVerified = false;
let generatedOtp = '1234'; // Demo OTP System

// ==================== ADD TO CART (Direct trigger to floating bar) ====================
function addToCart(btnEl, itemName) {
    const card = btnEl.closest('.product-item-card');
    const priceEl = card.querySelector('.dynamic-render-price');
    const qtyInput = card.querySelector('.qty-input');
    const variantSelect = card.querySelector('.variant-select');
    
    const price = parseInt(priceEl.getAttribute('data-base-price'));
    const qty = parseInt(qtyInput.value) || 1;
    const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text : 'Regular';
    
    // Check if item exists in cart
    const existingIndex = cart.findIndex(item => item.name === itemName && item.variant === variant);
    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            id: Date.now(),
            name: itemName,
            variant: variant,
            price: price,
            qty: qty
        });
    }
    
    qtyInput.value = 1; // Reset product card input back to 1
    
    // Show modern toast
    showToast(`🛒 ${qty}x ${itemName} added to basket!`);
    
    // Update UI
    renderCartData();
}

// ==================== Render Core UI based on Cart Data ====================
function renderCartData() {
    let totalItems = 0;
    let totalPrice = 0;
    let itemsHtml = '';

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += (item.price * item.qty);
        
        // Build items for the Sidebar
        itemsHtml += `
        <div class="fp-cart-item">
            <div class="fp-item-info">
                <h4>${item.name}</h4>
                <p>${item.variant}</p>
                <span class="fp-item-price">৳${item.price * item.qty}</span>
            </div>
            <div class="fp-item-actions">
                <div class="fp-qty-controls">
                    <button onclick="adjustCartQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="adjustCartQty(${item.id}, 1)">+</button>
                </div>
                <button class="fp-delete-btn" onclick="deleteCartItem(${item.id})" title="Delete Item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>`;
    });

    // Update Floating Basket Button
    const floatingBar = document.getElementById('floating-cart');
    document.getElementById('cart-item-count').textContent = totalItems;
    document.getElementById('cart-total-price').textContent = '৳' + totalPrice;
    
    if (totalItems > 0) {
        floatingBar.classList.remove('hidden');
    } else {
        floatingBar.classList.add('hidden');
        closeFpSidebar(); // Hide sidebar if empty
    }

    // Inject into Sidebar
    const container = document.getElementById('fp-cart-items-container');
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Your basket is empty. Add some delicious food!</p>';
    } else {
        container.innerHTML = itemsHtml;
    }
    
    // Update Checkout sticky button total
    document.getElementById('fp-sticky-total').textContent = '৳' + totalPrice;
}

// ==================== Manage Cart Qty & Deletion ====================
function adjustCartQty(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    item.qty += delta;
    if (item.qty < 1) {
        cart = cart.filter(i => i.id !== itemId);
        showToast(`🗑️ ${item.name} removed from basket`);
    }
    renderCartData();
}

function deleteCartItem(itemId) {
    const item = cart.find(i => i.id === itemId);
    if(item) {
        showToast(`🗑️ ${item.name} removed from basket`);
    }
    cart = cart.filter(i => i.id !== itemId);
    renderCartData();
}

// ==================== Sidebar Core Engine ====================
function openFpSidebar() {
    if (cart.length === 0) return;
    document.getElementById('fp-sidebar-overlay').classList.add('active');
    document.getElementById('fp-sidebar').classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeFpSidebar() {
    document.getElementById('fp-sidebar-overlay').classList.remove('active');
    document.getElementById('fp-sidebar').classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== Payment & OTP Engine ====================
function selectFpPayment(method, element) {
    // UI Style changes
    document.querySelectorAll('.fp-pay-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
    
    // Show/Hide Digital Wallet OTP section
    const otpSection = document.getElementById('fp-otp-section');
    if(method === 'digital') {
        otpSection.style.display = 'block';
    } else {
        otpSection.style.display = 'none';
        fpOtpVerified = true; // COD is default verified
    }
}

function triggerFpOtp() {
    const num = document.getElementById('fp-walletNumber').value;
    if(num.length < 10) {
        showToast('⚠️ Enter a valid mobile wallet number');
        return;
    }
    const btn = document.getElementById('fp-sendBtn');
    btn.innerHTML = 'Sent!';
    btn.classList.add('success');
    
    document.getElementById('fp-otp-boxes-area').style.display = 'block';
    document.getElementById('fp-otp-status').innerHTML = 'OTP sent! Hint: Type <strong>1234</strong> to test verification.';
    document.getElementById('fp-otp-status').style.color = '#333';
    
    // Focus first box
    document.querySelector('.fp-otp-box').focus();
    fpOtpVerified = false;
}

function handleFpOtpBox(input, index) {
    // Restrict non-numeric
    input.value = input.value.replace(/[^0-9]/g, '');
    
    if(input.value !== '') {
        // move to next
        const nextBox = input.nextElementSibling;
        if(nextBox) nextBox.focus();
    }
    
    // Check if fully typed
    const boxes = document.querySelectorAll('.fp-otp-box');
    let code = '';
    boxes.forEach(b => code += b.value);
    
    if(code.length === 4) {
        if(code === generatedOtp) {
            fpOtpVerified = true;
            document.getElementById('fp-otp-status').innerHTML = '✅ Verified Successfully!';
            document.getElementById('fp-otp-status').style.color = '#27ae60';
            boxes.forEach(b => { b.style.borderColor = '#27ae60'; b.disabled = true; });
        } else {
            fpOtpVerified = false;
            document.getElementById('fp-otp-status').innerHTML = '❌ Incorrect OTP. Try again (1234)';
            document.getElementById('fp-otp-status').style.color = '#e74c3c';
            boxes.forEach(b => { b.value = ''; b.style.borderColor = '#e74c3c'; });
            boxes[0].focus();
        }
    }
}

// ==================== Submit Order Final ====================
function submitFpOrder() {
    const name = document.getElementById('fp-custName').value.trim();
    const phone = document.getElementById('fp-custPhone').value.trim();
    const address = document.getElementById('fp-custAddress').value.trim();
    const paymentMethod = document.querySelector('input[name="fp_payment"]:checked').value;

    if (!name || !phone || !address) {
        showToast('⚠️ Please fill out all delivery details');
        return;
    }

    if (paymentMethod === 'digital' && !fpOtpVerified) {
        showToast('⚠️ Please verify your bKash/Nagad number with OTP');
        return;
    }

    // Success Action
    closeFpSidebar();
    document.getElementById('orderSuccessOverlay').classList.add('active');
    
    // Reset Everything
    cart = [];
    renderCartData();
    document.getElementById('fp-custName').value = '';
    document.getElementById('fp-custPhone').value = '';
    document.getElementById('fp-custAddress').value = '';
    selectFpPayment('cod', document.querySelector('.fp-pay-card')); // Reset to COD
    
    // Clean OTP Box
    document.getElementById('fp-walletNumber').value = '';
    document.getElementById('fp-otp-boxes-area').style.display = 'none';
    const boxes = document.querySelectorAll('.fp-otp-box');
    boxes.forEach(b => { b.value = ''; b.disabled = false; b.style.borderColor = '#e0e0e0'; });
    const sendBtn = document.getElementById('fp-sendBtn');
    sendBtn.innerHTML = 'Send OTP'; sendBtn.classList.remove('success');
}

function closeOrderSuccess() {
    document.getElementById('orderSuccessOverlay').classList.remove('active');
}

// ==================== Simple Toast Manager ====================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.add('show-alert');
    setTimeout(() => {
        toast.classList.remove('show-alert');
    }, 2800);
}
