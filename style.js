// Global State management for shopping cart
let shoppingCartState = [];

// DOM Element Referencing variables
const cartSidebarElement = document.getElementById('cart-sidebar-window');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items-display-list');
const cartTotalPriceTag = document.getElementById('cart-total-price-tag');
const cartBadgeCount = document.getElementById('cart-badge-count');
const checkoutModalPopup = document.getElementById('checkout-modal-popup');

// Event Hook listeners for operational UI
openCartBtn.addEventListener('click', () => cartSidebarElement.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartSidebarElement.classList.remove('active'));

// Cart manipulation business operations
function addItemToCart(itemName, itemPrice) {
    const analyticalExistingItemIndex = shoppingCartState.findIndex(entry => entry.name === itemName);
    
    if(analyticalExistingItemIndex > -1) {
        shoppingCartState[analyticalExistingItemIndex].quantity += 1;
    } else {
        shoppingCartState.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }
    synchronizeCartUI();
    cartSidebarElement.classList.add('active'); // Pull up drawer immediately upon selection
}

function adjustmentItemQuantity(itemName, deltaAmount) {
    const targetedItemIndex = shoppingCartState.findIndex(entry => entry.name === itemName);
    if(targetedItemIndex > -1) {
        shoppingCartState[targetedItemIndex].quantity += deltaAmount;
        if(shoppingCartState[targetedItemIndex].quantity <= 0) {
            shoppingCartState.splice(targetedItemIndex, 1);
        }
        synchronizeCartUI();
    }
}

function synchronizeCartUI() {
    // Count overall total dynamic inventory contents
    let cumulativeItemCounter = 0;
    let netAggregateBillAmount = 0;
    
    if(shoppingCartState.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-message">Your shopping basket is completely empty.</p>`;
    } else {
        cartItemsContainer.innerHTML = '';
        shoppingCartState.forEach(item => {
            cumulativeItemCounter += item.quantity;
            netAggregateBillAmount += (item.price * item.quantity);
            
            const renderedRowNode = document.createElement('div');
            renderedRowNode.className = 'cart-item';
            renderedRowNode.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>৳ ${item.price * item.quantity}</p>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="adjustmentItemQuantity('${item.name}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="adjustmentItemQuantity('${item.name}', 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(renderedRowNode);
        });
    }
    
    // Apply variables neatly back over tracking parameters
    cartBadgeCount.innerText = cumulativeItemCounter;
    cartTotalPriceTag.innerText = '৳ ' + netAggregateBillAmount;
}

// Functional processing handlers for Modal interfaces
function openCheckoutProcess() {
    if(shoppingCartState.length === 0) {
        alert('Your food basket is currently empty. Add dishes prior to attempting checkout!');
        return;
    }
    checkoutModalPopup.classList.add('active');
}

function closeCheckoutProcess() {
    checkoutModalPopup.classList.remove('active');
}

function handleCheckoutSubmit(eventEvent) {
    eventEvent.preventDefault();
    const locationAddressField = document.getElementById('chk-address').value;
    const chosenPaymentRadioOption = document.querySelector('input[name="payment"]:checked').value;
    
    alert(`🎉 Splendid Choice! Order successfully placed via ${chosenPaymentRadioOption}.\nDelivery allocated to address: ${locationAddressField}.\nOur delivery specialist is processing your tracking parameter!`);
    
    // Purge existing variables resetting overall state machine safely
    shoppingCartState = [];
    synchronizeCartUI();
    closeCheckoutProcess();
    cartSidebarElement.classList.remove('active');
    document.getElementById('order-checkout-form').reset();
}

function handleReservationSubmit(eventEvent) {
    eventEvent.preventDefault();
    const prospectiveGuestName = document.getElementById('res-name').value;
    const chosenTargetedDate = document.getElementById('res-date').value;
    
    alert(`🍽️ Table Reserved Successfully!\nGreetings ${prospectiveGuestName}, your booking confirmation parameter has been verified for date: ${chosenTargetedDate}.\nA formal configuration SMS has been transmitted to your provided device line.`);
    document.getElementById('table-reservation-form').reset();
}
