let cart = []; // Global cart stack reference variable tracker

// System triggers function to handle panels visibility toggles
function openCartPanel() {
    document.getElementById('fp-cart-sidebar').classList.add('active');
}
function closeCartPanel() {
    document.getElementById('fp-cart-sidebar').classList.remove('active');
}
function switchToCheckoutView() {
    if(cart.length === 0) {
        alert("Your basket is empty! Add items first.");
        return;
    }
    document.getElementById('fp-checkout-screen').style.display = 'block';
    closeCartPanel();
}
function closeCheckoutView() {
    document.getElementById('fp-checkout-screen').style.display = 'none';
}

// Global active element handler state management for payments switcher
let activePaymentMethod = 'cod';
function selectFpPayment(method, element) {
    activePaymentMethod = method;
    document.querySelectorAll('.fp-pay-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

// Core calculation model processing framework renderer
function renderCartData() {
    const itemsContainer = document.getElementById('fp-items-container');
    const totalAmountBadge = document.getElementById('fp-total-badge');
    const chkList = document.getElementById('fp-checkout-items-list');
    const chkSubtotal = document.getElementById('chk-subtotal');
    const chkFinalTotal = document.getElementById('chk-final-total');
    
    let subtotalAmt = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let grandTotalAmt = subtotalAmt > 0 ? (subtotalAmt + 32 + 19) : 0;

    // Trigger Update calculations metrics inside sidebar basket display views
    if (totalAmountBadge) totalAmountBadge.textContent = '৳' + subtotalAmt;

    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div style="text-align:center; padding:40px 10px; color:#aaa;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:45px; color:#e5e5e5; margin-bottom:12px;"></i>
                    <p style="font-size:14px; font-weight:600;">Your basket is empty</p>
                </div>`;
        } else {
            let itemsHtml = '';
            cart.forEach((item, idx) => {
                let variantText = item.variant ? `<p style="margin:2px 0 0; font-size:12px; color:#757575;">${item.variant}</p>` : '';
                itemsHtml += `
                    <div class="fp-cart-item">
                        <div class="fp-item-info">
                            <div style="font-weight:600; font-size:14px; color:#333;">${item.name}</div>
                            ${variantText}
                            <div class="fp-item-row-bottom" style="margin-top:8px;">
                                <span style="font-weight:700; color:#222;">৳${item.price * item.qty}</span>
                                <div class="fp-qty-pill">
                                    <button type="button" onclick="adjustFpQty(${idx}, -1)">&minus;</button>
                                    <span>${item.qty}</span>
                                    <button type="button" onclick="adjustFpQty(${idx}, 1)">&plus;</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
            itemsContainer.innerHTML = itemsHtml;
        }
    }

    // Trigger Calculations rendering output engine inside Checkout Summary Grid
    if (chkList) {
        let chkHtml = '';
        cart.forEach(item => {
            let labelTitle = item.variant ? `${item.name} (${item.variant})` : item.name;
            chkHtml += `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px;">
                    <span><strong style="color:#d70f64;">${item.qty}x</strong> ${labelTitle}</span>
                    <span style="font-weight:600; color:#333;">৳${item.price * item.qty}</span>
                </div>`;
        });
        chkList.innerHTML = chkHtml || '<p style="color:#aaa;">No items</p>';
        if (chkSubtotal) chkSubtotal.textContent = '৳' + subtotalAmt;
        if (chkFinalTotal) chkFinalTotal.textContent = '৳' + grandTotalAmt;
    }
}

// Adjust quantity internal processing routine array engine controller
function adjustFpQty(index, factor) {
    cart[index].qty += factor;
    if(cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    renderCartData();
}

// Hooking system to connect your existing page 'Add' button triggers stack
function addFoodToCart(name, price, variant = null) {
    let existingItem = cart.find(item => item.name === name && item.variant === variant);
    if(existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name: name, price: parseInt(price), qty: 1, variant: variant });
    }
    renderCartData();
    openCartPanel(); // Open basket screen overlay seamlessly instantly like Foodpanda
}

// Final handler processing endpoint action routines
function submitFpFinalOrder() {
    if(cart.length === 0) return;
    let name = document.getElementById('fp-custName').value;
    let phone = document.getElementById('fp-custPhone').value;
    let addr = document.getElementById('fp-custAddress').value;
    
    if(!name || !phone || !addr) {
        alert("⚠️ Please fill in all delivery details fields before placing order!");
        return;
    }
    
    alert(`🎉 Order Placed Successfully via ${activePaymentMethod.toUpperCase()}!\nThank you for ordering, ${name}.`);
    cart = [];
    renderCartData();
    closeCheckoutView();
}
