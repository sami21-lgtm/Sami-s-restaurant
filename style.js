// developed by Md. Emtiaz Hossain Sami 2026

let cart = [];

function addFoodToCart(name, price) {
    price = parseInt(price);
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) { 
        existingItem.qty += 1; 
    } else { 
        cart.push({ name: name, price: price, qty: 1 }); 
    }
    
    syncCardButtons();
    renderCartData();
    
    // Add তে ক্লিক করলে নিচে কার্ট বার ভেসে উঠবে এবং সাথে সাথে সাইডবার ওপেন হবে
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.remove('hidden');
    }
    openFpSidebar();
    
    showToast(`${name} added to cart!`);
}

function updateCardItemQty(name, factor) {
    let index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart[index].qty += factor;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    syncCardButtons();
    renderCartData();
}

function updateSidebarQty(name, factor) {
    updateCardItemQty(name, factor);
}

function deleteCartItem(name) {
    let index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart.splice(index, 1);
    }
    syncCardButtons();
    renderCartData();
    showToast(`${name} removed from basket`);
}

function syncCardButtons() {
    document.querySelectorAll('.fp-card-action-wrapper').forEach(wrapper => {
        const itemName = wrapper.getAttribute('data-name');
        const addBtn = wrapper.querySelector('.fp-card-add-btn');
        const qtyControl = wrapper.querySelector('.fp-card-qty-control');
        const qtyDisplay = wrapper.querySelector('.fp-card-qty-display');
        
        const cartItem = cart.find(item => item.name === itemName);
        
        if (cartItem) {
            if (addBtn) addBtn.style.display = 'none';
            if (qtyControl) qtyControl.style.display = 'flex';
            if (qtyDisplay) qtyDisplay.textContent = cartItem.qty;
        } else {
            if (addBtn) addBtn.style.display = 'block';
            if (qtyControl) qtyControl.style.display = 'none';
        }
    });
}

function renderCartData() {
    const cartContainer = document.getElementById('fp-cart-items-container');
    const checkoutList = document.getElementById('checkout-items-list');
    const floatingCount = document.getElementById('cart-item-count');
    const floatingPrice = document.getElementById('cart-total-price');
    const checkoutSubtotal = document.getElementById('chk-subtotal');
    const checkoutTotal = document.getElementById('chk-final-total');
    const sidebarStickyTotal = document.getElementById('fp-sticky-total');
    const floatingBar = document.getElementById('floating-cart');

    let totalQty = 0, totalPrice = 0;
    if (cartContainer) cartContainer.innerHTML = '';
    if (checkoutList) checkoutList.innerHTML = '';

    if (cart.length === 0) {
        if (cartContainer) cartContainer.innerHTML = '<div style="text-align:center; padding: 50px 20px;"><i class="fa-solid fa-basket-shopping" style="font-size:40px; color:#ddd; margin-bottom:15px;"></i><p style="color:#777; font-weight:bold;">Your basket is empty</p></div>';
        if (floatingBar) floatingBar.classList.add('hidden');
        closeFpSidebar();
    } else {
        if (floatingBar) floatingBar.classList.remove('hidden');
        cart.forEach(item => {
            totalQty += item.qty;
            let itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            if (cartContainer) {
                cartContainer.innerHTML += `
                    <div class="sidebar-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:15px 0;">
                        <div style="flex:1">
                            <strong style="display:block; margin-bottom:8px; font-size:14px; color:#333;">${item.name}</strong>
                            <div class="fp-card-qty-control" style="display:flex; height:30px; width:fit-content; align-items:center;">
                                <button class="fp-card-qty-btn minus" style="width:28px; font-size:16px; cursor:pointer;" onclick="updateSidebarQty('${item.name}', -1)">-</button>
                                <span class="fp-card-qty-display" style="width:34px; text-align:center; font-size:14px; line-height:24px; font-weight:600;">${item.qty}</span>
                                <button class="fp-card-qty-btn plus" style="width:28px; font-size:16px; cursor:pointer;" onclick="updateSidebarQty('${item.name}', 1)">+</button>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <strong style="font-size:14px; color:#222;">৳ ${itemTotal}</strong>
                            <button class="cart-delete-btn" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:16px; padding:4px;" onclick="deleteCartItem('${item.name}')" title="Remove item">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>`;
            }
            
            if (checkoutList) {
                checkoutList.innerHTML += `
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; color:#333;">
                        <span style="font-weight:600;">${item.qty}x <span style="font-weight:normal; margin-left:5px;">${item.name}</span></span>
                        <span style="font-weight:600;">৳ ${itemTotal}</span>
                    </div>`;
            }
        });
    }
    
    // Foodpanda Style Bill Calculation
    let deliveryFee = 32;
    let platformFeeAndVat = 19;
    let finalCheckoutTotal = totalPrice > 0 ? (totalPrice + deliveryFee + platformFeeAndVat) : 0; 
    
    if (floatingCount) floatingCount.textContent = totalQty;
    if (floatingPrice) floatingPrice.textContent = `Tk ${totalPrice}`;
    if (checkoutSubtotal) checkoutSubtotal.textContent = `Tk ${totalPrice}`;
    if (checkoutTotal) checkoutTotal.textContent = `Tk ${finalCheckoutTotal}`;
    if (sidebarStickyTotal) sidebarStickyTotal.textContent = `Tk ${totalPrice}`;
}

function openFpSidebar() { 
    if(cart.length === 0) return;
    const overlay = document.getElementById('fp-sidebar-overlay');
    const sidebar = document.getElementById('fp-sidebar');
    if (overlay) overlay.style.display = 'block'; 
    if (sidebar) sidebar.style.right = '0'; 
}

function closeFpSidebar() { 
    const overlay = document.getElementById('fp-sidebar-overlay');
    const sidebar = document.getElementById('fp-sidebar');
    if (overlay) overlay.style.display = 'none'; 
    if (sidebar) sidebar.style.right = '-450px'; 
}

function openFullCheckout() {
    if (cart.length === 0) return;
    closeFpSidebar();
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) checkoutPage.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const checkoutContent = document.querySelector('.checkout-content');
    if (checkoutContent) checkoutContent.style.display = 'block';
    const successView = document.getElementById('checkout-success-view');
    if (successView) successView.style.display = 'none';
}

function closeFullCheckout() { 
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) checkoutPage.style.display = 'none'; 
    document.body.style.overflow = 'auto'; 
}

function submitFinalOrder() {
    const name = document.getElementById('fp-custName').value.trim();
    const phone = document.getElementById('fp-custPhone').value.trim();
    const address = document.getElementById('fp-custAddress').value.trim();

    if (!name || !phone || !address) {
        showToast("Please fill all delivery details!"); 
        return;
    }
    
    const successView = document.getElementById('checkout-success-view');
    if (successView) successView.style.display = 'flex';
}

function resetToHome() {
    cart = [];
    renderCartData(); 
    syncCardButtons(); 
    closeFullCheckout();
    
    document.getElementById('fp-custName').value = '';
    document.getElementById('fp-custPhone').value = '';
    document.getElementById('fp-custAddress').value = '';
    
    const successView = document.getElementById('checkout-success-view');
    if (successView) successView.style.display = 'none';
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message; 
    toast.style.display = 'block';
    toast.style.cssText = `position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:12px 24px; border-radius:8px; z-index:9999; font-size:14px; font-weight:bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3);`;
    setTimeout(() => toast.style.display = 'none', 2500);
}

document.addEventListener('DOMContentLoaded', () => { 
    syncCardButtons(); 
    renderCartData(); 
});
