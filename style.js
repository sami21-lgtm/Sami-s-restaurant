// --- Cart System Setup ---
let cart = [];

// Image Upload Preview (Owner Profile)
function previewOwnerImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('owner-profile-img').src = e.target.result;
            showToast("Profile image updated successfully!");
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Menu Filtering Logic
function filterMenu(category) {
    // Button active state toggle
    const buttons = document.querySelectorAll('.filter-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter Items
    const items = document.querySelectorAll('.product-item-card');
    items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Dynamic Pricing based on selection
function updateDynamicPricing(selectElement) {
    const selectedPrice = selectElement.value;
    const cardBody = selectElement.closest('.product-card-body');
    const priceDisplay = cardBody.querySelector('.dynamic-render-price');
    
    priceDisplay.innerText = '৳' + selectedPrice;
    priceDisplay.setAttribute('data-base-price', selectedPrice);
}

// Quantity Selector (-/+)
function updateQty(btn, change) {
    const input = btn.parentElement.querySelector('.qty-input');
    let currentValue = parseInt(input.value);
    
    let newValue = currentValue + change;
    if (newValue < 1) newValue = 1; // Minimum quantity is 1
    
    input.value = newValue;
}

// Add Item To Cart
function addToCart(btn, itemName) {
    const cardBody = btn.closest('.product-card-body');
    const priceText = cardBody.querySelector('.dynamic-render-price').getAttribute('data-base-price');
    const itemPrice = parseFloat(priceText);
    const itemQty = parseInt(cardBody.querySelector('.qty-input').value);

    // Check if item already exists in cart with same price
    const existingItem = cart.find(item => item.name === itemName && item.price === itemPrice);
    
    if (existingItem) {
        existingItem.qty += itemQty;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            qty: itemQty
        });
    }

    updateCartUI();
    showToast(`${itemName} added to your basket!`);
    
    // Reset quantity input to 1 after adding
    cardBody.querySelector('.qty-input').value = 1;
}

// Update Cart Floating Bar UI
function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += (item.price * item.qty);
    });

    document.getElementById('cart-item-count').innerText = totalItems;
    document.getElementById('cart-total-price').innerText = '৳' + totalPrice;

    const floatingCart = document.getElementById('floating-cart');
    if (totalItems > 0) {
        floatingCart.classList.remove('hidden');
    } else {
        floatingCart.classList.add('hidden');
    }
}

// Show/Hide Checkout Modal
function toggleCheckoutModal(show) {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = show ? 'flex' : 'none';

    if (show) {
        renderCheckoutItems();
    }
}

// Render items inside the checkout modal
function renderCheckoutItems() {
    const listContainer = document.getElementById('checkout-items-list');
    listContainer.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888;">Your basket is empty.</p>';
    } else {
        cart.forEach((item) => {
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;
            
            listContainer.innerHTML += `
                <div class="summary-item-row" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span>${item.qty}x ${item.name}</span>
                    <span style="font-weight:bold;">৳${itemTotal}</span>
                </div>
            `;
        });
    }

    document.getElementById('summary-total-val').innerText = '৳' + grandTotal;
}

// Handle Checkout Order Submission
function handleOrderSubmission(event) {
    event.preventDefault(); // Prevent page reload
    
    if(cart.length === 0) {
        showToast("Please add items to your cart first!");
        return;
    }

    showToast("Order Placed Successfully! We will contact you soon.");
    
    // Reset Everything
    cart = [];
    updateCartUI();
    toggleCheckoutModal(false);
    event.target.reset(); // Clear form fields
}

// Handle Table Reservation
function handleReservation(event) {
    event.preventDefault();
    showToast("Table Reservation Confirmed! See you soon.");
    event.target.reset(); // Clear reservation form
}

// Toast Notification Engine
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.innerText = message;
    toast.className = "show-alert";
    
    // Remove class after 3 seconds
    setTimeout(() => {
        toast.className = toast.className.replace("show-alert", "");
    }, 3000);
}
