// =============================================
// STATE
// =============================================
let cart = [];
let deliveryFee = 32;
let deliveryType = 'standard';
let discountPercent = 0;
let voucherApplied = false;

const PROMOS = { 'DHAKA20': 20, 'SAMI10': 10, 'WELCOME15': 15 };

// =============================================
// ADD TO CART (Foodpanda: ADD → Sidebar Opens)
// =============================================
function fpAdd(name, price) {
    price = parseInt(price);
    const item = cart.find(i => i.name === name);
    if (item) {
        item.qty++;
        const w = document.querySelector(`.fp-add-wrapper[data-name="${name}"]`);
        if (w) item.price = parseInt(w.dataset.price);
    } else {
        cart.push({ name, price, qty: 1 });
    }

    syncAllCards();
    renderAll();
    showFloatingBar();
    openSidebar();
    toast(`${name} added!`);
}

// =============================================
// QTY CHANGE FROM CARD
// =============================================
function fpQtyChange(name, delta) {
    const idx = cart.findIndex(i => i.name === name);
    if (idx !== -1) {
        cart[idx].qty += delta;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    syncAllCards();
    renderAll();
    if (cart.length === 0) hideFloatingBar();
}

// =============================================
// QTY CHANGE FROM SIDEBAR
// =============================================
function fpSideQty(name, delta) {
    fpQtyChange(name, delta);
}

// =============================================
// DELETE FROM SIDEBAR
// =============================================
function fpSideDel(name) {
    cart = cart.filter(i => i.name !== name);
    syncAllCards();
    renderAll();
    if (cart.length === 0) hideFloatingBar();
    toast(`${name} removed`);
}

// =============================================
// VARIANT (Dropdown) PRICE CHANGE
// =============================================
function fpVariantChange(sel) {
    const price = sel.value;
    const body = sel.closest('.food-card-body');
    if (!body) return;
    const dynPrice = body.querySelector('.dyn-price');
    const wrapper = body.closest('.food-card').querySelector('.fp-add-wrapper');
    if (dynPrice) dynPrice.textContent = price;
    if (wrapper) {
        wrapper.dataset.price = price;
        const name = wrapper.dataset.name;
        const item = cart.find(i => i.name === name);
        if (item) { item.price = parseInt(price); renderAll(); }
    }
}

// =============================================
// SYNC CARD BUTTONS (ADD ↔ QTY)
// =============================================
function syncAllCards() {
    document.querySelectorAll('.fp-add-wrapper').forEach(w => {
        const name = w.dataset.name;
        const addBtn = w.querySelector('.fp-add-btn');
        const qtyCtrl = w.querySelector('.fp-qty-ctrl');
        const qtyNum = w.querySelector('.fp-qty-num');
        const item = cart.find(i => i.name === name);
        if (item) {
            addBtn.style.display = 'none';
            qtyCtrl.style.display = 'flex';
            qtyNum.textContent = item.qty;
        } else {
            addBtn.style.display = 'flex';
            qtyCtrl.style.display = 'none';
        }
    });
}

// =============================================
// RENDER ALL (Sidebar + Checkout + Floating)
// =============================================
function renderAll() {
    const cartDiv = document.getElementById('fp-cart-items');
    const chkList = document.getElementById('chk-items-list');
    const barCount = document.getElementById('fp-bar-count');
    const barTotal = document.getElementById('fp-bar-total');
    const sideSub = document.getElementById('fp-side-subtotal');
    const sideTotal = document.getElementById('fp-side-total');

    let totalQty = 0, subtotal = 0;
    if (cartDiv) cartDiv.innerHTML = '';
    if (chkList) chkList.innerHTML = '';

    if (cart.length === 0) {
        if (cartDiv) cartDiv.innerHTML = '<p style="text-align:center;color:#aaa;padding:30px 0;font-size:14px;">Your basket is empty</p>';
    } else {
        cart.forEach(item => {
            totalQty += item.qty;
            const lineTotal = item.price * item.qty;
            subtotal += lineTotal;

            // Sidebar item
            if (cartDiv) {
                cartDiv.innerHTML += `
                <div class="fp-sb-item">
                    <div class="fp-sb-item-info">
                        <h4>${item.name}</h4>
                        <div class="fp-qty-ctrl" style="display:flex;height:26px;width:fit-content;">
                            <button class="fp-qty-minus" onclick="fpSideQty('${item.name}',-1)" style="width:24px;font-size:14px;">−</button>
                            <span class="fp-qty-num" style="width:24px;line-height:20px;font-size:12px;">${item.qty}</span>
                            <button class="fp-qty-plus" onclick="fpSideQty('${item.name}',1)" style="width:24px;font-size:14px;">+</button>
                        </div>
                    </div>
                    <div class="fp-sb-item-right">
                        <span class="fp-sb-item-price">৳ ${lineTotal}</span>
                        <button class="fp-sb-del" onclick="fpSideDel('${item.name}')"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>`;
            }

            // Checkout item
            if (chkList) {
                chkList.innerHTML += `
                <div class="chk-item-row">
                    <span class="ci-qty">${item.qty}x</span>
                    <span class="ci-name">${item.name}</span>
                    <span class="ci-total">৳ ${lineTotal}</span>
                </div>`;
            }
        });
    }

    // Calculate
    const vat = Math.round(subtotal * 0.05);
    const discount = voucherApplied ? Math.round(subtotal * discountPercent / 100) : 0;
    const total = subtotal + deliveryFee + vat - discount;

    // Floating bar
    if (barCount) barCount.textContent = totalQty;
    if (barTotal) barTotal.textContent = `৳ ${subtotal}`;

    // Sidebar footer
    if (sideSub) sideSub.textContent = `৳ ${subtotal}`;
    if (sideTotal) sideTotal.textContent = `৳ ${subtotal}`;

    // Checkout bill
    const bSub = document.getElementById('b-subtotal');
    const bDel = document.getElementById('b-delivery');
    const bVat = document.getElementById('b-vat');
    const bDisRow = document.getElementById('b-discount-row');
    const bDis = document.getElementById('b-discount');
    const bTotal = document.getElementById('b-total');
    const goBtn = document.getElementById('fp-go-checkout');

    if (bSub) bSub.textContent = `৳ ${subtotal}`;
    if (bDel) bDel.textContent = deliveryType === 'pickup' ? 'FREE' : `৳ ${deliveryFee}`;
    if (bVat) bVat.textContent = `৳ ${vat}`;
    if (bDisRow && bDis) {
        if (voucherApplied && discount > 0) {
            bDisRow.style.display = 'flex';
            bDis.textContent = `- ৳ ${discount}`;
        } else {
            bDisRow.style.display = 'none';
        }
    }
    if (bTotal) bTotal.textContent = `৳ ${total}`;
    if (goBtn) goBtn.disabled = cart.length === 0;
}

// =============================================
// FLOATING BAR
// =============================================
function showFloatingBar() {
    const bar = document.getElementById('fp-floating-cart');
    if (bar) bar.classList.add('show');
}
function hideFloatingBar() {
    const bar = document.getElementById('fp-floating-cart');
    if (bar) bar.classList.remove('show');
}

// =============================================
// SIDEBAR OPEN / CLOSE
// =============================================
function openSidebar() {
    document.getElementById('fp-overlay').classList.add('show');
    document.getElementById('fp-sidebar').classList.add('open');
}
function closeSidebar() {
    document.getElementById('fp-overlay').classList.remove('show');
    document.getElementById('fp-sidebar').classList.remove('open');
}

// =============================================
// CHECKOUT OPEN / CLOSE
// =============================================
function openCheckout() {
    if (cart.length === 0) return;
    closeSidebar();
    document.getElementById('fp-checkout-page').style.display = 'block';
    document.getElementById('chk-main').style.display = 'block';
    document.getElementById('chk-success').style.display = 'none';
    document.body.style.overflow = 'hidden';
    renderAll();
}
function closeCheckout() {
    document.getElementById('fp-checkout-page').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =============================================
// DELIVERY PICK
// =============================================
function pickDelivery(el, type) {
    document.querySelectorAll('.del-opt').forEach(c => c.classList.remove('active-del'));
    el.classList.add('active-del');
    deliveryType = type;
    deliveryFee = type === 'standard' ? 32 : type === 'express' ? 60 : 0;
    renderAll();
}

// =============================================
// PAYMENT PICK
// =============================================
function pickPayment(el, method) {
    document.querySelectorAll('.pay-opt').forEach(c => c.classList.remove('active-pay'));
    el.classList.add('active-pay');
}

// =============================================
// PROMO CODE
// =============================================
function applyPromo() {
    const input = document.getElementById('c-promo');
    const msg = document.getElementById('promo-msg');
    const code = input.value.trim().toUpperCase();

    if (PROMOS[code]) {
        discountPercent = PROMOS[code];
        voucherApplied = true;
        msg.textContent = `✅ ${discountPercent}% discount applied!`;
        msg.style.color = '#4CAF50';
        input.disabled = true;
        input.style.background = '#f0fff0';
    } else {
        voucherApplied = false;
        discountPercent = 0;
        msg.textContent = '❌ Invalid promo code';
        msg.style.color = '#f44336';
    }
    renderAll();
}

// =============================================
// PLACE ORDER
// =============================================
function placeOrder() {
    const name = document.getElementById('c-name').value.trim();
    const phone = document.getElementById('c-phone').value.trim();
    const addr = document.getElementById('c-address').value.trim();

    if (!name || !phone || !addr) { toast('Please fill all delivery details!'); return; }
    if (phone.length < 11) { toast('Enter valid phone number!'); return; }

    const oid = 'SR-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('order-id').textContent = `Order #${oid}`;

    document.getElementById('chk-main').style.display = 'none';
    document.getElementById('chk-success').style.display = 'flex';
}

// =============================================
// GO HOME (Reset Everything)
// =============================================
function goHome() {
    cart = [];
    voucherApplied = false;
    discountPercent = 0;
    deliveryFee = 32;
    deliveryType = 'standard';

    syncAllCards();
    renderAll();
    hideFloatingBar();
    closeCheckout();

    // Reset inputs
    ['c-name','c-phone','c-address','c-note','c-promo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.disabled = false; el.style.background = ''; }
    });
    document.getElementById('promo-msg').textContent = '';
    document.querySelectorAll('.del-opt').forEach((c, i) => c.classList.toggle('active-del', i === 0));
    document.querySelectorAll('.pay-opt').forEach((c, i) => c.classList.toggle('active-pay', i === 0));

    window.location.href = '#menu';
}

// =============================================
// MENU FILTER
// =============================================
function filterMenu(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.food-card').forEach(c => {
        c.style.display = (cat === 'all' || c.classList.contains(cat)) ? 'flex' : 'none';
    });
}

// =============================================
// TOAST
// =============================================
function toast(msg) {
    const t = document.getElementById('fp-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    syncAllCards();
    renderAll();
});
