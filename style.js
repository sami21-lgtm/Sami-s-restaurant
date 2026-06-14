// 1. Cart Data Store (Ekhan theke shob data control hobe)
let cart = [];

// 2. Add to Cart Function (Item add korar sathe sathe checkout open korbe)
function addToCart(id, name, price, image) {
    // Check korbe ei item age theke cart-e ache kina
    let existingItemIndex = cart.findIndex(item => item.id === id);

    if (existingItemIndex !== -1) {
        // Jodi thake, tahole shudhu quantity (qty) 1 bariye dibe
        cart[existingItemIndex].qty += 1;
    } else {
        // Natun item hole cart array-te push korbe
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            qty: 1
        });
    }

    // UI ba display update korbe
    renderCartData();
    
    // Sathe sathe Checkout/Sidebar open korbe
    openCheckoutView();
}

// 3. Update Quantity (Plus & Minus button er jonno)
function updateCardItemQty(id, factor) {
    let index = cart.findIndex(item => item.id === id);

    if (index !== -1) {
        cart[index].qty += factor; // factor hobe +1 othoba -1

        // Quantity komte komte 0 ba tar niche gele, delete kore dibe
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }

    // Abar UI update korbe
    renderCartData();

    // Delete howar por basket khali hoye gele auto close hobe
    if (cart.length === 0) {
        closeCheckoutView();
    }
}

// 4. Remove Item (Direct Delete Button er jonno)
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id); // oi item bad diye baki gulo rakhbe
    
    renderCartData();

    // Basket khali hole close hobe
    if (cart.length === 0) {
        closeCheckoutView();
    }
}

// 5. Render Cart Data (Basket er bhitor HTML design show korar jonno)
function renderCartData() {
    // Apnar HTML er ID gulor nam milaye niben
    const cartContainer = document.getElementById('cart-items-container'); 
    const totalAmountEl = document.getElementById('cart-total-amount'); 
    const cartBadgeEl = document.getElementById('cart-badge'); // icon er upore item count
    
    // Jodi HTML e ei ID gulo na thake tahole error thekanor jonno return korbe
    if (!cartContainer) return; 

    cartContainer.innerHTML = ''; // Purboborti item clear kora
    let totalAmount = 0;
    let totalItems = 0;

    cart.forEach(item => {
        let itemTotal = item.price * item.qty;
        totalAmount += itemTotal;
        totalItems += item.qty;

        // Apnar Basket-er bhitorer design (Apnar CSS class er sathe milate paren)
        cartContainer.innerHTML += `
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                <img src="${item.image}" alt="${item.name}" width="50" style="border-radius: 5px;">
                <div class="item-details" style="flex-grow: 1; margin-left: 10px;">
                    <h4 style="margin: 0; font-size: 14px;">${item.name}</h4>
                    <p style="margin: 0; font-size: 12px; color: gray;">Price: ৳${item.price}</p>
                </div>
                <div class="item-actions" style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="updateCardItemQty('${item.id}', -1)" style="padding: 5px 10px;">-</button>
                    <span style="font-weight: bold;">${item.qty}</span>
                    <button onclick="updateCardItemQty('${item.id}', 1)" style="padding: 5px 10px;">+</button>
                    <button onclick="removeFromCart('${item.id}')" style="color: red; border: none; background: none; cursor: pointer;">X</button>
                </div>
            </div>
        `;
    });

    // Total Amount ar Badge update kora
    if (totalAmountEl) totalAmountEl.innerText = `৳${totalAmount.toFixed(2)}`;
    if (cartBadgeEl) cartBadgeEl.innerText = totalItems;
}

// 6. Open Checkout Sidebar (Right side theke basket open korbe)
function openCheckoutView() {
    const checkoutSidebar = document.getElementById('fp-sidebar'); // Sidebar ID
    const overlay = document.getElementById('fp-sidebar-overlay'); // Overlay ID
    
    // Error asha thekate null check
    if (checkoutSidebar) {
        checkoutSidebar.classList.add('active'); 
        checkoutSidebar.style.right = '0px'; // CSS style force kora
    }
    if (overlay) {
        overlay.style.display = 'block';
    }
}

// 7. Close Checkout Sidebar (Basket bondho korbe)
function closeCheckoutView() {
    const checkoutSidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    
    if (checkoutSidebar) {
        checkoutSidebar.classList.remove('active');
        checkoutSidebar.style.right = '-100%'; // Hide kore dibe
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}
