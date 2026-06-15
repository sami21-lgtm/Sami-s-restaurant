let cart = [];
let isOtpVerified = false;

// 2. Filter Menu Function
function filterMenu(category) {
    const items = document.querySelectorAll('.product-item-card');
    const buttons = document.querySelectorAll('.filter-tab-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');

    items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 3. Update Dynamic Pricing (When user changes portion)
function updateDynamicPricing(selectElement) {
    const card = selectElement.closest('.product-card-body');
    const priceSpan = card.querySelector('.dynamic-render-price');
    const selectedValue = selectElement.value;
    
    if (priceSpan) {
        priceSpan.innerText = '৳ ' + selectedValue;
        priceSpan.setAttribute('data-base-price', selectedValue);
    }
}

// 4. Update Quantity (+/- Buttons)
function updateQty(btn, change) {
    const input = btn.parentElement.querySelector('.qty-input');
    let currentVal = parseInt(input.value);
    let newVal = currentVal + change;
    
    if (newVal >= 1) {
        input.value = newVal;
    }
}

// 5. Add to Cart
function addToCart(btn, itemName) {
    const card = btn.closest('.product-card-body');
    const priceSpan = card.querySelector('.dynamic-render-price');
    
    if (!priceSpan) return;
    
    const price = parseFloat(priceSpan.getAttribute('data-base-price'));
    const qtyInput = card.querySelector('.qty-input');
    const qty = parseInt(qtyInput.value);
    const imgElement = card.closest('.product-item-card').querySelector('img');
    const imgSrc = imgElement ? imgElement.src : 'https://via.placeholder.com/100';

    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ name: itemName, price: price, qty: qty, img: imgSrc });
    }

    // Reset input to 1
    qtyInput.value = 1;
    
    // Update UI
    updateCartUI();
    
    // Visual Feedback
    const originalText = btn.innerText;
    btn.innerText = "Added!";
    btn.style.backgroundColor = "#22c55e"; // Green
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = ""; // Revert
    }, 1000);
}

// 6. Update Cart Sidebar UI (Calculate Total & Render Items)
function updateCartUI() {
    const container = document.getElementById('fp-cart-items-container');
    const countSpan = document.getElementById('cart-item-count');
    
    if (!container || !countSpan) return;

    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    countSpan.innerText = totalQty;
    
    // Show/Hide Floating Cart
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        if (totalQty > 0) {
            floatingCart.classList.remove('hidden');
        } else {
            floatingCart.classList.add('hidden');
            closeFpSidebar();
        }
    }

    // Render Items in Sidebar
    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const itemHtml = `
            <div class="fp-cart-item" style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <img src="${item.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 14px; margin: 0;">${item.name}</h4>
                    <p style="font-size: 12px; color: #666;">${item.qty} x ৳${item.price}</p>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
                    <span style="font-weight: bold;">৳${itemTotal}</span>
                    <button onclick="removeFromCart(${index})" style="background: none; border: none; color: red; font-size: 12px; cursor: pointer;">Remove</button>
                </div>
            </div>
        `;
        container.innerHTML += itemHtml;
    });

    // Calculate Totals
    const deliveryFee = subtotal > 0 ? 60 : 0; // 60 TK Delivery Fee
    const grandTotal = subtotal + deliveryFee;

    // Update Sidebar Footer (Total + Checkout Button)
    const footer = document.querySelector('.fp-sidebar-footer');
    if (footer) {
        footer.innerHTML = `
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal</span>
                <span>৳ ${subtotal}</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #666;">
                <span>Delivery</span>
                <span>৳ ${deliveryFee}</span>
            </div>
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; font-size: 18px;">
                <span>Total</span>
                <span>৳ ${grandTotal}</span>
            </div>
            <button onclick="openCheckoutModal()" class="btn-primary" style="width: 100%; padding: 15px; background: #f97316; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">Proceed to Checkout</button>
        `;
    }
}

// 7. Remove Item from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// 8. Open/Close Sidebar
function openFpSidebar() {
    document.getElementById('fp-sidebar').classList.add('active');
    document.getElementById('fp-sidebar-overlay').classList.add('active');
}

function closeFpSidebar() {
    document.getElementById('fp-sidebar').classList.remove('active');
    document.getElementById('fp-sidebar-overlay').classList.remove('active');
}

// 9. Checkout Modal Functions
function openCheckoutModal() {
    closeFpSidebar();
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('order-form').reset();
        const otpSection = document.getElementById('otp-section');
        if(otpSection) otpSection.style.display = 'none';
        isOtpVerified = false;
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('active');
}

// 10. OTP Verification Logic
function verifyOTP() {
    const otpInput = document.getElementById('otp-input');
    const msg = document.getElementById('otp-msg');
    
    if (!otpInput || !msg) return;

    // Simulation: OTP must be 1234
    if (otpInput.value === '1234') { 
        msg.style.color = 'green';
        msg.innerText = 'OTP Verified Successfully!';
        isOtpVerified = true;
    } else {
        msg.style.color = 'red';
        msg.innerText = 'Invalid OTP. Try 1234';
        isOtpVerified = false;
    }
}

// 11. Final Order Submission
function verifyOTPAndOrder() {
    const phone = document.getElementById('cust-phone');
    const name = document.getElementById('cust-name');
    const address = document.getElementById('cust-address');
    
    if (!phone || !name || !address) return;

    // Check if OTP is verified first
    if (!isOtpVerified) {
        const otpSection = document.getElementById('otp-section');
        if (otpSection) otpSection.style.display = 'block';
        alert('Please verify your phone number first with the OTP.');
        return;
    }

    if (isOtpVerified) {
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        const paymentValue = paymentMethod ? paymentMethod.value : 'cod';
        
        // Success Message
        alert(`Order Placed Successfully!\n\nName: ${name.value}\nAddress: ${address.value}\nPayment: ${paymentValue.toUpperCase()}\n\nThank you for eating at Sami's Restaurant!`);
        
        // Clear Cart and Reset
        cart = [];
        updateCartUI();
        closeCheckoutModal();
    }
}
