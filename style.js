// ========== সম্পূর্ণ ডাইনামিক মেনু ও কার্ট লজিক (ফাইনাল) ==========
const products = [
    { name: "Soft Ruti / Paratha", cats: "breakfast", img: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400", variants: [{ label:"1 Piece (৳20)", val:20 },{ label:"2 Pieces (৳40)", val:40 }] },
    { name: "Special Bhuna Daal", cats: "breakfast", img: "https://images.unsplash.com/photo-1548943487-a2e4f43bb288?w=400", variants: [{ label:"1 Bowl (৳40)", val:40 }], badge: "Morning Special" },
    { name: "Farm Fresh Egg (Dim)", cats: "breakfast", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400", variants: [{ label:"Omelette (৳30)", val:30 },{ label:"Fried/Poached (৳30)", val:30 }] },
    { name: "Beef Bhuna Khichuri", cats: "breakfast lunch", img: "https://images.unsplash.com/photo-1544025162-8111142154ea?w=400", variants: [{ label:"Full Plate (৳280)", val:280 },{ label:"Half Plate (৳160)", val:160 }], badge: "Heavy Breakfast" },
    { name: "Premium Mutton Kacchi", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", variants: [{ label:"Full Plate (৳450)", val:450 },{ label:"Half Plate (৳250)", val:250 }], badge: "Bestseller" },
    { name: "Chittagong Kala Bhuna", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1544025162-8111142154ea?w=400", variants: [{ label:"Full Plate (৳350)", val:350 },{ label:"Half Plate (৳190)", val:190 }], badge: "Popular" },
    { name: "Old Dhaka Beef Tehari", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400", variants: [{ label:"Full Plate (৳220)", val:220 },{ label:"Half Plate (৳120)", val:120 }] },
    { name: "Premium Golap Jam", cats: "desserts", img: "https://images.unsplash.com/photo-1589115795325-1eec578961fb?w=400", variants: [{ label:"250gm (৳150)", val:150 },{ label:"500gm (৳300)", val:300 },{ label:"1kg (৳420)", val:420 }], badge: "Must Try" },
    { name: "Traditional Kalo Jam", cats: "desserts", img: "https://images.unsplash.com/photo-1589115795325-1eec578961fb?w=400", variants: [{ label:"250gm (৳160)", val:160 },{ label:"500gm (৳320)", val:320 },{ label:"1kg (৳420)", val:420 }] },
    { name: "Spongy Roshogolla", cats: "desserts", img: "https://images.unsplash.com/photo-1589115795325-1eec578961fb?w=400", variants: [{ label:"250gm (৳140)", val:140 },{ label:"500gm (৳280)", val:280 },{ label:"1kg (৳280)", val:280 }] },
    { name: "Premium Sondesh", cats: "desserts", img: "https://images.unsplash.com/photo-1589115795325-1eec578961fb?w=400", variants: [{ label:"4pcs (৳180)", val:180 },{ label:"8pcs (৳360)", val:360 }] },
    { name: "Dark Chocolate Cake", cats: "desserts", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400", variants: [{ label:"1 Slice (৳150)", val:150 },{ label:"1 Pound (৳800)", val:800 }] },
    { name: "Premium Sponge Cake", cats: "desserts", img: "https://images.unsplash.com/photo-1557308536-ee471ef2c390?w=400", variants: [{ label:"1 Slice (৳120)", val:120 },{ label:"1 Pound (৳650)", val:650 }] },
    { name: "Vanilla Bean Cake", cats: "desserts", img: "https://images.unsplash.com/photo-1557308536-ee471ef2c390?w=400", variants: [{ label:"1 Slice (৳130)", val:130 },{ label:"1 Pound (৳700)", val:700 }] },
    { name: "Premium Hot Soup", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400", variants: [{ label:"Thai Clear (৳150)", val:150 },{ label:"Chicken Corn (৳130)", val:130 }], badge: "Appetizer" },
    { name: "Soft Tandoori Naan", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400", variants: [{ label:"Butter Naan (৳40)", val:40 },{ label:"Garlic Naan (৳60)", val:60 }] },
    { name: "Authentic Tom Yum Goong", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400", variants: [{ label:"Regular (৳350)", val:350 },{ label:"Family (৳600)", val:600 }], badge: "Hot & Spicy" },
    { name: "Classic Pad Thai Noodles", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400", variants: [{ label:"Chicken (৳250)", val:250 },{ label:"Prawn (৳300)", val:300 }], badge: "Must Try" },
    { name: "Thai Basil Chicken", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=400", variants: [{ label:"1 Plate (৳280)", val:280 }] },
    { name: "Special Thai Fried Rice", cats: "lunch dinner", img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400", variants: [{ label:"Chicken (৳220)", val:220 },{ label:"Mixed (৳260)", val:260 }], badge: "Crowd Favorite" },
    { name: "Traditional Borhani", cats: "drinks lunch dinner", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400", variants: [{ label:"1 Glass (৳80)", val:80 },{ label:"1 Liter (৳300)", val:300 }], badge: "Digestive" },
    { name: "Coca-Cola", cats: "drinks lunch dinner", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", variants: [{ label:"250ml (৳20)", val:20 },{ label:"500ml (৳50)", val:50 }] },
    { name: "Refreshing 7 Up", cats: "drinks lunch dinner", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", variants: [{ label:"250ml (৳20)", val:20 },{ label:"500ml (৳50)", val:50 }] },
    { name: "Mojo", cats: "drinks lunch dinner", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", variants: [{ label:"250ml (৳20)", val:20 },{ label:"500ml (৳50)", val:50 }] }
];

let cart = [];

function renderMenu() {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    container.innerHTML = '';
    products.forEach(p => {
        const catsClass = p.cats;
        const badgeHtml = p.badge ? `<span class="badge-popular ${p.badge === 'Bestseller' ? 'badge-bestseller' : ''}">${p.badge}</span>` : '';
        let optionsHtml = '';
        p.variants.forEach(v => { optionsHtml += `<option value="${v.val}">${v.label}</option>`; });
        container.innerHTML += `
            <div class="product-item-card ${catsClass}">
                ${badgeHtml}
                <img src="${p.img}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400'">
                <div class="product-card-body">
                    <h3>${p.name}</h3>
                    <p>${p.name} - delicious item</p>
                    <div class="product-dropdown-control"><label>Variant:</label><select class="variant-select" onchange="updateDynamicPricing(this)">${optionsHtml}</select></div>
                    <div class="product-price-action">
                        <span class="product-base-price dynamic-render-price" data-base-price="${p.variants[0].val}"> ৳ ${p.variants[0].val}</span>
                        <div class="cart-action-group">
                            <div class="qty-selector"><button class="qty-btn" onclick="updateQty(this, -1)">-</button><input type="text" class="qty-input" value="1" readonly><button class="qty-btn" onclick="updateQty(this, 1)">+</button></div>
                            <button class="btn-cart" onclick="addToCart(this, '${p.name.replace(/'/g, "\\'")}')">Add</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function updateDynamicPricing(select) {
    let newPrice = select.value;
    let priceSpan = select.closest('.product-card-body').querySelector('.dynamic-render-price');
    priceSpan.innerText = '৳ ' + newPrice;
    priceSpan.setAttribute('data-base-price', newPrice);
    renderAllInlineCounters();
}

function updateQty(btn, delta) {
    let inp = btn.parentElement.querySelector('.qty-input');
    if (inp) { let v = parseInt(inp.value) + delta; if (v < 1) v = 1; inp.value = v; }
}

function addToCart(btn, name) {
    let card = btn.closest('.product-card-body');
    let price = parseFloat(card.querySelector('.dynamic-render-price').getAttribute('data-base-price'));
    let qtyInput = card.querySelector('.qty-input');
    let qty = qtyInput ? parseInt(qtyInput.value) : 1;
    let existing = cart.find(i => i.name === name && i.price === price);
    if (existing) existing.qty += qty;
    else cart.push({ name, price, qty });
    if (qtyInput) qtyInput.value = 1;
    showToast(`${name} added!`);
    renderAllInlineCounters();
    updateCartUI();
    // 🔥 এই লাইন চেকআউট খুলবে
    openFpSidebar();
}

function renderAllInlineCounters() {
    document.querySelectorAll('.product-card-body').forEach(card => {
        let name = card.querySelector('h3')?.innerText.trim();
        let priceSpan = card.querySelector('.dynamic-render-price');
        if (!name || !priceSpan) return;
        let price = parseFloat(priceSpan.getAttribute('data-base-price'));
        let existing = cart.find(i => i.name === name && i.price === price);
        let actionDiv = card.querySelector('.cart-action-group');
        if (!actionDiv) return;
        if (!actionDiv.hasAttribute('data-original')) actionDiv.setAttribute('data-original', actionDiv.innerHTML);
        if (existing && existing.qty > 0) {
            let escName = name.replace(/'/g, "\\'");
            actionDiv.innerHTML = `<div class="fp-card-inline-selector"><button class="fp-inline-action-btn" onclick="updateCartItemQty('${escName}', ${price}, -1)">-</button><span class="fp-inline-qty-text">${existing.qty}</span><button class="fp-inline-action-btn" onclick="updateCartItemQty('${escName}', ${price}, 1)">+</button></div>`;
        } else {
            actionDiv.innerHTML = actionDiv.getAttribute('data-original');
        }
    });
}

function updateCartItemQty(name, price, delta) {
    let idx = cart.findIndex(i => i.name === name && i.price === price);
    if (idx !== -1) {
        cart[idx].qty += delta;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    renderAllInlineCounters();
    updateCartUI();
    if (document.getElementById('direct-checkout-overlay').classList.contains('active')) renderBasketItems();
}

function updateCartUI() {
    let totalItems = 0, totalPrice = 0;
    cart.forEach(i => { totalItems += i.qty; totalPrice += i.price * i.qty; });
    document.getElementById('cart-item-count').innerText = totalItems;
    document.getElementById('cart-total-price').innerText = '৳ ' + totalPrice;
    let floatCart = document.getElementById('floating-cart');
    if (totalItems > 0) floatCart.classList.remove('hidden');
    else floatCart.classList.add('hidden');
}

function openFpSidebar() {
    if (cart.length === 0) { showToast("Basket empty!"); return; }
    renderBasketItems();
    const overlay = document.getElementById('direct-checkout-overlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function renderBasketItems() {
    let container = document.getElementById('checkout-dynamic-items-list');
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
        let total = item.price * item.qty;
        grand += total;
        let esc = item.name.replace(/'/g, "\\'");
        container.innerHTML += `
            <div class="fp-cart-item-row">
                <div class="fp-item-info"><span class="fp-item-name">${escapeHtml(item.name)}</span><span class="fp-item-unit-price">৳${item.price} each</span></div>
                <div class="fp-qty-actions-box"><button class="fp-qty-inline-btn" onclick="updateCartItemQty('${esc}', ${item.price}, -1)">-</button><span class="fp-qty-inline-value">${item.qty}</span><button class="fp-qty-inline-btn" onclick="updateCartItemQty('${esc}', ${item.price}, 1)">+</button></div>
                <span class="fp-item-total-price">৳${total}</span>
                <button class="fp-item-delete-btn" onclick="removeBasketItem(${idx})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });
    document.getElementById('basket-grand-total-val').innerText = '৳ ' + grand;
}

function removeBasketItem(index) {
    cart.splice(index, 1);
    renderAllInlineCounters();
    updateCartUI();
    renderBasketItems();
}

function closeFullCheckout() {
    document.getElementById('direct-checkout-overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function submitDirectOrder() {
    if (cart.length === 0) return;
    let name = document.getElementById('custName').value.trim();
    let addr = document.getElementById('custAddress').value.trim();
    let phone = document.getElementById('custPhone').value.trim();
    if (!name || !addr || !phone) { showToast("Fill all delivery info!"); return; }
    document.getElementById('otp-verification-panel').style.display = 'flex';
}

function confirmDirectOtp() {
    let otp = document.getElementById('direct-otp-input').value.trim();
    if (otp.length !== 4) { showToast("Enter 4-digit OTP"); return; }
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

function filterMenu(category) {
    let btns = document.querySelectorAll('.filter-tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    document.querySelectorAll('.product-item-card').forEach(item => {
        if (category === 'all' || item.classList.contains(category)) item.style.display = 'block';
        else item.style.display = 'none';
    });
}

function handleReservation(e) { e.preventDefault(); showToast("Table Reservation Confirmed! See you soon."); e.target.reset(); }
function showToast(msg) { let t = document.getElementById('toast-notification'); if (!t) { t = document.createElement('div'); t.id = 'toast-notification'; document.body.appendChild(t); } t.innerText = msg; t.className = 'show-alert'; setTimeout(() => t.className = '', 3000); }
function escapeHtml(str) { return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }

window.onload = () => { renderMenu(); };
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
