// developed by Md. Emtiaz Hossain Sami 2026

let cart = [];

// Add Item Function (Foodpanda Style) - নাম ঠিক করা হয়েছে
function addToCart(name, price) {
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

// Sidebar er Addon er jonno
function addDirectAddon(name, price) {
    addToCart(name, price);
}

// Update Qty (+/-) from Menu Card
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

// Update Qty (+/-) from Sidebar
function updateSidebarQty(name, factor) {
    updateCardItemQty(name, factor);
}

// Dropdown theke price change korar jonno
function updateDynamicPricing(selectElement) {
    const price = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    if(!cardBody) return;

    const priceDisplay = cardBody.querySelector('.dynamic-render-price');
    const actionWrapper = cardBody.querySelector('.fp-card-action-wrapper');
    
    if(priceDisplay) priceDisplay.textContent = ` ৳ ${price}`;
    if(actionWrapper) {
        actionWrapper.dataset.price = price;
        const name = actionWrapper.dataset.name;
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) { 
            existingItem.price = parseInt(price); 
            renderCartData(); 
        }
    }
}

// UI Sync for Add Buttons vs Qty Control
function syncCardButtons() {
    document.querySelectorAll('.fp-card-action-wrapper').forEach(wrapper => {
        const itemName = wrapper.getAttribute('data-name');
        const addBtn = wrapper.querySelector('.fp-card-add-btn');
        const qtyControl = wrapper.querySelector('.fp-card-qty-control');
        const qtyDisplay = wrapper.querySelector('.fp-card-qty-display');
        
        const cartItem = cart.find(item => item.name === itemName);
        
        if (cartItem) {
            if(addBtn) addBtn.style.display = 'none';
            if(qtyControl) qtyControl.style.display = 'flex';
            if(qtyDisplay) qtyDisplay.textContent = cartItem.qty;
        } else {
            if(addBtn) addBtn.style.display = 'block';
            if(qtyControl) qtyControl.style.display = 'none';
        }
    });
}

// Cart Data Renderer (Sidebar, Checkout & Floating bar er jonno)
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
    if(cartContainer) cartContainer.innerHTML = '';
    if(checkoutList) checkoutList.innerHTML = '';

    if (cart.length === 0) {
        if(cartContainer) cartContainer.innerHTML = '<p style="text-align:center; color:#777; padding:30px 0;">Your basket is empty</p>';
        if(floatingBar) floatingBar.classList.add('hidden');
    } else {
        if(floatingBar) floatingBar.classList.remove('hidden');
        cart.forEach(item => {
            totalQty += item.qty;
            let itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            if(cartContainer) {
                cartContainer.innerHTML += `
                <div class="sidebar-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:10px 0;">
                    <div style="flex:1">
                        <strong style="display:block; margin-bottom:8px; font-size:14px;">${item.name}</strong>
                        <div class="fp-card-qty-control" style="display:flex; height:30px; width:fit-content;">
                            <button class="fp-card-qty-btn minus" style="width:28px; font-size:16px;" onclick="updateSidebarQty('${item.name}', -1)">-</button>
                            <span class="fp-card-qty-display" style="width:28px; text-align:center; font-size:14px; line-height:24px;">${item.qty}</span>
                            <button class="fp-card-qty-btn plus" style="width:28px; font-size:16px;" onclick="updateSidebarQty('${item.name}', 1)">+</button>
                        </div>
                    </div>
                    <strong style="margin-left:15px; font-size:14px; color:#222;">৳ ${itemTotal}</strong>
                </div>`;
            }
            
            if(checkoutList) {
                checkoutList.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;">
                    <span>${item.qty}x ${item.name}</span>
                    <span>৳ ${itemTotal}</span>
                </div>`;
            }
        });
    }
    
    let finalCheckoutTotal = totalPrice + 32 + 19; 
    
    if(floatingCount) floatingCount.textContent = totalQty;
    if(floatingPrice) floatingPrice.textContent = `Tk ${totalPrice}`;
    if(checkoutSubtotal) checkoutSubtotal.textContent = `Tk ${totalPrice}`;
    if(checkoutTotal) checkoutTotal.textContent = `Tk ${finalCheckoutTotal}`;
    if(sidebarStickyTotal) sidebarStickyTotal.textContent = `Tk ${totalPrice}`;
}

// Sidebar Open/Close
function openFpSidebar() { 
    const overlay = document.getElementById('fp-sidebar-overlay');
    const sidebar = document.getElementById('fp-sidebar');
    if(overlay) overlay.style.display = 'block'; 
    if(sidebar) sidebar.style.right = '0'; 
}

function closeFpSidebar() { 
    const overlay = document.getElementById('fp-sidebar-overlay');
    const sidebar = document.getElementById('fp-sidebar');
    if(overlay) overlay.style.display = 'none'; 
    if(sidebar) sidebar.style.right = '-450px'; 
}

// Checkout Open/Close
function openFullCheckout() {
    if(cart.length === 0) return;
    closeFpSidebar();
    const checkoutPage = document.getElementById('full-checkout-page');
    if(checkoutPage) checkoutPage.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const checkoutContent = document.querySelector('.checkout-content');
    if(checkoutContent) checkoutContent.style.display = 'block';
    const successView = document.getElementById('checkout-success-view');
    if(successView) successView.style.display = 'none';
}

function closeFullCheckout() { 
    const checkoutPage = document.getElementById('full-checkout-page');
    if(checkoutPage) checkoutPage.style.display = 'none'; 
    document.body.style.overflow = 'auto'; 
}

function submitFinalOrder(event) {
    if(event) event.preventDefault();
    const nameInput = document.getElementById('fp-custName');
    const phoneInput = document.getElementById('fp-custPhone');
    const addressInput = document.getElementById('fp-custAddress');

    if(!nameInput?.value.trim() || !phoneInput?.value.trim() || !addressInput?.value.trim()) {
        showToast("Please fill all delivery details!"); 
        return;
    }
    
    // সাইডবার বন্ধ করা হচ্ছে
    closeFpSidebar();
    
    // সাকসেস স্ক্রিন দেখানো হচ্ছে
    const successView = document.getElementById('checkout-success-view');
    const checkoutContent = document.querySelector('.checkout-content');
    
    if(checkoutContent) checkoutContent.style.display = 'none';
    if(successView) successView.style.display = 'flex';
}

function resetToHome() {
    cart = [];
    renderCartData(); 
    syncCardButtons(); 
    closeFullCheckout();
    const streetInput = document.getElementById('chk-street');
    if(streetInput) streetInput.value = '';
    window.location.href = '#menu';
}

// Menu Filter
function filterMenu(category) {
    document.querySelectorAll('.filter-tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
    document.querySelectorAll('.product-item-card').forEach(card => {
        card.style.display = (category === 'all' || card.classList.contains(category)) ? 'flex' : 'none';
    });
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if(!toast) return;
    toast.textContent = message; 
    toast.style.display = 'block';
    toast.style.cssText = `position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:8px; z-index:9999; font-size:14px; display:block; box-shadow: 0 4px 10px rgba(0,0,0,0.2);`;
    setTimeout(() => toast.style.display = 'none', 2000);
}

// Page load hole default render
document.addEventListener('DOMContentLoaded', () => { 
    syncCardButtons(); 
    renderCartData(); 
});
