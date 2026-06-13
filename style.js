// ==================== Global Application State ====================
let cart = [];
let fpOtpVerified = false;
let generatedOtp = '1234';

// Dynamic CSS Injection for Foodpanda Buttons & Sidebar Layout Alignment
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
    }
    .fp-stepper-val {
        font-weight: bold;
        font-size: 14px;
        min-width: 20px;
        text-align: center;
        color: white !important;
    }
`;
document.head.appendChild(fpStyle);

// ==================== Pre-Add Quantity Box Increments ====================
function updateQty(btnEl, delta) {
    const input = btnEl.parentElement.querySelector('.qty-input');
    if (!input) return;
    let currentVal = parseInt(input.value) || 1;
    let newVal = currentVal + delta;
    if (newVal < 1) newVal = 1;
    input.value = newVal;
}

// ==================== Image Preview Engine (Only Chef Vera) ====================
function previewChefImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profileImg = document.getElementById('chef-vera-img');
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
    
    syncCardButtons();
}

// ==================== Pure Foodpanda Style Core Operations ====================
function addToCart(btnEl, itemName) {
    const card = btnEl.closest('.product-item-card');
    const priceEl = card.querySelector('.dynamic-render-price');
    const variantSelect = card.querySelector('.variant-select');
    const imgEl = card.querySelector('img');
    const qtyInput = card.querySelector('.qty-input');
    
    if (!priceEl) return;
    const basePrice = parseInt(priceEl.getAttribute('data-base-price')) || parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0;
    const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text.split('(')[0].trim() : 'Regular';
    const imgSrc = imgEl ? imgEl.src : '';
    const qtyToAdd = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
    
    const existingIndex = cart.findIndex(item => item.name === itemName && item.variant === variant);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += qtyToAdd;
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: itemName,
            variant: variant,
            price: basePrice,
            qty: qtyToAdd,
            image: imgSrc
        });
    }
    
    if (qtyInput) qtyInput.value = 1; 
    
    showToast(`🛒 ${itemName} basket-e add hoyeche!`);
    renderCartData();
    syncCardButtons(); 
    
    // Auto-open Foodpanda style checkout sidebar immediately
    openFpSidebar();
}

function syncCardButtons() {
    document.querySelectorAll('.product-item-card').forEach(card => {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        const itemName = h3.innerText.trim();
        
        const variantSelect = card.querySelector('.variant-select');
        const variant = variantSelect ? variantSelect.options[variantSelect.selectedIndex].text.split('(')[0].trim() : 'Regular';
        
        const cartItem = cart.find(item => item.name === itemName && item.variant === variant);
        
        let actionGroup = card.querySelector('.cart-action-group');
        let inlineStepper = card.querySelector('.fp-inline-stepper');
        
        if (cartItem) {
            if (actionGroup) actionGroup.style.display = 'none';
            
            if (!inlineStepper) {
                inlineStepper = document.createElement('div');
                inlineStepper.className = 'fp-inline-stepper';
                inlineStepper.innerHTML = `
                    <button type="button" class="fp-stepper-btn minus-btn">-</button>
                    <span class="fp-stepper-val">${cartItem.qty}</span>
                    <button type="button" class="fp-stepper-btn plus-btn">+</button>
                `;
                
                inlineStepper.querySelector('.minus-btn').onclick = (e) => {
                    e.stopPropagation();
                    adjustQtyByMeta(itemName, variant, -1);
                };
                inlineStepper.querySelector('.plus-btn').onclick = (e) => {
                    e.stopPropagation();
                    adjustQtyByMeta(itemName, variant, 1);
                };
                
                if (actionGroup) {
                    actionGroup.parentNode.insertBefore(inlineStepper, actionGroup.nextSibling);
                }
            } else {
                inlineStepper.style.display = 'flex';
                inlineStepper.querySelector('.fp-stepper-val').innerText = cartItem.qty;
            }
        } else {
            if (actionGroup) actionGroup.style.display = 'flex';
            if (inlineStepper) inlineStepper.style.display = 'none';
        }
    });
}

function adjustQtyByMeta(name, variant, delta) {
    const item = cart.find(i => i.name === name && i.variant === variant);
    if (!item) return;
    
    item.qty += delta;
    if (item.qty < 1) {
        cart = cart.filter(i => i.id !== item.id);
        showToast(`🗑️ ${name} remove kora hoyeche`);
    }
    renderCartData();
    syncCardButtons();
}

// ==================== Reactively Render Floating Basket & Sidebar Data ====================
// ==================== Foodpanda Native Render Engine Engine Pipeline ====================
function renderCartData() {
    const floatingBtn = document.getElementById('floating-cart');
    const countBadge = document.getElementById('cart-item-count');
    const totalAmountBadge = document.getElementById('cart-total-price');
    const itemsContainer = document.getElementById('fp-cart-items-container');
    const summaryTotalVal = document.getElementById('fp-sticky-total');
    
    // Checkout DOM References
    const chkList = document.getElementById('checkout-items-list');
    const chkSubtotal = document.getElementById('chk-subtotal');
    const chkFinalTotal = document.getElementById('chk-final-total');
    
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    let subtotalAmt = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Foodpanda structural calculations: Subtotal + Delivery Fee (32) + Service Fee (19)
    let grandTotalAmt = subtotalAmt > 0 ? (subtotalAmt + 32 + 19) : 0;
    
    // 1. Floating Basket Bar Visibility Wrapper
    if (floatingBtn) {
        if (totalQty > 0) {
            floatingBtn.style.display = 'flex';
            floatingBtn.classList.remove('hidden');
        } else {
            floatingBtn.style.display = 'none';
            floatingBtn.classList.add('hidden');
            closeFpSidebar();
            closeFullCheckout();
        }
    }
    
    if (countBadge) countBadge.textContent = totalQty;
    if (totalAmountBadge) totalAmountBadge.textContent = 'Tk ' + subtotalAmt;
    if (summaryTotalVal) summaryTotalVal.textContent = 'Tk ' + grandTotalAmt;
    
    // 2. Sidebar Basket Data Injector (Matches image_c57c36.png)
    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:#aaa;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px; color:#e0e0e0;"></i>
                    <p style="font-size:14px; font-weight:600;">Your basket is empty</p>
                </div>`;
        } else {
            let itemsHtml = '';
            cart.forEach(item => {
                let fullName = item.variant ? `${item.name} - ${item.variant}` : item.name;
                
                // Switch icon smoothly based on final quantity count
                let leftIcon = item.qty === 1 
                    ? `<i class="fa-regular fa-trash-can"></i>` 
                    : `<i class="fa-solid fa-minus"></i>`;

                itemsHtml += `
                    <div class="fp-cart-item">
                        <img src="${item.image}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'" class="fp-item-img">
                        <div class="fp-item-info">
                            <div class="fp-item-title">${fullName}</div>
                            <div class="fp-item-row-bottom">
                                <span class="fp-item-price">Tk ${item.price * item.qty}</span>
                                <div class="fp-qty-pill">
                                    <button type="button" onclick="adjustCartQty(${item.id}, -1)">${leftIcon}</button>
                                    <span>${item.qty}</span>
                                    <button type="button" onclick="adjustCartQty(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            itemsContainer.innerHTML = itemsHtml;
        }
    }

    // 3. Full Screen Checkout Item Sheet Injector (Matches image_c57c33.png)
    if (chkList) {
        let chkHtml = '';
        cart.forEach(item => {
            let fullName = item.variant ? `${item.name} - ${item.variant}` : item.name;
            chkHtml += `
                <div class="chk-single-item">
                    <span><strong>${item.qty}x</strong> ${fullName}</span>
                    <span style="font-weight:600; color:#333;">Tk ${item.price * item.qty}</span>
                </div>`;
        });
        chkList.innerHTML = chkHtml;
        
        if (chkSubtotal) chkSubtotal.textContent = 'Tk ' + subtotalAmt;
        if (chkFinalTotal) chkFinalTotal.textContent = 'Tk ' + grandTotalAmt;
    }
}

// Global Quantity Controllers
function adjustCartQty(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    item.qty += delta;
    if (item.qty < 1) {
        cart = cart.filter(i => i.id !== itemId);
        showToast(`🗑️ ${item.name} basket theke bad deya hoyeche`);
    }
    renderCartData();
    if (typeof syncCardButtons === "function") syncCardButtons();
}

function addDirectAddon(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: name,
            variant: '',
            price: price,
            qty: 1,
            image: 'https://images.unsplash.com/photo-1626082895617-2c6ad3ed327a?w=100'
        });
        showToast(`➕ Added ${name} to your order!`);
    }
    renderCartData();
    if (typeof syncCardButtons === "function") syncCardButtons();
}

// ==================== Checkout Screen Controls ====================
function openFpSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFpSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openFullCheckout() {
    if (cart.length === 0) {
        showToast("⚠️ Basket khali! Order placement process processing possible na.");
        return;
    }
    closeFpSidebar();
    const chkPage = document.getElementById('full-checkout-page');
    if (chkPage) chkPage.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullCheckout() {
    const chkPage = document.getElementById('full-checkout-page');
    if (chkPage) chkPage.classList.remove('active');
    document.body.style.overflow = '';
}

// Intercepting Final Submission Pipeline
function submitFinalOrder() {
    const streetInput = document.getElementById('chk-street');
    if (streetInput && !streetInput.value.trim()) {
        showToast("⚠️ We're missing your street / house number!");
        streetInput.focus();
        return;
    }

    closeFullCheckout();
    
    // Dynamic Modal Compatibility 
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'flex';
        successModal.classList.add('active');
    } else {
        alert("🎉 Sultan's Dine - Order Placed Successfully via Cash on Delivery!");
    }
    
    cart = [];
    renderCartData();
    if (typeof syncCardButtons === "function") syncCardButtons();
    if (streetInput) streetInput.value = '';
}

// ==================== Native Event Listener Mapping Utilities ====================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show-alert');
    setTimeout(() => {
        toast.classList.remove('show-alert');
    }, 2500);
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeFpSidebar();
        closeFullCheckout();
        if (typeof closeOrderSuccess === "function") closeOrderSuccess();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    renderCartData();
    if (typeof syncCardButtons === "function") syncCardButtons();
    
    // Multi-option UI Tip Toggler Hook Inside Checkout Page
    const tipButtons = document.querySelectorAll('.tip-btn');
    tipButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tipButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showToast(`🏍️ Rider tip updated!`);
        });
    });
});
