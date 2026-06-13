// ==================== Global Application State ====================
let cart = [];
let fpOtpVerified = false;
let generatedOtp = '1234'; // Fallback static check parameter

// ==================== Owner Image Preview Engine ====================
function previewOwnerImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImg = document.getElementById('owner-profile-img');
            if (profileImg) profileImg.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==================== Smooth Menu Categorization Filter ====================
function filterMenu(category) {
    const tabs = document.querySelectorAll('.filter-tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active context indicator dynamically
    const eventTarget = event ? event.currentTarget : null;
    if (eventTarget) {
        eventTarget.classList.add('active');
    } else {
        tabs.forEach(tab => {
            if (tab.getAttribute('onclick').includes(`'${category}'`)) {
                tab.classList.add('active');
            }
        });
    }

    const cards = document.querySelectorAll('.product-item-card');
    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==================== Product Interface Quantity Counter Manager ====================
function updateQty(button, delta) {
    const container = button.closest('.qty-selector');
    if (!container) return;
    const input = container.querySelector('.qty-input');
    if (!input) return;
    
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > 50) val = 50; // Dynamic safety bound restriction limit execution
    input.value = val;
}

// ==================== Component Context Dropdown Variation Pricing Sync ====================
function updateDynamicPricing(selectEl) {
    const card = selectEl.closest('.product-item-card') || selectEl.closest('.product-card-body').parentElement;
    const priceEl = card.querySelector('.dynamic-render-price');
    if (!priceEl) return;
    
    const newPrice = selectEl.value;
    priceEl.textContent = ' ৳ ' + newPrice;
    priceEl.setAttribute('data-base-price', newPrice);
}

// ==================== Pure Foodpanda Structural Cart Framework Core Operations ====================
function addToCart(btnEl, itemName) {
    const card = btnEl.closest('.product-item-card');
    const priceEl = card.querySelector('.dynamic-render-price');
    const qtyInput = card.querySelector('.qty-input');
    const variantSelect = card.querySelector('.variant-select');
    const imgEl = card.querySelector('img');

    if (!priceEl || !qtyInput) return;

    const basePrice = parseInt(priceEl.getAttribute('data-base-price')) || parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0;
    const qty = parseInt(qtyInput.value) || 1;
    
    // Exact text extraction matching the dropdown variation label maps
    const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text.split('(')[0].trim() : 'Regular';
    const imgSrc = imgEl ? imgEl.src : '';

    const existingIndex = cart.findIndex(item => item.name === itemName && item.variant === variant);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: itemName,
            variant: variant,
            price: basePrice,
            qty: qty,
            image: imgSrc
        });
    }

    qtyInput.value = 1; // Reset product selector count block
    showToast(`🛒 ${itemName} (${variant}) basket-e add hoyeche!`);
    renderCartData();
}

// ==================== Reactively Re-render Core Floating Basket UI Data Blocks ====================
function renderCartData() {
    const floatingBtn = document.getElementById('floating-cart') || document.querySelector('.fp-floating-basket-btn');
    const countBadge = document.getElementById('cart-item-count') || document.getElementById('fp-basket-count');
    const totalAmountBadge = document.getElementById('cart-total-price') || document.getElementById('fp-total-amount');
    const itemsContainer = document.getElementById('fp-cart-items-body');
    const summaryTotalVal = document.getElementById('fp-summary-total-val');

    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    let totalAmt = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Dynamic state reactive tracking display controllers
    if (floatingBtn) {
        if (totalQty > 0) {
            floatingBtn.style.display = 'flex';
            floatingBtn.classList.add('active');
        } else {
            floatingBtn.style.display = 'none';
            floatingBtn.classList.remove('active');
            closeCartPanel();
        }
    }

    if (countBadge) countBadge.textContent = totalQty;
    if (totalAmountBadge) totalAmountBadge.textContent = '৳ ' + totalAmt;
    if (summaryTotalVal) summaryTotalVal.textContent = '৳ ' + totalAmt;

    // Injecting inner structural layouts safely supporting standard adjustments
    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:#aaa;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px; color:#e0e0e0;"></i>
                    <p style="font-size:14px;">Apnar basket khali ache</p>
                </div>`;
            return;
        }

        let itemsHtml = '';
        cart.forEach(item => {
            itemsHtml += `
                <div class="fp-cart-item">
                    <div class="fp-item-details">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'">
                        <div class="fp-item-meta">
                            <h4>${item.name}</h4>
                            <p class="fp-variant-label">${item.variant}</p>
                            <span class="fp-unit-price">৳${item.price}</span>
                        </div>
                    </div>
                    <div class="fp-item-controls">
                        <div class="fp-sidebar-qty-ctrl">
                            <button type="button" class="fp-sq-btn" onclick="adjustCartQty(${item.id}, -1)">-</button>
                            <span class="fp-sq-output">${item.qty}</span>
                            <button type="button" class="fp-sq-btn" onclick="adjustCartQty(${item.id}, 1)">+</button>
                        </div>
                        <span class="fp-item-subtotal">৳${item.price * item.qty}</span>
                    </div>
                </div>`;
        });
        itemsContainer.innerHTML = itemsHtml;
    }
}

// ==================== Modify Quantity Intersections Directly Inside the Sidebar ====================
function adjustCartQty(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty < 1) {
        cart = cart.filter(i => i.id !== itemId);
        showToast(`🗑️ ${item.name} basket theke bad deya hoyeche`);
    }
    renderCartData();
}

// ==================== Visual Sidebar Modal Opening/Closing Controllers ====================
function toggleFpCart() {
    const sidebar = document.getElementById('fp-cart-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

function closeCartPanel() {
    const sidebar = document.getElementById('fp-cart-sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==================== Dynamic Form Control Interaction Router Pipeline ====================
function selectFpPayment(method, element) {
    // Clean and remove active layout metrics across parallel sibling cards
    const cards = document.querySelectorAll('.fp-pay-card');
    cards.forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');

    // Always reset verification parameters when route swaps
    fpOtpVerified = false;
    const otpSection = document.getElementById('fp-otp-section');
    const sendBtn = document.getElementById('fp-sendBtn');
    const boxesArea = document.getElementById('fp-otp-boxes-area');

    if (boxesArea) boxesArea.style.display = 'none';
    if (sendBtn) {
        sendBtn.innerHTML = 'Send OTP';
        sendBtn.disabled = false;
        sendBtn.classList.remove('success');
    }

    if (otpSection) {
        if (method === 'digital' || method === 'bkash' || method === 'nagad') {
            otpSection.style.display = 'block';
        } else {
            otpSection.style.display = 'none';
        }
    }
}

// ==================== Trigger & Auto Fill Digital Wallet OTP Simulators ====================
function triggerWalletOtp() {
    const phoneInput = document.getElementById('fp-walletNumber');
    if (!phoneInput || phoneInput.value.trim().length < 11) {
        showToast("⚠️ Error: Valid 11-digit number shortcut entry prod korun!");
        return;
    }

    const sendBtn = document.getElementById('fp-sendBtn');
    if (sendBtn) {
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';
        sendBtn.disabled = true;
    }

    // Standard fast network timeout simulator injection
    setTimeout(() => {
        if (sendBtn) {
            sendBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> OTP Verified';
            sendBtn.classList.add('success');
        }
        fpOtpVerified = true;

        const boxesArea = document.getElementById('fp-otp-boxes-area');
        if (boxesArea) {
            boxesArea.style.display = 'block';
            
            // Random secure string generator mapped cleanly inside consecutive input nodes
            const digitInputs = document.querySelectorAll('.fp-otp-box');
            generatedOtp = '';
            digitInputs.forEach(box => {
                const randomDigit = Math.floor(Math.random() * 10);
                generatedOtp += randomDigit;
                box.value = randomDigit;
                box.disabled = true;
                box.style.borderColor = '#27ae60';
            });
        }
        showToast("✅ Auto-verification completed successfully!");
    }, 1200);
}

// ==================== Intercepting Submissions & Order State Validators ====================
function handleOrderSubmission(event) {
    if (event) event.preventDefault();
    submitFpOrder();
}

function submitFpOrder() {
    if (cart.length === 0) {
        showToast("⚠️ Error: Checkout run korar jonno prothome item basket-e add korun!");
        return;
    }

    const name = document.getElementById('fp-custName')?.value.trim();
    const phone = document.getElementById('fp-custPhone')?.value.trim();
    const address = document.getElementById('fp-custAddress')?.value.trim();

    if (!name || !phone || !address) {
        showToast("⚠️ Shobgulo core mandatory form elements properly input korun!");
        return;
    }

    const otpSection = document.getElementById('fp-otp-section');
    if (otpSection && otpSection.style.display === 'block' && !fpOtpVerified) {
        showToast("⚠️ Verification strictly standard check fail: Prothome dynamic wallet code complete korun!");
        return;
    }

    // Trigger explicit display modal changes on processing completions
    closeCartPanel();
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'flex';
        successModal.classList.add('active');
    } else {
        alert("🎉 Order Placed Successfully!");
    }

    // Flush and completely clear operational parameter metrics cleanly
    cart = [];
    renderCartData();

    // Soft reset input nodes values safely
    document.getElementById('fp-custName').value = '';
    document.getElementById('fp-custPhone').value = '';
    document.getElementById('fp-custAddress').value = '';
    
    const walletNumInput = document.getElementById('fp-walletNumber');
    if (walletNumInput) walletNumInput.value = '';

    // Standard fallback UI routine parameters updates
    selectFpPayment('cod', document.querySelector('.fp-pay-card'));
}

function closeOrderSuccess() {
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'none';
        successModal.classList.remove('active');
    }
}

// ==================== Global Centered Live Alert Notification Engine ====================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show-alert');
    
    setTimeout(() => {
        toast.classList.remove('show-alert');
    }, 2500);
}

// ==================== Dynamic Operational Key Controls Mappings ====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCartPanel();
        closeOrderSuccess();
    }
});

// Auto initialize and map the global application logic lifecycle instances
document.addEventListener('DOMContentLoaded', function() {
    renderCartData();
});
