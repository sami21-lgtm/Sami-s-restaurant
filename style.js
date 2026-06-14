// ==================== Global Application State Stack ====================
let cart = []; // Core shopping bag storage array

// ==================== Core Cart / Basket Management Engine ====================
function addToCart(name, price, image) {
    // 1. Existing item filtering checklist
    let existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        // New item insertion mapping matrix
        cart.push({
            id: Date.now() + Math.random(),
            name: name,
            price: parseInt(price),
            qty: 1,
            variant: "Standard Portion",
            image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'
        });
    }

    // 2. Real-time updates calculations pipeline refresh
    renderCartData();
    syncCardButtons();

    // 3. Floating Basket display status visibility controller
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.remove('hidden'); // Dynamic active transition pop-up
    }

    // 4. Trigger alert notification prompt
    showToast(`🛒 Added ${name} to your basket!`);
}

// ==================== UI Render / Template Injections Engine ====================
function renderCartData() {
    const cartItemsContainer = document.getElementById('fp-cart-items-container');
    const checkoutItemsList = document.getElementById('checkout-items-list');
    
    // Summary status dynamic counters node references
    const cartItemCount = document.getElementById('cart-item-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const fpStickyTotal = document.getElementById('fp-sticky-total');
    
    const chkSubtotal = document.getElementById('chk-subtotal');
    const chkFinalTotal = document.getElementById('chk-final-total');

    // Mathematical metrics evaluation
    let totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    let subtotalAmt = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Constant pricing metadata matrices
    let deliveryFee = subtotalAmt > 0 ? 32 : 0;
    let serviceFee = subtotalAmt > 0 ? 19 : 0;
    let grandTotalAmt = subtotalAmt > 0 ? (subtotalAmt + deliveryFee + serviceFee) : 0;

    // Synchronizing standard badges fields mapping text contents
    if (cartItemCount) cartItemCount.textContent = totalItems;
    if (cartTotalPrice) cartTotalPrice.textContent = 'Tk ' + subtotalAmt;
    if (fpStickyTotal) fpStickyTotal.textContent = 'Tk ' + grandTotalAmt;
    if (chkSubtotal) chkSubtotal.textContent = 'Tk ' + subtotalAmt;
    if (chkFinalTotal) chkFinalTotal.textContent = 'Tk ' + grandTotalAmt;

    // Display state tracker loop checker for floating bottom bar triggers
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        if (cart.length === 0) {
            floatingCart.classList.add('hidden');
        } else {
            floatingCart.classList.remove('hidden');
        }
    }

    // A. Inject Layout Inside Sidebar Basket Frame (Matches image_c51776.png)
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div style="text-align:center; padding:40px 10px; color:#aaa;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px; color:#e0e0e0;"></i>
                    <p style="font-size:14px; font-weight:600;">Your basket is empty</p>
                </div>`;
        } else {
            let itemsHtml = '';
            cart.forEach((item, idx) => {
                let variantText = item.variant ? `<p class="fp-variant-label" style="margin:2px 0 0; font-size:12px; color:#707070;">${item.variant}</p>` : '';
                itemsHtml += `
                    <div class="fp-cart-item-row" style="display:flex; gap:12px; margin-bottom:16px; align-items:flex-start; padding-bottom:12px; border-bottom:1px solid #f5f5f5;">
                        <img src="${item.image}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                        <div style="flex:1;">
                            <div style="font-weight:600; font-size:15px; color:#333;">${item.name}</div>
                            ${variantText}
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                                <span style="font-weight:700; color:#222;">Tk ${item.price * item.qty}</span>
                                <div class="fp-qty-pill" style="display:flex; align-items:center; background:#f7f7f7; border:1px solid #ddd; border-radius:20px; overflow:hidden;">
                                    <button type="button" onclick="adjustQtyByIndex(${idx}, -1)" style="background:none; border:none; width:28px; height:28px; font-size:12px; cursor:pointer;">
                                        ${item.qty === 1 ? '<i class="fa-regular fa-trash-can" style="color:#777;"></i>' : '<i class="fa-solid fa-minus"></i>'}
                                    </button>
                                    <span style="padding:0 8px; font-weight:600; font-size:13px;">${item.qty}</span>
                                    <button type="button" onclick="adjustQtyByIndex(${idx}, 1)" style="background:none; border:none; width:28px; height:28px; font-size:12px; cursor:pointer; color:#e21b70;"><i class="fa-solid fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            cartItemsContainer.innerHTML = itemsHtml;
        }
    }

    // B. Inject Layout Inside Full Screen Order Summary Grid View (Matches image_c51773.png)
    if (checkoutItemsList) {
        let chkHtml = '';
        cart.forEach(item => {
            let labelTitle = item.variant ? `${item.name} (${item.variant})` : item.name;
            chkHtml += `
                <div class="chk-single-item" style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:15px;">
                    <span><strong style="color:#e21b70; margin-right:8px;">${item.qty}x</strong> ${labelTitle}</span>
                    <span style="font-weight:600; color:#333;">Tk ${item.price * item.qty}</span>
                </div>`;
        });
        checkoutItemsList.innerHTML = chkHtml || '<p style="color:#aaa; text-align:center;">No items added yet</p>';
    }
}

// ==================== Quantity Adjustment Sub-routine Matrix ====================
function adjustQtyByIndex(index, factor) {
    if (index > -1 && index < cart.length) {
        cart[index].qty += factor;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        renderCartData();
        syncCardButtons();
    }
}

// ==================== Direct Fast Addon Buttons Handler Injection ====================
function addDirectAddon(name, price) {
    let existingAddon = cart.find(item => item.name === name);
    if (existingAddon) {
        existingAddon.qty += 1;
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: name,
            price: parseInt(price),
            qty: 1,
            variant: null,
            image: ''
        });
    }
    showToast(`🎉 Added Add-on: ${name}`);
    renderCartData();
    syncCardButtons();
}

// ==================== Menu Grid Quantities Sync Helper ====================
function syncCardButtons() {
    // Apnar page-er grid card indicators control tracking loop sync system
    // Eita menu grid section selector state refresh rakhe dashboard update er shomoy
    console.log("Cart contents current layout synced safely.");
}

// ==================== View Panel Toggles Actions (Modals Frameworks) ====================
function openFpSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.style.right = "0px";
    if (overlay) overlay.style.display = "block";
    renderCartData();
}

function closeFpSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.style.right = "-450px";
    if (overlay) overlay.style.display = "none";
}

// Shortcut wrapper link mappings inside core docx template configuration logic
function closeCartPanel() {
    closeFpSidebar();
}

function openFullCheckout() {
    if (cart.length === 0) {
        showToast("⚠️ Add items to your basket before checking out!");
        return;
    }
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) {
        checkoutPage.style.display = "block";
        closeFpSidebar();
        renderCartData();
    }
}

function closeFullCheckout() {
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) {
        checkoutPage.style.display = "none";
    }
}

// ==================== Payment Selector Actions Controller ====================
let activePaymentMethod = 'cod';
function selectFpPayment(method, element) {
    activePaymentMethod = method;
    document.querySelectorAll('.delivery-option-card, .fp-pay-card').forEach(card => {
        card.classList.remove('active-opt', 'active');
    });
    if (element) {
        element.classList.add('active-opt');
    }
    
    // Docx mobile validation display layout field handler rules bindings
    const walletWrapper = document.getElementById('fp-walletPaymentFields');
    if (walletWrapper) {
        if (method === 'bkash' || method === 'nagad' || method === 'rocket') {
            walletWrapper.style.display = 'block';
        } else {
            walletWrapper.style.display = 'none';
        }
    }
}

// ==================== Submit Order Checkout Verification (Docx Framework Output) ====================
function submitFinalOrder() {
    if (cart.length === 0) return;
    
    const streetInput = document.getElementById('chk-street');
    if (streetInput && !streetInput.value.trim()) {
        showToast("⚠️ Missing street/house number specification configuration fields!");
        streetInput.focus();
        return;
    }

    // Success state controller initialization bindings matching docx endpoints
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'flex';
        successModal.classList.add('active');
    } else {
        alert("🎉 Order Placed Successfully!");
    }

    // Resetting cart metrics back state references
    cart = [];
    renderCartData();
    syncCardButtons();

    // Cleaning form element structures safely completely matching your docx configurations
    const nameFld = document.getElementById('fp-custName'); if(nameFld) nameFld.value = '';
    const phoneFld = document.getElementById('fp-custPhone'); if(phoneFld) phoneFld.value = '';
    const addrFld = document.getElementById('fp-custAddress'); if(addrFld) addrFld.value = '';
    const walletNumInput = document.getElementById('fp-walletNumber'); if (walletNumInput) walletNumInput.value = '';
    
    const codCardBtn = document.querySelector('.fp-pay-card');
    if (codCardBtn) selectFpPayment('cod', codCardBtn);
}

function closeOrderSuccess() {
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'none';
        successModal.classList.remove('active');
    }
    closeFullCheckout();
}

// ==================== Global Centered Live Alert Notification Engine ====================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) {
        console.log("Toast notification target missed node placeholder:", message);
        return;
    }
    toast.textContent = message;
    toast.classList.add('show-alert');
    setTimeout(() => {
        toast.classList.remove('show-alert');
    }, 2500);
}

// Keyboard interactions listener mappings for quick dynamic escape keys closes
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
