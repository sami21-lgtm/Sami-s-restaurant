// developed by Md. Emtiaz Hossain Sami 2026

// গ্লোবাল কার্ট অ্যারে
let cart = [];

// ১. কার্টে খাবার যোগ করার মেইন ফাংশন
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
    
    // আইটেম অ্যাড করার সাথে সাথে ফ্লোটিং বার শো করবে এবং সাইডবার ওপেন হবে
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.remove('hidden');
    }
    openFpSidebar();
    
    showToast(`${name} added to cart!`);
}

// ২. মেইন মেনু কার্ড থেকে সরাসরি পরিমাপ (+/-) পরিবর্তন
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

// ৩. সাইডবার কার্ট থেকে পরিমাপ (+/-) পরিবর্তন
function updateSidebarQty(name, factor) {
    updateCardItemQty(name, factor);
}

// ৪. কার্ট থেকে সম্পূর্ণ আইটেم ট্র্যাশ ক্যান দিয়ে ডিলিট করা
function deleteCartItem(name) {
    let index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        cart.splice(index, 1);
    }
    syncCardButtons();
    renderCartData();
    showToast(`${name} removed from basket`);
}

// ৫. ড্রপডাউন ভেরিয়েন্ট পরিবর্তন হলে প্রাইস আপডেট করার ফাংশন
function updateDynamicPricing(selectElement) {
    const price = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    if (!cardBody) return;
    
    const priceDisplay = cardBody.querySelector('.dynamic-render-price');
    const actionWrapper = cardBody.querySelector('.fp-card-action-wrapper');
    
    if (priceDisplay) priceDisplay.textContent = ` ৳ ${price}`;
    if (actionWrapper) {
        actionWrapper.dataset.price = price;
        const name = actionWrapper.dataset.name;
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) { 
            existingItem.price = parseInt(price); 
            renderCartData(); 
        }
    }
}

// ৬. মেনু কার্ডের 'Add' বাটন এবং '+ / -' কন্ট্রোলারের মধ্যে UI সিঙ্ক করা
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

// ৭. কার্টের ডেটা রেন্ডার এবং ফুডপান্ডা স্টাইল বিলিং ক্যালকুলেশন
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
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div style="text-align:center; padding: 50px 20px;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:40px; color:#ddd; margin-bottom:15px;"></i>
                    <p style="color:#777; font-weight:bold;">Your basket is empty</p>
                </div>`;
        }
        if (floatingBar) floatingBar.classList.add('hidden');
        closeFpSidebar();
    } else {
        if (floatingBar) floatingBar.classList.remove('hidden');
        
        cart.forEach(item => {
            totalQty += item.qty;
            let itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            // সাইডবারে আইটেম রেন্ডার
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
            
            // ফুল স্ক্রিন চেকআউট লিস্টে আইটেম রেন্ডার
            if (checkoutList) {
                checkoutList.innerHTML += `
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; color:#333;">
                        <span style="font-weight:600;">${item.qty}x <span style="font-weight:normal; margin-left:5px;">${item.name}</span></span>
                        <span style="font-weight:600;">৳ ${itemTotal}</span>
                    </div>`;
            }
        });
    }
    
    // ফুডপান্ডা কনস্ট্যান্ট ফি সমূহ
    let deliveryFee = 32;
    let platformFeeAndVat = 19;
    let finalCheckoutTotal = totalPrice > 0 ? (totalPrice + deliveryFee + platformFeeAndVat) : 0; 
    
    // UI অবজেক্টস আপডেট
    if (floatingCount) floatingCount.textContent = totalQty;
    if (floatingPrice) floatingPrice.textContent = ` ৳ ${totalPrice}`;
    if (checkoutSubtotal) checkoutSubtotal.textContent = ` ৳ ${totalPrice}`;
    if (checkoutTotal) checkoutTotal.textContent = ` ৳ ${finalCheckoutTotal}`;
    if (sidebarStickyTotal) sidebarStickyTotal.textContent = ` ৳ ${totalPrice}`;
}

// ৮. সাইডবার ওপেন/ক্লোজ কন্ট্রোল
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

// ৯. ফুল স্ক্রিন চেকআউট পেজ ওপেন/ক্লোজ
function openFullCheckout() {
    if (cart.length === 0) return;
    closeFpSidebar();
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) checkoutPage.style.display = 'block';
    document.body.style.overflow = 'hidden'; // মেইন বডির স্ক্রল লক করার জন্য
    
    const checkoutContent = document.querySelector('.checkout-content');
    if (checkoutContent) checkoutContent.style.display = 'block';
    const successView = document.getElementById('checkout-success-view');
    if (successView) successView.style.display = 'none';
}

function closeFullCheckout() { 
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) checkoutPage.style.display = 'none'; 
    document.body.style.overflow = 'auto'; // স্ক্রল নরমাল করা
}

// ১০. ফাইনাল অর্ডার সাবমিট এবং ভ্যালিডেশন
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

// ১১. অর্ডার সাকসেস হওয়ার পর সবকিছু রিসেট করে হোমে ফিরে যাওয়া
function resetToHome() {
    cart = [];
    renderCartData(); 
    syncCardButtons(); 
    closeFullCheckout();
    
    // ফর্মের ইনপুট ফিল্ড খালি করা
    document.getElementById('fp-custName').value = '';
    document.getElementById('fp-custPhone').value = '';
    document.getElementById('fp-custAddress').value = '';
    
    const successView = document.getElementById('checkout-success-view');
    if (successView) successView.style.display = 'none';
}

// ১২. মেনু ক্যাটাগরি ফিল্টার ফাংশন
function filterMenu(category) {
    document.querySelectorAll('.filter-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    document.querySelectorAll('.product-item-card').forEach(card => {
        card.style.display = (category === 'all' || card.classList.contains(category)) ? 'flex' : 'none';
    });
}

// ১৩. শেফ ইমেজ প্রিভিউ ম্যানেজার
function previewChefImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => document.getElementById('chef-vera-img').src = e.target.result;
        reader.readAsDataURL(input.files[0]);
    }
}

// ১৪. কাস্টম টোস্ট নোটিফিকেশন সিস্টেম
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message; 
    toast.style.display = 'block';
    toast.style.cssText = `position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:12px 24px; border-radius:8px; z-index:9999; font-size:14px; font-weight:bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3);`;
    setTimeout(() => toast.style.display = 'none', 2500);
}

// ১৫. DOM পুরোপুরি লোড হলে প্রাথমিক স্টেট রান করা
document.addEventListener('DOMContentLoaded', () => { 
    syncCardButtons(); 
    renderCartData(); 
});
