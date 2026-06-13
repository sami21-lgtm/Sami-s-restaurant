let cart = [];
let otpVerified = { bkash: false, nagad: false };
let otpTimers = { bkash: null, nagad: null };
let otpCountdown = { bkash: 0, nagad: 0 };
let generatedOtp = { bkash: '', nagad: '' };

// ==================== Menu Filter ====================
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

// ==================== Quantity Controls ====================
function updateQty(btn, delta) {
    const container = btn.closest('.qty-selector');
    const input = container.querySelector('.qty-input');
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
}

// ==================== Dynamic Pricing ====================
function updateDynamicPricing(selectEl) {
    const card = selectEl.closest('.product-item-card') || selectEl.closest('.product-card-body').parentElement;
    const priceEl = card.querySelector('.dynamic-render-price');
    const newPrice = selectEl.value;
    priceEl.textContent = '৳' + newPrice;
    priceEl.setAttribute('data-base-price', newPrice);
}

// ==================== Add to Cart ====================
function addToCart(btnEl, itemName) {
    const card = btnEl.closest('.product-item-card');
    const priceEl = card.querySelector('.dynamic-render-price');
    const qtyInput = card.querySelector('.qty-input');
    const variantSelect = card.querySelector('.variant-select');
    const imgEl = card.querySelector('img');

    const price = parseInt(priceEl.getAttribute('data-base-price'));
    const qty = parseInt(qtyInput.value) || 1;
    const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text : 'Regular';
    const imgSrc = imgEl ? imgEl.src : '';

    const existingIndex = cart.findIndex(item => item.name === itemName && item.variant === variant);

    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: itemName,
            variant: variant,
            price: price,
            qty: qty,
            img: imgSrc
        });
    }

    qtyInput.value = 1;
    showToast(itemName + ' added to basket!');
    updateCartUI();
}

// ==================== Update Cart UI ====================
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Floating bar
    const floatingBar = document.getElementById('floating-cart');
    const itemCountEl = document.getElementById('cart-item-count');
    const totalPriceEl = document.getElementById('cart-total-price');

    if (totalItems > 0) {
        floatingBar.classList.remove('hidden');
    } else {
        floatingBar.classList.add('hidden');
    }

    itemCountEl.textContent = totalItems;
    totalPriceEl.textContent = '৳' + totalPrice;

    // Cart panel
    const panelBody = document.getElementById('cartPanelBody');
    const emptyState = document.getElementById('cartEmptyState');
    const panelFooter = document.getElementById('cartPanelFooter');

    if (cart.length === 0) {
        panelBody.innerHTML = '<div class="cart-empty-state" id="cartEmptyState"><i class="fa-solid fa-basket-shopping"></i><p>Your basket is empty</p></div>';
        panelFooter.style.display = 'none';
        return;
    }

    panelFooter.style.display = '';

    let html = '';
    cart.forEach(item => {
        html += '<div class="cart-item-row" data-cart-id="' + item.id + '">'
            + '<img class="cart-item-img" src="' + item.img + '" alt="' + item.name + '">'
            + '<div class="cart-item-details">'
            + '<div class="cart-item-name">' + item.name + '</div>'
            + '<div class="cart-item-variant">' + item.variant + '</div>'
            + '<div class="cart-item-bottom">'
            + '<span class="cart-item-price">৳' + (item.price * item.qty) + '</span>'
            + '<div class="cart-item-qty-controls">'
            + '<button class="cart-qty-adjust" onclick="adjustCartQty(' + item.id + ', -1)">-</button>'
            + '<span class="cart-qty-display">' + item.qty + '</span>'
            + '<button class="cart-qty-adjust" onclick="adjustCartQty(' + item.id + ', 1)">+</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<button class="cart-item-delete" onclick="deleteCartItem(' + item.id + ')" title="Remove item">'
            + '<i class="fa-solid fa-trash-can"></i>'
            + '</button>'
            + '</div>';
    });

    panelBody.innerHTML = html;

    document.getElementById('cartSubtotal').textContent = '৳' + totalPrice;
    document.getElementById('cartGrandTotal').textContent = '৳' + totalPrice;
}

// ==================== Adjust Cart Qty ====================
function adjustCartQty(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty < 1) {
        cart = cart.filter(i => i.id !== itemId);
        showToast(item.name + ' removed from basket');
    }
    updateCartUI();
}

// ==================== Delete Cart Item ====================
function deleteCartItem(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        showToast(item.name + ' removed from basket');
    }
    cart = cart.filter(i => i.id !== itemId);
    updateCartUI();
}

// ==================== Cart Panel Open/Close ====================
function openCartPanel() {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartSlidePanel').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartPanel() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSlidePanel').classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== Checkout Modal ====================
function openCheckout() {
    closeCartPanel();
    renderCheckoutSummary();
    document.getElementById('checkoutOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    document.getElementById('checkoutOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function renderCheckoutSummary() {
    const listEl = document.getElementById('checkoutItemsList');
    const totalEl = document.getElementById('checkoutTotalVal');
    let total = 0;
    let html = '';

    cart.forEach(item => {
        const lineTotal = item.price * item.qty;
        total += lineTotal;
        html += '<div class="checkout-item-line">'
            + '<span><span class="qty-badge">' + item.qty + 'x</span> ' + item.name + ' (' + item.variant + ')</span>'
            + '<span>৳' + lineTotal + '</span>'
            + '</div>';
    });

    listEl.innerHTML = html;
    totalEl.textContent = '৳' + total;
}

// ==================== Payment Method Selection ====================
function selectPayment(method, el) {
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input[type="radio"]').checked = true;

    document.getElementById('bkashFields').classList.remove('active');
    document.getElementById('nagadFields').classList.remove('active');

    if (method === 'bkash') {
        document.getElementById('bkashFields').classList.add('active');
    } else if (method === 'nagad') {
        document.getElementById('nagadFields').classList.add('active');
    }
}

// ==================== OTP System ====================

// Generate a random 6-digit OTP
function generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
function sendOtp(method) {
    const numberInput = document.getElementById(method + 'Number');
    const number = numberInput.value.trim();

    // Validate number
    if (!number || number.length < 10) {
        showToast('Please enter a valid ' + (method === 'bkash' ? 'bKash' : 'Nagad') + ' number');
        numberInput.focus();
        return;
    }

    // Generate OTP
    generatedOtp[method] = generateOtpCode();

    // Show OTP section
    const otpSection = document.getElementById(method + 'OtpSection');
    otpSection.style.display = '';

    // Display masked number
    const maskedNumber = '+880 ' + number.substring(0, 2) + '****' + number.substring(number.length - 3);
    document.getElementById(method + 'OtpNumber').textContent = maskedNumber;

    // Disable the send button and change text
    const sendBtn = document.getElementById(method + 'SendOtpBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    // Simulate OTP send delay
    setTimeout(function() {
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> OTP Sent';
        showToast('OTP sent to ' + maskedNumber + ' (Code: ' + generatedOtp[method] + ')');

        // Start countdown
        startOtpTimer(method);

        // Focus first OTP input
        const firstOtpInput = otpSection.querySelector('.otp-digit');
        if (firstOtpInput) firstOtpInput.focus();
    }, 1500);
}

// Start OTP countdown timer
function startOtpTimer(method) {
    // Clear any existing timer
    if (otpTimers[method]) clearInterval(otpTimers[method]);

    otpCountdown[method] = 60;
    const timerEl = document.getElementById(method + 'OtpTimer');
    const resendBtn = document.getElementById(method + 'ResendBtn');

    timerEl.style.display = '';
    resendBtn.style.display = 'none';

    otpTimers[method] = setInterval(function() {
        otpCountdown[method]--;
        timerEl.innerHTML = 'Resend code in <strong>' + otpCountdown[method] + 's</strong>';

        if (otpCountdown[method] <= 0) {
            clearInterval(otpTimers[method]);
            timerEl.style.display = 'none';
            resendBtn.style.display = '';
        }
    }, 1000);
}

// Resend OTP
function resendOtp(method) {
    generatedOtp[method] = generateOtpCode();
    showToast('New OTP sent! (Code: ' + generatedOtp[method] + ')');

    // Clear OTP inputs
    const otpInputs = document.querySelectorAll('.otp-digit[data-otp-group="' + method + '"]');
    otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled');
    });

    // Reset verified state
    otpVerified[method] = false;
    const sendBtn = document.getElementById(method + 'SendOtpBtn');
    sendBtn.classList.remove('verified');
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> OTP Sent';

    // Focus first OTP input
    if (otpInputs.length > 0) otpInputs[0].focus();

    // Restart timer
    startOtpTimer(method);
}

// Handle OTP input - auto move to next field
function handleOtpInput(input) {
    const value = input.value;

    // Only allow digits
    if (!/^\d$/.test(value)) {
        input.value = '';
        return;
    }

    input.classList.add('filled');

    // Move to next input
    const nextInput = input.nextElementSibling;
    if (nextInput && nextInput.classList.contains('otp-digit')) {
        nextInput.focus();
    }

    // Check if all 6 digits filled
    checkOtpComplete(input.getAttribute('data-otp-group'));
}

// Handle keydown for OTP - backspace navigation
function handleOtpKeydown(e, input) {
    if (e.key === 'Backspace') {
        if (input.value === '') {
            // Move to previous input
            const prevInput = input.previousElementSibling;
            if (prevInput && prevInput.classList.contains('otp-digit')) {
                prevInput.focus();
                prevInput.value = '';
                prevInput.classList.remove('filled');
            }
        } else {
            input.value = '';
            input.classList.remove('filled');
        }
        e.preventDefault();
    }

    if (e.key === 'ArrowLeft') {
        const prevInput = input.previousElementSibling;
        if (prevInput && prevInput.classList.contains('otp-digit')) {
            prevInput.focus();
        }
    }

    if (e.key === 'ArrowRight') {
        const nextInput = input.nextElementSibling;
        if (nextInput && nextInput.classList.contains('otp-digit')) {
            nextInput.focus();
        }
    }
}

// Check if OTP is fully entered and verify
function checkOtpComplete(method) {
    const otpInputs = document.querySelectorAll('.otp-digit[data-otp-group="' + method + '"]');
    let enteredOtp = '';

    otpInputs.forEach(input => {
        enteredOtp += input.value;
    });

    if (enteredOtp.length === 6) {
        verifyOtp(method, enteredOtp);
    }
}

// Verify OTP
function verifyOtp(method, enteredOtp) {
    const sendBtn = document.getElementById(method + 'SendOtpBtn');

    if (enteredOtp === generatedOtp[method]) {
        // OTP verified successfully
        otpVerified[method] = true;

        sendBtn.classList.add('verified');
        sendBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verified Successfully';
        sendBtn.disabled = true;

        // Clear timer
        if (otpTimers[method]) clearInterval(otpTimers[method]);

        // Hide timer/resend
        document.getElementById(method + 'OtpTimer').style.display = 'none';
        document.getElementById(method + 'ResendBtn').style.display = 'none';

        // Disable OTP inputs
        const otpInputs = document.querySelectorAll('.otp-digit[data-otp-group="' + method + '"]');
        otpInputs.forEach(input => {
            input.disabled = true;
            input.style.borderColor = 'var(--success-green)';
            input.style.background = '#f0fff4';
        });

        showToast('Payment verified successfully!');
    } else {
        // OTP incorrect
        showToast('Incorrect OTP. Please try again.');

        // Shake animation - clear and refocus
        const otpInputs = document.querySelectorAll('.otp-digit[data-otp-group="' + method + '"]');
        otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
            input.style.borderColor = 'var(--danger-red)';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 1500);
        });

        if (otpInputs.length > 0) otpInputs[0].focus();
    }
}

// ==================== Handle Order Submission ====================
function handleOrderSubmission(e) {
    e.preventDefault();

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Validate name
    if (!name) {
        showToast('Please enter your name');
        document.getElementById('custName').focus();
        return;
    }

    // Validate phone
    if (!phone || phone.length < 11) {
        showToast('Please enter a valid phone number');
        document.getElementById('custPhone').focus();
        return;
    }

    // Validate address
    if (!address) {
        showToast('Please enter your delivery address');
        document.getElementById('custAddress').focus();
        return;
    }

    // Validate mobile banking + OTP
    if (paymentMethod === 'bkash') {
        const bkashNum = document.getElementById('bkashNumber').value.trim();
        if (!bkashNum || bkashNum.length < 10) {
            showToast('Please enter a valid bKash number');
            document.getElementById('bkashNumber').focus();
            return;
        }
        if (!otpVerified.bkash) {
            showToast('Please verify your bKash number with OTP first');
            return;
        }
    }

    if (paymentMethod === 'nagad') {
        const nagadNum = document.getElementById('nagadNumber').value.trim();
        if (!nagadNum || nagadNum.length < 10) {
            showToast('Please enter a valid Nagad number');
            document.getElementById('nagadNumber').focus();
            return;
        }
        if (!otpVerified.nagad) {
            showToast('Please verify your Nagad number with OTP first');
            return;
        }
    }

    // All validations passed - place order
    closeCheckout();

    document.getElementById('orderSuccessOverlay').classList.add('active');

    // Clear cart
    cart = [];
    updateCartUI();

    // Reset form
    document.getElementById('orderCheckoutForm').reset();
    document.getElementById('bkashNumber').value = '';
    document.getElementById('nagadNumber').value = '';

    // Reset OTP states
    resetOtpState('bkash');
    resetOtpState('nagad');

    // Reset payment selection to bKash
    selectPayment('bkash', document.querySelector('.payment-option.bkash'));
}

// Reset OTP state for a payment method
function resetOtpState(method) {
    otpVerified[method] = false;
    generatedOtp[method] = '';
    if (otpTimers[method]) clearInterval(otpTimers[method]);
    otpCountdown[method] = 0;

    // Hide OTP section
    const otpSection = document.getElementById(method + 'OtpSection');
    if (otpSection) otpSection.style.display = 'none';

    // Reset OTP inputs
    const otpInputs = document.querySelectorAll('.otp-digit[data-otp-group="' + method + '"]');
    otpInputs.forEach(input => {
        input.value = '';
        input.disabled = false;
        input.classList.remove('filled');
        input.style.borderColor = '';
        input.style.background = '';
    });

    // Reset send button
    const sendBtn = document.getElementById(method + 'SendOtpBtn');
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.classList.remove('verified');
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send OTP to Verify';
    }

    // Reset timer/resend
    const timerEl = document.getElementById(method + 'OtpTimer');
    const resendBtn = document.getElementById(method + 'ResendBtn');
    if (timerEl) {
        timerEl.style.display = '';
        timerEl.innerHTML = 'Resend code in <strong>60s</strong>';
    }
    if (resendBtn) resendBtn.style.display = 'none';
}

function closeOrderSuccess() {
    document.getElementById('orderSuccessOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== Toast Notification ====================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.add('show-alert');
    setTimeout(function() {
        toast.classList.remove('show-alert');
    }, 3000);
}

// ==================== Keyboard Shortcuts ====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCartPanel();
        closeCheckout();
        closeOrderSuccess();
    }
});

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
});
