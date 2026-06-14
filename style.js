let cart = [];

function addFoodToCart(name, price) {
    price = parseInt(price);
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    renderMenuButtons();
    renderCart();
    showToast(`${name} added to cart!`);
}

function updateCardItemQty(name, delta) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += delta;
        if (existingItem.qty <= 0) cart = cart.filter(item => item.name !== name);
    }
    renderMenuButtons();
    renderCart();
}

// সাইডবার এবং চেকআউট পেজ থেকে কাউন্টার আপডেট করার ফাংশন
function updateSidebarQty(name, delta) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += delta;
        if (existingItem.qty <= 0) cart = cart.filter(item => item.name !== name);
    }
    renderMenuButtons();
    renderCart();
}

function updateDynamicPricing(selectElement) {
    const price = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    const priceDisplay = cardBody.querySelector('.dynamic-render-price');
    const actionWrapper = cardBody.querySelector('.fp-action-wrapper');
    
    priceDisplay.textContent = `৳ ${price}`;
    actionWrapper.dataset.price = price;
    
    const name = actionWrapper.dataset.name;
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.price = parseInt(price);
        renderCart();
    }
}

function renderMenuButtons() {
    document.querySelectorAll('.fp-action-wrapper').forEach(wrapper => {
        const name = wrapper.dataset.name;
        const itemInCart = cart.find(item => item.name === name);
        const addBtn = wrapper.querySelector('.fp-add-btn');
        const qtyStepper = wrapper.querySelector('.fp-qty-stepper');
        const qtyVal = wrapper.querySelector('.fp-qty-val');

        if (itemInCart) {
            addBtn.style.display = 'none';
            qtyStepper.style.display = 'flex';
            qtyVal.textContent = itemInCart.qty;
        } else {
            addBtn.style.display = 'block';
            qtyStepper.style.display = 'none';
        }
    });
}

function renderCart() {
    const cartContainer = document.getElementById('fp-cart-items-container');
    const checkoutList = document.getElementById('checkout-items-list');
    const floatingCount = document.getElementById('cart-item-count');
    const floatingPrice = document.getElementById('cart-total-price');
    const checkoutTotal = document.getElementById('chk-final-total');
    const floatingBar = document.getElementById('floating-cart');

    let totalQty = 0, totalPrice = 0;
    cartContainer.innerHTML = '';
    checkoutList.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#777; padding:30px 0;">Your basket is empty</p>';
        floatingBar.classList.add('hidden');
    } else {
        floatingBar.classList.remove('hidden');
        cart.forEach(item => {
            totalQty += item.qty;
            let itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            // Sidebar Cart Item HTML (নিচে + - বাটন যুক্ত করা হয়েছে)
            cartContainer.innerHTML += `
                <div class="sidebar-item">
                    <div style="flex:1">
                        <strong style="display:block; margin-bottom:8px; font-size:14px;">${item.name}</strong>
                        <div class="fp-qty-stepper" style="display:flex; height:30px; width:fit-content;">
                            <button class="fp-qty-btn minus" style="width:28px; font-size:16px;" onclick="updateSidebarQty('${item.name}', -1)">−</button>
                            <span class="fp-qty-val" style="width:28px; font-size:14px;">${item.qty}</span>
                            <button class="fp-qty-btn plus" style="width:28px; font-size:16px;" onclick="updateSidebarQty('${item.name}', 1)">+</button>
                        </div>
                    </div>
                    <strong style="margin-left:15px; font-size:14px; color:#222;">৳ ${itemTotal}</strong>
                </div>`;
            
            // Checkout Order Summary Item HTML (এখানেও + - বাটন যুক্ত করা হয়েছে)
            checkoutList.innerHTML += `
                <div class="chk-item-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #f0f0f0; padding-bottom:10px;">
                    <div style="flex:1">
                        <strong style="display:block; margin-bottom:8px; font-size:14px;">${item.name}</strong>
                        <div class="fp-qty-stepper" style="display:flex; height:30px; width:fit-content;">
                            <button class="fp-qty-btn minus" style="width:28px; font-size:16px;" onclick="updateSidebarQty('${item.name}', -1)">−</button>
                            <span class="fp-qty-val" style="width:28px; font-size:14px;">${item.qty}</span>
                            <button class="fp-qty-btn plus" style="width:28px; font-size:16px;" onclick="updateSidebarQty('${item.name}', 1)">+</button>
                        </div>
                    </div>
                    <strong style="font-size:14px; color:#222;">৳ ${itemTotal}</strong>
                </div>`;
        });
    }
    floatingCount.textContent = totalQty;
    floatingPrice.textContent = `৳ ${totalPrice}`;
    checkoutTotal.textContent = `৳ ${totalPrice}`;
}

function openFpSidebar() { document.getElementById('fp-sidebar-overlay').style.display = 'block'; document.getElementById('fp-sidebar').style.right = '0'; }
function closeFpSidebar() { document.getElementById('fp-sidebar-overlay').style.display = 'none'; document.getElementById('fp-sidebar').style.right = '-420px'; }

function openFullCheckout() {
    if(cart.length === 0) return;
    closeFpSidebar();
    document.getElementById('full-checkout-page').style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementById('checkout-form-view').style.display = 'block';
    document.getElementById('checkout-success-view').style.display = 'none';
}
function closeFullCheckout() { document.getElementById('full-checkout-page').style.display = 'none'; document.body.style.overflow = 'auto'; }

function submitFinalOrder() {
    if(!document.getElementById('chk-name').value || !document.getElementById('chk-phone').value || !document.getElementById('chk-address').value) {
        showToast("Please fill all delivery details!"); return;
    }
    document.getElementById('checkout-form-view').style.display = 'none';
    document.getElementById('checkout-success-view').style.display = 'flex';
}

function resetToHome() {
    cart = [];
    renderCart(); renderMenuButtons(); closeFullCheckout();
    document.getElementById('chk-name').value = ''; document.getElementById('chk-phone').value = ''; document.getElementById('chk-address').value = '';
    window.location.href = '#menu';
}

function filterMenu(category) {
    document.querySelectorAll('.filter-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.product-item-card').forEach(card => {
        card.style.display = (category === 'all' || card.classList.contains(category)) ? 'flex' : 'none';
    });
}

function previewChefImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => document.getElementById('chef-vera-img').src = e.target.result;
        reader.readAsDataURL(input.files[0]);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message; toast.style.display = 'block';
    toast.style.cssText = `position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:8px; z-index:9999; font-size:14px; display:block;`;
    setTimeout(() => toast.style.display = 'none', 2000);
}

// Page load hole cart render kore neyar jonno
document.addEventListener('DOMContentLoaded', () => {
    renderMenuButtons();
    renderCart();
});
