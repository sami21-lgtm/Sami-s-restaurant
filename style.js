// ==================== Global Array ====================
let cart = []; 

// ==================== 1. Clean Add To Cart Engine ====================
function addToCart(btnElement, itemName) {
    let price = 0;
    let image = '';

    // Docx html theke auto price ar image track korar code
    try {
        let parentCard = btnElement.closest('.menu-card') || btnElement.closest('.card') || btnElement.parentElement.parentElement;
        if(parentCard) {
            let cardText = parentCard.innerText;
            let priceMatch = cardText.match(/Tk\s*(\d+)/i) || cardText.match(/৳\s*(\d+)/i);
            if(priceMatch) price = parseInt(priceMatch[1]);
            
            let imgTag = parentCard.parentElement.querySelector('img') || parentCard.querySelector('img');
            if(imgTag) image = imgTag.src;
        }
    } catch(e) {
        console.log("Card HTML match failed.");
    }

    // Add to Array
    let existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: itemName,
            price: price || 0,
            qty: 1,
            image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'
        });
    }

    // Update Floating Cart Visibility
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.remove('hidden');
        floatingCart.style.setProperty('display', 'flex', 'important');
    }

    renderCartData();
    // Foodpanda-r moto automatically sidebar open korte chaile nicher line-ta un-comment korben
    // openFpSidebar(); 
}

// Global Quantity handler (For Sidebar & Checkout only)
function updateMenuQty(name, change) {
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += change;
        if (existingItem.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    
    // Check auto-hiding floating basket
    if(cart.length === 0) {
        const floatingCart = document.getElementById('floating-cart');
        if(floatingCart) floatingCart.style.setProperty('display', 'none', 'important');
    }
    
    renderCartData();
}

// ==================== 2. UI Display Rendering (Sidebar & Checkout) ====================
function renderCartData() {
    const cartItemsContainer = document.getElementById('fp-cart-items-container');
    const checkoutItemsList = document.getElementById('checkout-items-list');
    
    const cartItemCount = document.getElementById('cart-item-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const fpStickyTotal = document.getElementById('fp-sticky-total');
    
    const chkSubtotal = document.getElementById('chk-subtotal');
    const chkFinalTotal = document.getElementById('chk-final-total');

    let totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    let subtotalAmt = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let grandTotalAmt = subtotalAmt > 0 ? (subtotalAmt + 32 + 19) : 0;

    if (cartItemCount) cartItemCount.textContent = totalItems;
    if (cartTotalPrice) cartTotalPrice.textContent = 'Tk ' + subtotalAmt;
    if (fpStickyTotal) fpStickyTotal.textContent = 'Tk ' + grandTotalAmt;
    if (chkSubtotal) chkSubtotal.textContent = 'Tk ' + subtotalAmt;
    if (chkFinalTotal) chkFinalTotal.textContent = 'Tk ' + grandTotalAmt;

    // Sidebar Items Compile
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div style="text-align:center; padding:30px; color:#aaa;">Your basket is empty</div>`;
        } else {
            let itemsHtml = '';
            cart.forEach((item) => {
                itemsHtml += `
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                        <div>
                            <div style="font-weight:600;">${item.name}</div>
                            <div style="color:#e21b70; font-weight:bold; margin-top:5px;">Tk ${item.price * item.qty}</div>
                        </div>
                        <div style="display:flex; align-items:center; background:#f5f5f5; border-radius:20px; padding:2px 5px; height:32px;">
                            <button onclick="updateMenuQty('${item.name}', -1)" style="border:none; background:none; cursor:pointer; width:24px;">-</button>
                            <span style="padding:0 5px; font-weight:bold; font-size:13px;">${item.qty}</span>
                            <button onclick="updateMenuQty('${item.name}', 1)" style="border:none; background:none; cursor:pointer; color:#e21b70; width:24px;">+</button>
                        </div>
                    </div>`;
            });
            cartItemsContainer.innerHTML = itemsHtml;
        }
    }

    // Checkout Items Compile
    if (checkoutItemsList) {
        let chkHtml = '';
        cart.forEach(item => {
            chkHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span><strong style="color:#e21b70;">${item.qty}x</strong> ${item.name}</span>
                <strong>Tk ${item.price * item.qty}</strong>
            </div>`;
        });
        checkoutItemsList.innerHTML = chkHtml || '<p>No items added yet</p>';
    }
}

// ==================== 3. Modals & Sidebars ====================
function openFpSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.style.setProperty('right', '0px', 'important');
    if (overlay) overlay.style.setProperty('display', 'block', 'important');
    renderCartData();
}

function closeFpSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.style.setProperty('right', '-450px', 'important');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
}

function openFullCheckout() {
    if (cart.length === 0) return;
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) {
        checkoutPage.style.setProperty('display', 'block', 'important');
        closeFpSidebar();
        renderCartData();
    }
}

function closeFullCheckout() {
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) checkoutPage.style.setProperty('display', 'none', 'important');
}

function selectFpPayment(method, element) {
    document.querySelectorAll('.fp-pay-card').forEach(card => card.classList.remove('active-opt'));
    if (element) element.classList.add('active-opt');
    const walletWrapper = document.getElementById('fp-walletPaymentFields');
    if (walletWrapper) walletWrapper.style.display = (method !== 'cod') ? 'block' : 'none';
}

function submitFinalOrder() {
    if (cart.length === 0) return;
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.setProperty('display', 'flex', 'important');
    } else {
        alert("🎉 Order Placed Successfully!");
    }
    cart = [];
    renderCartData();
}

function closeOrderSuccess() {
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) successModal.style.setProperty('display', 'none', 'important');
    closeFullCheckout();
}

document.addEventListener('DOMContentLoaded', function() {
    renderCartData();
});
