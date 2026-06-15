// Global cart item state
let currentOrder = null;

// Menu category filter
function filterMenu(category) {
    const cards = document.querySelectorAll('.product-item-card');
    const tabs = document.querySelectorAll('.filter-tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    if(event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Portion price selection update
function updateDynamicPricing(selectElement) {
    const selectedPrice = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    if(cardBody) {
        const priceDisplay = cardBody.querySelector('.dynamic-render-price');
        if (priceDisplay) {
            priceDisplay.innerText = ' ৳ ' + selectedPrice;
            priceDisplay.setAttribute('data-base-price', selectedPrice);
        }
    }
}

// Quantity Counter adjustment (+ / -)
function updateQty(btn, change) {
    const input = btn.parentElement.querySelector('.qty-input');
    let newValue = parseInt(input.value) + change;
    if (newValue < 1) newValue = 1;
    input.value = newValue;
}

// "Add" বাটনে ক্লিক করলে এই ফাংশনটি সরাসরি রান হবে এবং চেকআউট ওপেন করবে
function addToCart(btn, itemName) {
    const cardBody = btn.closest('.product-card-body');
    let priceText = "0";
    
    const priceEl = cardBody.querySelector('.dynamic-render-price');
    if (priceEl) {
        priceText = priceEl.getAttribute('data-base-price') || priceEl.innerText.replace(/[^0-9]/g, '');
    }
    
    const itemPrice = parseFloat(priceText);
    const itemQty = parseInt(cardBody.querySelector('.qty-input').value || 1);
    const itemTotal = itemPrice * itemQty;

    // সরাসরি চেকআউট প্যানেল তৈরি ও ওপেন করা হচ্ছে
    openDirectCheckoutPanel(itemName, itemQty, itemTotal);
    
    // কাউন্টার আবার ১ করে দেওয়া হচ্ছে
    if (cardBody.querySelector('.qty-input')) {
        cardBody.querySelector('.qty-input').value = "1";
    }
}

// চেকআউট প্যানেল জেনারেটর (image_f46d4e.png ইন্টারফেস অনুযায়ী)
function openDirectCheckoutPanel(itemName, qty, total) {
    let checkoutPanel = document.getElementById('direct-checkout-overlay');
    
    if (!checkoutPanel) {
        checkoutPanel = document.createElement('div');
        checkoutPanel.id = 'direct-checkout-overlay';
        document.body.appendChild(checkoutPanel);
    }

    checkoutPanel.innerHTML = `
        <div class="checkout-fullscreen-wrapper">
            <div class="checkout-header-bar">
                <span class="close-checkout-x" onclick="closeFullCheckout()">×</span>
                <h2 class="checkout-title-text">Checkout</h2>
            </div>
            
            <div class="checkout-body-form">
                <div class="checkout-summary-pill">
                    <strong>Selected Item:</strong> ${qty}x ${itemName} — <span style="color:#1ebd60; font-weight:bold;">Total: ৳${total}</span>
                </div>
                
                <div class="input-flat-group">
                    <label>Full Name</label>
                    <input type="text" id="custName" placeholder="Enter your name" required>
                </div>
                
                <div class="input-flat-group">
                    <label>Delivery Address</label>
                    <input type="text" id="custAddress" placeholder="House, Road, Area" required>
                </div>
                
                <div class="input-flat-group">
                    <label>Phone Number (for OTP)</label>
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
                <p>Enter the 4-digit verification code sent to your number:</p>
                <input type="text" id="direct-otp-input" placeholder="0 0 0 0" maxlength="4">
                <button class="btn-verify-otp" onclick="confirmDirectOtp()">Verify & Complete Order</button>
            </div>
        </div>

        <div id="order-success-panel" class="success-modal-overlay" style="display: none;">
            <div class="success-modal-content">
                <h2 style="color: #1ebd60; margin-bottom: 10px;">Order Placed Successfully!</h2>
                <p>Your order has been received and is being prepared.</p>
                <button class="btn-success-close" onclick="resetToMenu()">Back to Menu</button>
            </div>
        </div>
    `;

    checkoutPanel.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

function closeFullCheckout() {
    const panel = document.getElementById('direct-checkout-overlay');
    if (panel) panel.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function submitDirectOrder() {
    const name = document.getElementById('custName').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const phone = document.getElementById('custPhone').value.trim();

    if (!name || !address || !phone) {
        alert("Please fill up all the fields before placing order!");
        return;
    }
    document.getElementById('otp-verification-panel').style.display = 'flex';
}

function confirmDirectOtp() {
    const otpInput = document.getElementById('direct-otp-input').value.trim();
    if (otpInput.length !== 4) {
        alert("Please enter a valid 4-digit OTP code!");
        return;
    }
    document.getElementById('otp-verification-panel').style.display = 'none';
    document.getElementById('order-success-panel').style.display = 'flex';
}

function resetToMenu() {
    const panel = document.getElementById('direct-checkout-overlay');
    if (panel) panel.style.display = 'none';
    document.body.style.overflow = 'auto';
}
