let basketItemsTracker = {}; 
let totalCartItemsCount = 0;
let totalCartPriceAmount = 0;

// ================= HANDLERS FOR FILE UPLOAD PREVIEW =================
function previewOwnerImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('owner-profile-img').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ================= DYNAMIC CATEGORY SWAP FILTER =================
function filterMenu(categoryName) {
    const items = document.querySelectorAll('.product-item-card');
    const tabs = document.querySelectorAll('.filter-tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    if (event && event.target) { 
        event.target.classList.add('active'); 
    }
    
    items.forEach(item => {
        if (categoryName === 'all') {
            item.style.display = 'block';
        } else {
            if (item.classList.contains(categoryName)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// ================= CARD CALCULATION MULTIPLIERS =================
function updateDynamicPricing(selectElement) {
    let cardBody = selectElement.closest('.product-card-body');
    let priceDisplay = cardBody.querySelector('.dynamic-render-price');
    let inputField = cardBody.querySelector('.qty-input');
    
    let newBasePrice = parseInt(selectElement.value);
    priceDisplay.setAttribute('data-base-price', newBasePrice);
    
    let currentQty = parseInt(inputField.value);
    let totalValue = newBasePrice * currentQty;
    
    priceDisplay.textContent = "৳" + totalValue;
}

function updateQty(buttonElement, change) {
    let cardBody = buttonElement.closest('.product-card-body');
    let inputField = cardBody.querySelector('.qty-input');
    let priceDisplay = cardBody.querySelector('.dynamic-render-price');
    
    let currentQty = parseInt(inputField.value);
    let newQty = currentQty + change;
    
    if (newQty >= 1) {
        inputField.value = newQty;
        let basePrice = parseInt(priceDisplay.getAttribute('data-base-price'));
        let totalValue = basePrice * newQty;
        priceDisplay.textContent = "৳" + totalValue;
    }
}

// ================= BASKET AGGREGATION =================
function addToCart(buttonElement, itemName) {
    let cardBody = buttonElement.closest('.product-card-body');
    let quantity = parseInt(cardBody.querySelector('.qty-input').value);
    let priceText = cardBody.querySelector('.dynamic-render-price').textContent;
    let itemTotalPrice = parseInt(priceText.replace('৳', ''));
    
    if (basketItemsTracker[itemName]) {
        basketItemsTracker[itemName].qty += quantity;
        basketItemsTracker[itemName].totalPrice += itemTotalPrice;
    } else {
        basketItemsTracker[itemName] = {
            qty: quantity,
            totalPrice: itemTotalPrice
        };
    }
    
    totalCartItemsCount += quantity;
    totalCartPriceAmount += itemTotalPrice;
    
    document.getElementById('cart-item-count').textContent = totalCartItemsCount;
    document.getElementById('cart-total-price').textContent = "৳" + totalCartPriceAmount.toLocaleString();
    
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.remove('hidden');
    }
    
    const toast = document.getElementById("toast-notification");
    if (toast) {
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> Added <strong>${quantity}x ${itemName}</strong> to basket`;
        toast.className = "show";
        setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 2000);
    }
}

// ================= CHECKOUT MODAL LOGIC =================
function toggleCheckoutModal(showState) {
    const modal = document.getElementById('checkoutModal');
    if (showState) {
        const itemsListContainer = document.getElementById('checkout-items-list');
        itemsListContainer.innerHTML = ''; 
        
        for (let name in basketItemsTracker) {
            let record = basketItemsTracker[name];
            let row = document.createElement('div');
            row.className = 'summary-item-row';
            row.innerHTML = `<span>${name} <strong>(x${record.qty})</strong></span> <span>৳${record.totalPrice}</span>`;
            itemsListContainer.appendChild(row);
        }
        
        document.getElementById('summary-total-val').textContent = "৳" + totalCartPriceAmount.toLocaleString();
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

function handleOrderSubmission(event) {
    event.preventDefault();
    
    const clientName = document.getElementById('custName').value;
    const clientPhone = document.getElementById('custPhone').value;
    
    alert(`Success! Thank you ${clientName}.\nYour order value worth ৳${totalCartPriceAmount} is recorded. We are dispatching confirmation shortly to ${clientPhone}.`);
    
    basketItemsTracker = {};
    totalCartItemsCount = 0;
    totalCartPriceAmount = 0;
    
    document.getElementById('cart-item-count').textContent = '0';
    document.getElementById('cart-total-price').textContent = '৳0';
    document.getElementById('floating-cart').classList.add('hidden');
    document.getElementById('orderCheckoutForm').reset();
    toggleCheckoutModal(false);
}

// ================= BOOKING MODALS TRIGGERS =================
function openBooking() { 
    document.getElementById('bookingModal').style.display = 'flex'; 
}

function closeBooking() { 
    document.getElementById('bookingModal').style.display = 'none'; 
}

window.onclick = function(event) {
    const bModal = document.getElementById('bookingModal');
    const cModal = document.getElementById('checkoutModal');
    if (event.target == bModal) bModal.style.display = "none";
    if (event.target == cModal) cModal.style.display = "none";
}
