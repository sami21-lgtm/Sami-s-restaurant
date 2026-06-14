// ==================== Global Cart Array ====================
let cart = []; 

// ==================== 1. Click "Add" -> Open Basket/Checkout Directly ====================
function addToCart(btnElement, itemName) {
    let price = 0;
    let image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'; 

    // Menu card theke automatic price ar image dhorbe
    try {
        let parentCard = btnElement.closest('.menu-card') || btnElement.closest('.card') || btnElement.parentElement.parentElement;
        if(parentCard) {
            let cardText = parentCard.innerText;
            let priceMatch = cardText.match(/Tk\s*(\d+)/i) || cardText.match(/৳\s*(\d+)/i);
            if(priceMatch) price = parseInt(priceMatch[1]);
            
            let imgTag = parentCard.parentElement.querySelector('img') || parentCard.querySelector('img');
            if(imgTag) image = imgTag.src;
        }
    } catch(e) {}

    // Cart-e item add kora
    let existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id: Date.now(), name: itemName, price: price || 0, qty: 1, image: image });
    }

    // Data render kore sathe sathe Checkout open kora!
    renderCartData();
    openFullCheckout(); 
}

// ==================== 2. Quantity Change & Delete Options ====================
function updateQty(index, change) {
    if (cart[index]) {
        cart[index].qty += change;
        
        // Quantity 0 ba tar niche ashte chaile item delete hoye jabe
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }
    renderCartData();
    
    // Basket khali hoye gele page auto close hobe
    if (cart.length === 0) closeFullCheckout();
}

function deleteItem(index) {
    cart.splice(index, 1);
    renderCartData();
    if (cart.length === 0) closeFullCheckout();
}

// ==================== 3. Checkout Data Rendering (+, -, Delete Button) ====================
function renderCartData() {
    const checkoutItemsList = document.getElementById('checkout-items-list');
    const chkSubtotal = document.getElementById('chk-subtotal');
    const chkFinalTotal = document.getElementById('chk-final-total');

    // Total hishab kora
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let deliveryFee = subtotal > 0 ? 32 : 0; // Apnar delivery fee
    let serviceFee = subtotal > 0 ? 19 : 0;  // Apnar service fee
    let grandTotal = subtotal > 0 ? (subtotal + deliveryFee + serviceFee) : 0;

    if (chkSubtotal) chkSubtotal.textContent = 'Tk ' + subtotal;
    if (chkFinalTotal) chkFinalTotal.textContent = 'Tk ' + grandTotal;

    // Checkout/Basket-er item list banano
    if (checkoutItemsList) {
        if (cart.length === 0) {
            checkoutItemsList.innerHTML = `<p style="text-align:center; color:#888;">Your basket is empty.</p>`;
        } else {
            let html = '';
            cart.forEach((item, index) => {
                html += `
                <div style="background:#fff; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                    
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">
                        <div>
                            <strong style="display:block; font-size:15px; color:#333;">${item.name}</strong>
                            <span style="color:#e21b70; font-weight:bold;">Tk ${item.price * item.qty}</span>
                        </div>
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:15px;">
                        
                        <div style="display:flex; align-items:center; background:#f7f7f7; border-radius:20px; border:1px solid #ddd;">
                            <button onclick="updateQty(${index}, -1)" style="border:none; background:none; width:30px; height:30px; font-size:18px; cursor:pointer; color:#333;">-</button>
                            <span style="font-weight:bold; font-size:14px; width:20px; text-align:center;">${item.qty}</span>
                            <button onclick="updateQty(${index}, 1)" style="border:none; background:none; width:30px; height:30px; font-size:18px; cursor:pointer; color:#e21b70;">+</button>
                        </div>
                        
                        <button onclick="deleteItem(${index})" style="background:none; border:none; color:#ff4757; font-size:18px; cursor:pointer;" title="Delete">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>

                    </div>
                </div>`;
            });
            checkoutItemsList.innerHTML = html;
        }
    }
}

// ==================== 4. Modal Open/Close Logic ====================
function openFullCheckout() {
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) checkoutPage.style.setProperty('display', 'block', 'important');
}

function closeFullCheckout() {
    const checkoutPage = document.getElementById('full-checkout-page');
    if (checkoutPage) checkoutPage.style.setProperty('display', 'none', 'important');
}

// Payment method select logic
function selectFpPayment(method, element) {
    document.querySelectorAll('.fp-pay-card').forEach(c => c.classList.remove('active'));
    if(element) element.classList.add('active');
}

// ==================== 5. Final Order Confirmation ====================
function submitFinalOrder() {
    if (cart.length === 0) return alert("Basket is empty!");
    
    const street = document.getElementById('chk-street');
    if (street && !street.value.trim()) {
        alert("⚠️ Please enter your Street / House Number!");
        if(street) street.focus();
        return;
    }

    const successOverlay = document.getElementById('orderSuccessOverlay');
    if (successOverlay) {
        successOverlay.style.display = 'flex';
    } else {
        alert("🎉 Order Placed Successfully!");
    }

    cart = [];
    renderCartData();
    if(street) street.value = '';
}

function closeOrderSuccess() {
    const successOverlay = document.getElementById('orderSuccessOverlay');
    if (successOverlay) successOverlay.style.display = 'none';
    closeFullCheckout();
}
