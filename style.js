let cart = [];

function filterMenu(category) {
  let btns = document.querySelectorAll('.filter-tab-btn');
  btns.forEach(btn => btn.classList.remove('active'));
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
  document.querySelectorAll('.product-item-card').forEach(item => {
    item.style.display = (category === 'all' || item.classList.contains(category)) ? 'block' : 'none';
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
  if (inp) {
    let val = parseInt(inp.value) + delta;
    if (val < 1) val = 1;
    inp.value = val;
  }
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
  // 🔥 OPEN CHECKOUT IMMEDIATELY AFTER ADD (LIKE FOODPANDA)
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
  document.getElementById('direct-checkout-overlay').classList.add('active');
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
    container.innerHTML += `<div class="fp-cart-item-row"><div class="fp-item-info"><span class="fp-item-name">${escapeHtml(item.name)}</span><span class="fp-item-unit-price">৳${item.price} each</span></div><div class="fp-qty-actions-box"><button class="fp-qty-inline-btn" onclick="updateCartItemQty('${esc}', ${item.price}, -1)">-</button><span class="fp-qty-inline-value">${item.qty}</span><button class="fp-qty-inline-btn" onclick="updateCartItemQty('${esc}', ${item.price}, 1)">+</button></div><span class="fp-item-total-price">৳${total}</span><button class="fp-item-delete-btn" onclick="removeBasketItem(${idx})"><i class="fa-solid fa-trash-can"></i></button></div>`;
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

function handleReservation(e) {
  e.preventDefault();
  showToast("Table Reservation Confirmed! See you soon.");
  e.target.reset();
}

function showToast(msg) {
  let toast = document.getElementById('toast-notification');
  if (!toast) { toast = document.createElement('div'); toast.id = 'toast-notification'; document.body.appendChild(toast); }
  toast.innerText = msg;
  toast.className = 'show-alert';
  setTimeout(() => toast.className = '', 3000);
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

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
