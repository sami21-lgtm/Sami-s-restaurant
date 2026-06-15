// ======================== সম্পূর্ণ ওয়ার্কিং script.js (Add করলেই চেকআউট) ========================
let cart = [];

// ফ্লোটিং কার্ট আপডেট
function updateCartUI() {
    let totalItems = 0, totalPrice = 0;
    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;
    });
    document.getElementById('cart-item-count').innerText = totalItems;
    document.getElementById('cart-total-price').innerText = '৳ ' + totalPrice;
    const floatingCart = document.getElementById('floating-cart');
    if (totalItems > 0) floatingCart.classList.remove('hidden');
    else floatingCart.classList.add('hidden');
}

// চেকআউটে আইটেম রেন্ডার
function renderBasketItems() {
    const container = document.getElementById('checkout-dynamic-items-list');
    if (!container) return;
    container.innerHTML = '';
    let grand = 0;
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-basket-text">Your basket is empty.</p>';
        document.getElementById('basket-grand-total-val').innerText = '৳ 0';
        closeFullCheckout();
        return;
    }
    cart.forEach((item, idx) => {
        const total = item.price * item.qty;
        grand += total;
        const escName = item.name.replace(/'/g, "\\'");
        container.innerHTML += `
            <div class="fp-cart-item-row">
                <div class="fp-item-info">
                    <span class="fp-item-name">${escapeHtml(item.name)}</span>
                    <span class="fp-item-unit-price">৳${item.price} each</span>
                </div>
                <div class="fp-qty-actions-box">
                    <button class="fp-qty-inline-btn" onclick="updateCartItemQty('${escName}', ${item.price}, -1)">-</button>
                    <span class="fp-qty-inline-value">${item.qty}</span>
                    <button class="fp-qty-inline-btn" onclick="updateCartItemQty('${escName}', ${item.price}, 1)">+</button>
                </div>
                <span class="fp-item-total-price">৳${total}</span>
                <button class="fp-item-delete-btn" onclick="removeBasketItem(${idx})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });
    document.getElementById('basket-grand-total-val').innerText = '৳ ' + grand;
}

// চেকআউট ওপেন
function openFpSidebar() {
    if (cart.length === 0) {
        showToast("Basket empty!");
        return;
    }
    renderBasketItems();
    document.getElementById('direct-checkout-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullCheckout() {
    document.getElementById('direct-checkout-overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// কার্টে আইটেম যোগ করা (Add বাটন)
function addToCart(btn, itemName) {
    const cardBody = btn.closest('.product-card-body');
    const priceSpan = cardBody.querySelector('.dynamic-render-price');
    const price = parseFloat(priceSpan.getAttribute('data-base-price'));
    const qtyInput = cardBody.querySelector('.qty-input');
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;
    
    const existing = cart.find(i => i.name === itemName && i.price === price);
    if (existing) existing.qty += qty;
    else cart.push({ name: itemName, price: price, qty: qty });
    
    if (qtyInput) qtyInput.value = 1;
    showToast(`${itemName} added!`);
    
    // ইনলাইন কাউন্টার রিফ্রেশ
    renderAllInlineCounters();
    updateCartUI();
    
    // 🔥 সবচেয়ে গুরুত্বপূর্ণ: Add ক্লিক করলেই চেকআউট আসবে
    openFpSidebar();
}

// + / - ফুড কার্ডে গ্রীন ইনলাইন কাউন্টার দেখানো
function renderAllInlineCounters() {
    document.querySelectorAll('.product-card-body').forEach(card => {
        const nameElem = card.querySelector('h3');
        const priceSpan = card.querySelector('.dynamic-render-price');
        if (!nameElem || !priceSpan) return;
        const itemName = nameElem.innerText.trim();
        const price = parseFloat(priceSpan.getAttribute('data-base-price'));
        const existing = cart.find(i => i.name === itemName && i.price === price);
        const actionDiv = card.querySelector('.cart-action-group');
        if (!actionDiv) return;
        
        if (!actionDiv.hasAttribute('data-original')) {
            actionDiv.setAttribute('data-original', actionDiv.innerHTML);
        }
        
        if (existing && existing.qty > 0) {
            const escName = itemName.replace(/'/g, "\\'");
            actionDiv.innerHTML = `
                <div class="fp-card-inline-selector">
                    <button class="fp-inline-action-btn" onclick="updateCartItemQty('${escName}', ${price}, -1)">-</button>
                    <span class="fp-inline-qty-text">${existing.qty}</span>
                    <button class="fp-inline-action-btn" onclick="updateCartItemQty('${escName}', ${price}, 1)">+</button>
                </div>
            `;
        } else {
            actionDiv.innerHTML = actionDiv.getAttribute('data-original');
        }
    });
}

// চেকআউটের ভিতর ও ফুড কার্ডে +/- আপডেট
function updateCartItemQty(name, price, delta) {
    const idx = cart.findIndex(i => i.name === name && i.price === price);
    if (idx !== -1) {
        cart[idx].qty += delta;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    renderAllInlineCounters();
    updateCartUI();
    if (document.getElementById('direct-checkout-overlay').classList.contains('active')) {
        renderBasketItems();
    }
}

function removeBasketItem(index) {
    cart.splice(index, 1);
    renderAllInlineCounters();
    updateCartUI();
    renderBasketItems();
}

// ভেরিয়েন্ট চেঞ্জে দাম আপডেট
function updateDynamicPricing(select) {
    const newPrice = select.value;
    const priceSpan = select.closest('.product-card-body').querySelector('.dynamic-render-price');
    priceSpan.innerText = '৳ ' + newPrice;
    priceSpan.setAttribute('data-base-price', newPrice);
    renderAllInlineCounters();
}

function updateQty(btn, delta) {
    const inp = btn.parentElement.querySelector('.qty-input');
    if (inp) {
        let v = parseInt(inp.value) + delta;
        if (v < 1) v = 1;
        inp.value = v;
    }
}

// মেনু ফিল্টার
function filterMenu(category) {
    const btns = document.querySelectorAll('.filter-tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    document.querySelectorAll('.product-item-card').forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// অর্ডার সাবমিট
function submitDirectOrder() {
    if (cart.length === 0) return;
    const name = document.getElementById('custName').value.trim();
    const addr = document.getElementById('custAddress').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    if (!name || !addr || !phone) {
        showToast("Please fill all delivery info!");
        return;
    }
    document.getElementById('otp-verification-panel').style.display = 'flex';
}

function confirmDirectOtp() {
    const otp = document.getElementById('direct-otp-input').value.trim();
    if (otp.length !== 4) {
        showToast("Enter 4-digit OTP");
        return;
    }
    document.getElementById('otp-verification-panel').style.display = 'none';
    document.getElementById('order-success-panel').style.display = 'flex';
}

function resetToMenu() {
    cart = [];
    renderAllInlineCounters();
    updateCartUI();
    closeFullCheckout();
    document.getElementById('order-success-panel').style.display = 'none';
    document.getElementById('direct-otp-input').value = '';
    document.getElementById('custName').value = '';
    document.getElementById('custAddress').value = '';
    document.getElementById('custPhone').value = '';
}

function handleReservation(e) {
    e.preventDefault();
    alert('Reservation confirmed!');
    e.target.reset();
}

function showToast(msg) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.className = 'show-alert';
    setTimeout(() => toast.className = '', 3000);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// গ্লোবাল ফাংশন এক্সপোজ
window.filterMenu = filterMenu;
window.updateDynamicPricing = updateDynamicPricing;
window.updateQty = updateQty;
window.addToCart = addToCart;
window.updateCartItemQty = updateCartItemQty;
window.openFpSidebar = openFpSidebar;
window.closeFullCheckout = closeFullCheckout;
window.submitDirectOrder = submitDirectOrder;
window.confirmDirectOtp = confirmDirectOtp;
window.resetToMenu = resetToMenu;
window.handleReservation = handleReservation;
window.removeBasketItem = removeBasketItem;
window.renderAllInlineCounters = renderAllInlineCounters;
window.updateCartUI = updateCartUI;

// পেজ লোড হলে ইনলাইন কাউন্টার রেডি রাখা
document.addEventListener('DOMContentLoaded', () => {
    renderAllInlineCounters();
    updateCartUI();
});
