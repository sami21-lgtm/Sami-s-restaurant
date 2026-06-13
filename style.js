let cart = [];
let fpOtpVerified = false;
let generatedOtp = '1234';

// Dynamic CSS Injection for Foodpanda Buttons (Zate HTML/CSS e haat na deya lage)
const fpStyle = document.createElement('style');
fpStyle.innerHTML = `
    .fp-inline-stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #d70f64 !important;
        color: white !important;
        border-radius: 20px;
        padding: 2px;
        width: 100px;
        height: 36px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin: 5px auto 0 auto;
    }
    .fp-stepper-btn {
        background: none;
        border: none;
        color: white !important;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        width: 30px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.1s ease;
    }
    .fp-stepper-btn:active { transform: scale(0.85); }
    .fp-stepper-val {
        font-weight: bold;
        font-size: 14px;
        min-width: 20px;
        text-align: center;
        color: white !important;
    }
`;
document.head.appendChild(fpStyle);

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
    
    const eventTarget = window.event ? window.event.currentTarget : null;
    if (eventTarget) {
        eventTarget.classList.add('active');
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

// ==================== Component Context Dropdown Variation Pricing Sync ====================
function updateDynamicPricing(selectEl) {
    const card = selectEl.closest('.product-item-card');
    if (!card) return;
    const priceEl = card.querySelector('.dynamic-render-price');
    if (!priceEl) return;
    
    const newPrice = selectEl.value;
    priceEl.textContent = ' ৳ ' + newPrice;
    priceEl.setAttribute('data-base-price', newPrice);
    
    // Auto-sync buttons if variant changes
    syncCardButtons();
}

// ==================== Foodpanda Structural Cart Framework Core Operations ====================
function addToCart(btnEl, itemName) {
    const card = btnEl.closest('.product-item-card');
    const priceEl = card.querySelector('.dynamic-render-price');
    const variantSelect = card.querySelector('.variant-select');
    const imgEl = card.querySelector('img');

    if (!priceEl) return;

    const basePrice = parseInt(priceEl.getAttribute('data-base-price')) || parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0;
    const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text.split('(')[0].trim() : 'Regular';
    const imgSrc = imgEl ? imgEl.src : '';

    const existingIndex = cart.findIndex(item => item.name === itemName && item.variant === variant);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: itemName,
            variant: variant,
            price: basePrice,
            qty: 1,
            image: imgSrc
        });
    }

    showToast(`🛒 ${itemName} basket-e add hoyeche!`);
    renderCartData();
    syncCardButtons();
}

// ==================== Card Buttons UI State Sync Matrix ====================
function syncCardButtons() {
    document.querySelectorAll('.product-item-card').forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        const itemName = h3.innerText.trim();
        
        const variantSelect = card.querySelector('.variant-select');
        const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text.split('(')[0].trim() : 'Regular';
        
        const cartItem = cart.find(item => item.name === itemName && item.variant === variant);
        
        // Find original native button (Add to Cart / Add)
        let originalBtn = card.querySelector('.btn-cart') || card.querySelector('button[onclick^="addToCart"]');
        let inlineStepper = card.querySelector('.fp-inline-stepper');
        
        if (cartItem) {
            // If item is inside cart array: Hide button, inject/show Foodpanda stepper [ - | 1 | + ]
            if (originalBtn) originalBtn.style.display = 'none';
            
            if (!inlineStepper) {
                inlineStepper = document.createElement('div');
                inlineStepper.className = 'fp-inline-stepper';
                inlineStepper.innerHTML = `
                    <button type="button" class="fp-stepper-btn minus-btn">-</button>
                    <span class="fp-stepper-val">${cartItem.qty}</span>
                    <button type="button" class="fp-stepper-btn plus-btn">+</button>
                `;
                
                // Click events inside food card
                inlineStepper.querySelector('.minus-btn').onclick = (e) => {
                    e.stopPropagation();
                    adjustQtyByMeta(itemName, variant, -1);
                };
                inlineStepper.querySelector('.plus-btn').onclick = (e) => {
                    e.stopPropagation();
                    adjustQtyByMeta(itemName, variant, 1);
                };
                
                // Append directly to action row wrapper
                if (originalBtn) {
                    originalBtn.parentNode.insertBefore(inlineStepper, originalBtn.nextSibling);
                }
            } else {
                inlineStepper.style.display = 'flex';
                inlineStepper.querySelector('.fp-stepper-val').innerText = cartItem.qty;
            }
        } else {
            // If completely removed or 0: Restore standard Add button state
            if (originalBtn) originalBtn.style.display = 'block';
            if (inlineStepper) inlineStepper.style.display = 'none';
        }
    });
}

// Helper to routing updates from card interfaces
function adjustQtyByMeta(name, variant, delta) {
    const item = cart.find(i => i.name === name && i.variant === variant);
    if (!item) return;
    
    item.qty += delta;
    if (item.qty < 1) {
        cart = cart.filter(i => i.id !== item.id);
        showToast(`🗑️ ${name} bad deya hoyeche`);
    }
    renderCartData();
    syncCardButtons();
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
                <div class="fp-cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-bottom:1px solid #f5f5f5; gap:10px;">
                    <div class="fp-item-details" style="display:flex; align-items:center; gap:12px; flex:1;">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'" style="width:45px; height:45px; object-fit:cover; border-radius:6px;">
                        <div class="fp-item-meta">
                            <h4 style="margin:0; font-size:14px; color:#333; font-weight:600;">${item.name}</h4>
                            <p class="fp-variant-label" style="margin:2px 0 0; font-size:11px; color:#777;">${item.variant}</p>
                            <span class="fp-unit-price" style="font-size:12px; color:#d70f64; font-weight:600;">৳${item.price}</span>
                        </div>
                    </div>
                    <div class="fp-item-controls" style="display:flex; align-items:center; gap:15px;">
                        <div class="fp-sidebar-qty-ctrl" style="display:flex; align-items:center; background:#f7f7f7; border-radius:20px; padding:2px 6px; border:1px solid #e0e0e0;">
                            <button type="button" onclick="adjustCartQty(${item.id}, -1)" style="background:none; border:none; color:#d70f64; font-weight:bold; font-size:16px; cursor:pointer; width:24px; height:24px;">-</button>
                            <span style="font-size:13px; font-weight:bold; color:#333; min-width:18px; text-align:center;">${item.qty}</span>
                            <button type="button" onclick="adjustCartQty(${item.id}, 1)" style="background:none; border:none; color:#d70f64; font-weight:bold; font-size:16px; cursor:pointer; width:24px; height:24px;">+</button>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px; min-width:75px; justify-content:flex-end;">
                            <span style="font-weight:bold; color:#222; font-size:13px;">৳${item.price * item.qty}</span>
                            <button type="button" onclick="removeDirectItem(${item.id})" style="background:none; border:none; color:#d70f64; cursor:pointer; font-size:14px;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        });
        itemsContainer.innerHTML = itemsHtml;
    }
}

// Modify Quantity Intersections Directly Inside the Sidebar/Checkout Drawer
function adjustCartQty(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    item.qty += delta;
    if (item.qty < 1) {
        cart = cart.filter(i => i.id !== itemId);
        showToast(`🗑️ ${item.name} basket theke bad deya hoyeche`);
    }
    renderCartData();
    syncCardButtons();
}

// Trash bin delete trigger pipeline
function removeDirectItem(itemId) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        cart = cart.filter(i => i.id !== itemId);
        showToast(`🗑️ ${item.name} basket theke bad deya hoyeche`);
    }
    renderCartData();
    syncCardButtons();
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
    const cards = document.querySelectorAll('.fp-pay-card');
    cards.forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');

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
        showToast("⚠️ Error: Valid 11-digit number output korun!");
        return;
    }

    const sendBtn = document.getElementById('fp-sendBtn');
    if (sendBtn) {
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';
        sendBtn.disabled = true;
    }

    setTimeout(() => {
        if (sendBtn) {
            sendBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> OTP Verified';
            sendBtn.classList.add('success');
        }
        fpOtpVerified = true;

        const boxesArea = document.getElementById('fp-otp-boxes-area');
        if (boxesArea) {
            boxesArea.style.display = 'block';
            const digitInputs = document.querySelectorAll('.fp-otp-box');
            digitInputs.forEach(box => {
                box.value = Math.floor(Math.random() * 10);
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
        showToast("⚠️ Error: Basket khali, item add korun!");
        return;
    }

    const name = document.getElementById('fp-custName')?.value.trim();
    const phone = document.getElementById('fp-custPhone')?.value.trim();
    const address = document.getElementById('fp-custAddress')?.value.trim();

    if (!name || !phone || !address) {
        showToast("⚠️ Shobgulo mandatory form information input korun!");
        return;
    }

    const otpSection = document.getElementById('fp-otp-section');
    if (otpSection && otpSection.style.display === 'block' && !fpOtpVerified) {
        showToast("⚠️ Prothome wallet OTP complete korun!");
        return;
    }

    closeCartPanel();
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'flex';
        successModal.classList.add('active');
    } else {
        alert("🎉 Order Placed Successfully!");
    }

    cart = [];
    renderCartData();
    syncCardButtons();

    document.getElementById('fp-custName').value = '';
    document.getElementById('fp-custPhone').value = '';
    document.getElementById('fp-custAddress').value = '';
    const walletNumInput = document.getElementById('fp-walletNumber');
    if (walletNumInput) walletNumInput.value = '';

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

// Keyboard interactions listener mappings
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCartPanel();
        closeOrderSuccess();
    }
});

// Auto initialize and run core sync on DOM contents completion
document.addEventListener('DOMContentLoaded', function() {
    renderCartData();
    syncCardButtons();
});
