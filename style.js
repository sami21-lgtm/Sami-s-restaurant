function filterMenu(category) {
const allCards = document.querySelectorAll('.product-item-card');
const allBtns = document.querySelectorAll('.filter-tab-btn');
allBtns.forEach(btn => btn.classList.remove('active'));
event.target.classList.add('active');
allCards.forEach(card => {
if (category === 'all' || card.classList.contains(category)) {
card.style.display = '';
} else {
card.style.display = 'none';
}
});
}

function updateQty(btn, delta) {
const container = btn.closest('.qty-selector');
const input = container.querySelector('.qty-input');
let val = parseInt(input.value) || 1;
val += delta;
if (val < 1) val = 1;
if (val > 99) val = 99;
input.value = val;
}

function updateDynamicPricing(selectEl) {
const card = selectEl.closest('.product-item-card') || selectEl.closest('.product-card-body').parentElement;
const priceEl = card.querySelector('.dynamic-render-price');
const newPrice = selectEl.value;
priceEl.textContent = ' ৳ ' + newPrice;
priceEl.setAttribute('data-base-price', newPrice);
}

function closeBooking() {
    document.getElementById('bookingModal').style.display = 'none';
}

function showToast(message) {
const toast = document.getElementById('toast-notification');
if (toast) {
toast.textContent = message;
toast.classList.add('show-alert');
setTimeout(function() {
toast.classList.remove('show-alert');
}, 3000);
}
}


// ==================== NEW FOODPANDA STYLE CART LOGIC ====================
let foodpandaCart = [];
let isPhoneVerified = false;
let isPromoApplied = false;

// Toggle Cart Sidebar
function toggleCartSidebar() {
    const sidebar = document.getElementById('foodpanda-cart-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Add Item to Foodpanda Style Cart
function addToCart(btnEl, itemName) {
    const card = btnEl.closest('.product-item-card');
    const priceEl = card.querySelector('.dynamic-render-price');
    const qtyInput = card.querySelector('.qty-input');
    const variantSelect = card.querySelector('.variant-select');
    
    const price = parseInt(priceEl.getAttribute('data-base-price'));
    const qty = parseInt(qtyInput.value) || 1;
    const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text : 'Regular';

    const existingIndex = foodpandaCart.findIndex(item => item.name === itemName && item.variant === variant);
    
    if (existingIndex > -1) {
        foodpandaCart[existingIndex].qty += qty;
    } else {
        foodpandaCart.push({
            name: itemName,
            variant: variant,
            price: price,
            qty: qty
        });
    }

    qtyInput.value = 1; // reset qty input
    
    // Update Sidebar HTML Live
    renderFoodpandaCart();

    // Auto open sidebar gracefully just like Foodpanda
    const sidebar = document.getElementById('foodpanda-cart-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (!sidebar.classList.contains('active')) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }

    showToast(`${itemName} basket e added!`);
}

// Apply Promo Code Logic
function applyPromoCode() {
    const code = document.getElementById('fpPromoCode').value.trim().toLowerCase();
    const successMsg = document.getElementById('promoSuccessMsg');
    const errorMsg = document.getElementById('promoErrorMsg');

    if (code === 'sami 100') {
        isPromoApplied = true;
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
        renderFoodpandaCart();
    } else {
        isPromoApplied = false;
        successMsg.style.display = 'none';
        errorMsg.style.display = 'block';
        renderFoodpandaCart();
    }
}

// Render dynamic elements inside cart
function renderFoodpandaCart() {
    const container = document.getElementById('cart-items-list');
    const badgeCount = document.getElementById('basket-badge-count');
    const subtotalEl = document.getElementById('fp-subtotal');
    const deliveryEl = document.getElementById('fp-delivery');
    const totalEl = document.getElementById('fp-total');
    const btnTotalEl = document.getElementById('fp-btn-total');
    
    container.innerHTML = '';
    
    if (foodpandaCart.length === 0) {
        container.innerHTML = `<div class="empty-cart-msg">Apnar basket ekhon khali ache! Item add korun.</div>`;
        badgeCount.textContent = '0';
        subtotalEl.textContent = '৳ 0';
        deliveryEl.textContent = '৳ 40';
        totalEl.textContent = '৳ 0';
        btnTotalEl.textContent = '৳ 0';
        validateCheckoutForm();
        return;
    }

    let subtotal = 0;
    let totalItems = 0;

    foodpandaCart.forEach((item, index) => {
        const itemCost = item.price * item.qty;
        subtotal += itemCost;
        totalItems += item.qty;

        const itemHtml = `
            <div class="fp-cart-item">
                <div class="item-info-meta">
                    <div class="item-title">${item.name}</div>
                    <div class="item-variant">${item.variant}</div>
                </div>
                <div class="item-qty-price-block">
                    <span class="item-qty-tag">${item.qty}x</span>
                    <span class="item-price-tag">৳ ${itemCost}</span>
                    <button class="fp-item-delete-btn" onclick="removeBasketItem(${index})" title="Remove item">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Dynamic delivery fee calculation based on Promo Code
    const deliveryFee = isPromoApplied ? 30 : 40;
    const grandTotal = subtotal + deliveryFee;

    badgeCount.textContent = totalItems;
    subtotalEl.textContent = `৳ ${subtotal}`;
    deliveryEl.textContent = `৳ ${deliveryFee}`;
    totalEl.textContent = `৳ ${grandTotal}`;
    btnTotalEl.textContent = `৳ ${grandTotal}`;

    validateCheckoutForm();
}

// Delete Item Function
function removeBasketItem(index) {
    foodpandaCart.splice(index, 1);
    renderFoodpandaCart();
    showToast('Item deleted from basket');
}

// Change Payment State
function handlePaymentChange(radioInput) {
    document.querySelectorAll('.fp-pay-option').forEach(el => el.classList.remove('active'));
    radioInput.closest('.fp-pay-option').classList.add('active');
}

// Security OTP System Engine
function triggerSendOTP() {
    const phoneInput = document.getElementById('fpCustPhone').value.trim();
    if (!phoneInput) {
        alert('Daya kore prothome apnar mobile number ti input korun.');
        document.getElementById('fpCustPhone').focus();
        return;
    }

    const sendBtn = document.getElementById('fpSendOtpBtn');
    const timerEl = document.getElementById('fpOtpTimer');
    const inputWrapper = document.getElementById('fpOtpInputWrapper');

    sendBtn.disabled = true;
    inputWrapper.style.display = 'flex';
    timerEl.style.display = 'inline';

    let countdown = 60;
    timerEl.innerHTML = `Resend in <strong>${countdown}s</strong>`;

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            sendBtn.disabled = false;
            sendBtn.innerHTML = `<i class="fa-solid fa-arrow-rotate-right"></i> Resend OTP`;
            timerEl.style.display = 'none';
        } else {
            timerEl.innerHTML = `Resend in <strong>${countdown}s</strong>`;
        }
    }, 1000);

    showToast('OTP verification active! Enter any 4-digit numeric code.');
}

function verifyOTPCode() {
    const otpCode = document.getElementById('fpOtpCode').value.trim();
    if (otpCode.length < 4) {
        alert('Daya kore sothik 4-digit code processing korun.');
        return;
    }

    isPhoneVerified = true;
    document.getElementById('fpOtpInputWrapper').style.display = 'none';
    document.getElementById('fpSendOtpBtn').style.display = 'none';
    document.getElementById('fpOtpTimer').style.display = 'none';
    document.getElementById('otpSuccessStatus').style.display = 'block';

    validateCheckoutForm();
}

// Unlock Confirm Order Process
function validateCheckoutForm() {
    const name = document.getElementById('fpCustName').value.trim();
    const phone = document.getElementById('fpCustPhone').value.trim();
    const address = document.getElementById('fpCustAddress').value.trim();
    const submitBtn = document.getElementById('fpPlaceOrderBtn');

    if (foodpandaCart.length > 0 && name && phone && address && isPhoneVerified) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// Submit Order Data Configuration Pipeline
function submitFoodpandaOrder() {
    if (!isPhoneVerified) {
        alert('Daya kore prothome profile mobile OTP authentication complete korun.');
        return;
    }

    const name = document.getElementById('fpCustName').value.trim();
    const phone = document.getElementById('fpCustPhone').value.trim();
    const address = document.getElementById('fpCustAddress').value.trim();
    const payment = document.querySelector('input[name="fpPayment"]:checked').value;

    alert(`Order Placed Successfully!\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nPayment: ${payment.toUpperCase()}\n\nThank you for choosing Sami's Restaurant!`);
    
    // Clear and reset cart state
    foodpandaCart = [];
    isPhoneVerified = false;
    isPromoApplied = false;
    
    // Form Inputs Clear
    document.getElementById('fpCustName').value = '';
    document.getElementById('fpCustPhone').value = '';
    document.getElementById('fpCustAddress').value = '';
    
    // Reset Promo view
    document.getElementById('fpPromoCode').value = '';
    document.getElementById('promoSuccessMsg').style.display = 'none';
    document.getElementById('promoErrorMsg').style.display = 'none';
    
    // Reset OTP view
    document.getElementById('otpSuccessStatus').style.display = 'none';
    document.getElementById('fpOtpCode').value = '';
    document.getElementById('fpSendOtpBtn').style.display = 'inline-block';
    document.getElementById('fpSendOtpBtn').disabled = false;
    document.getElementById('fpSendOtpBtn').innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send OTP to Verify`;
    
    renderFoodpandaCart();
    toggleCartSidebar();
}

// Attach Live validation Listeners
document.addEventListener('DOMContentLoaded', () => {
    const targetInputIds = ['fpCustName', 'fpCustPhone', 'fpCustAddress'];
    targetInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', validateCheckoutForm);
        }
    });
});
