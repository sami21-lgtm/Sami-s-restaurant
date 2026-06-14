let cart = [];

// ==========================================
// 1. ADD TO CART & QUANTITY CONTROLLERS
// ==========================================

// Add item to cart from Menu Card
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

// Update quantity from Menu Card (+/-)
function updateCardItemQty(name, delta) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += delta;
        if (existingItem.qty <= 0) {
            cart = cart.filter(item => item.name !== name);
        }
    }
    renderMenuButtons();
    renderCart();
}

// Update quantity from Sidebar Cart (+/-)
function updateSidebarQty(name, delta) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += delta;
        if (existingItem.qty <= 0) {
            cart = cart.filter(item => item.name !== name);
        }
    }
    renderMenuButtons();
    renderCart();
}

// Update price when dropdown variant changes (e.g., Half/Full)
function updateDynamicPricing(selectElement) {
    const price = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    const priceDisplay = cardBody.querySelector('.dynamic-render-price');
    const actionWrapper = cardBody.querySelector('.fp-card-action-wrapper');
    
    priceDisplay.textContent = ` ৳ ${price}`;
    actionWrapper.dataset.price = price;
    
    // If item is already in cart, update its price dynamically
    const name = actionWrapper.dataset.name;
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.price = parseInt(price);
        renderCart();
    }
}

// ==========================================
// 2. RENDERING (UI UPDATES)
// ==========================================

// Render Add/Qty buttons on the Menu Cards
function renderMenuButtons() {
    document.querySelectorAll('.fp-card-action-wrapper').forEach(wrapper => {
        const name = wrapper.dataset.name;
        const itemInCart = cart.find(item => item.name === name);
        const addBtn = wrapper.querySelector('.fp-card-add-btn');
        const qtyControl = wrapper.querySelector('.fp-card-qty-control');
        const qtyDisplay = wrapper.querySelector('.fp-card-qty-display');

        if (itemInCart) {
            addBtn.style.display = 'none';
            qtyControl.style.display = 'flex';
            qtyDisplay.textContent = itemInCart.qty;
        } else {
            addBtn.style.display = 'block';
            qtyControl.style.display = 'none';
        }
    });
}

// Render Cart Sidebar, Floating Bar, and Checkout Summary
function renderCart() {
    const cartContainer = document.getElementById('fp-cart-items-container');
    const checkoutList = document.getElementById('checkout-items-list');
    const floatingCount = document.getElementById('cart-item-count');
    const floatingPrice = document.getElementById('cart-total-price');
    const checkoutTotal = document.getElementById('chk-final-total');
    const floatingBar = document.getElementById('floating-cart');

    let totalQty = 0;
    let totalPrice = 0;
    
    cartContainer.innerHTML = '';
    checkoutList.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#777; padding:20px;">Your basket is empty</p>';
        floatingBar.classList.add('hidden');
    } else {
        floatingBar.classList.remove('hidden');
        cart.forEach(item => {
            totalQty += item.qty;
            let itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            // Sidebar Cart Item HTML (With +/- to remove)
            cartContainer.innerHTML += `
                <div class="sidebar-item">
                    <div style="flex:1">
                        <strong style="display:block; margin-bottom:5px;">${item.name}</strong>
                        <div class="fp-card-qty-control" style="display:flex; width:auto;">
                            <button class="fp-card-qty-btn minus" onclick="updateSidebarQty('${item.name}', -1)">-</button>
                            <span class="fp-card-qty-display" style="width:30px;">${item.qty}</span>
                            <button class="fp-card-qty-btn plus" onclick="updateSidebarQty('${item.name}', 1)">+</button>
                        </div>
                    </div>
                    <strong style="margin-left:15px;">৳ ${itemTotal}</strong>
                </div>
            `;
            
            // Checkout Summary Item HTML
            checkoutList.innerHTML += `
                <div class="chk-item-row">
                    <span>${item.qty}x ${item.name}</span>
                    <span>৳ ${itemTotal}</span>
                </div>
            `;
        });
    }

    floatingCount.textContent = totalQty;
    floatingPrice.textContent = `Tk ${totalPrice}`;
    checkoutTotal.textContent = `Tk ${totalPrice}`;
}

// ==========================================
// 3. CART SIDEBAR & CHECKOUT TOGGLES
// ==========================================

function openFpSidebar() {
    document.getElementById('fp-sidebar-overlay').style.display = 'block';
    document.getElementById('fp-sidebar').style.right = '0';
}

function closeFpSidebar() {
    document.getElementById('fp-sidebar-overlay').style.display = 'none';
    document.getElementById('fp-sidebar').style.right = '-450px';
}

function openFullCheckout() {
    if(cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }
    closeFpSidebar();
    document.getElementById('full-checkout-page').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Disable background scroll
    
    // Ensure form view is visible and success view is hidden initially
    document.getElementById('checkout-form-view').style.display = 'block';
    document.getElementById('checkout-success-view').style.display = 'none';
}

function closeFullCheckout() {
    document.getElementById('full-checkout-page').style.display = 'none';
    document.body.style.overflow = 'auto'; // Enable background scroll
}

// ==========================================
// 4. ORDER SUCCESS & RESET (Image 1 Logic)
// ==========================================

function submitFinalOrder() {
    const name = document.getElementById('chk-name').value.trim();
    const phone = document.getElementById('chk-phone').value.trim();
    const address = document.getElementById('chk-address').value.trim();

    if(!name || !phone || !address) {
        showToast("Please fill in Name, Phone, and Address.");
        return;
    }

    // Hide form view, show success overlay
    document.getElementById('checkout-form-view').style.display = 'none';
    document.getElementById('checkout-success-view').style.display = 'flex';
}

// "Continue Exploring" / "Continue Dining" button logic
function resetToHome() {
    cart = []; // Empty the cart
    renderCart(); // Update UI
    renderMenuButtons(); // Reset menu buttons to "Add"
    closeFullCheckout(); // Close checkout panel
    
    // Clear checkout form inputs
    document.getElementById('chk-name').value = '';
    document.getElementById('chk-phone').value = '';
    document.getElementById('chk-address').value = '';
    
    // Scroll back to menu section
    window.location.href = '#menu';
}

// ==========================================
// 5. MENU FILTERING
// ==========================================

function filterMenu(category) {
    // Update active button
    document.querySelectorAll('.filter-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Show/Hide cards
    document.querySelectorAll('.product-item-card').forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==========================================
// 6. UTILITY FUNCTIONS
// ==========================================

// Chef Image Preview
function previewChefImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('chef-vera-img').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 25px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}
