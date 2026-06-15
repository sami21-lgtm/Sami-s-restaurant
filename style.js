// Global cart array to hold products
let cart = [];

// Category filtering mechanism
function filterMenu(category) {
    const cards = document.querySelectorAll('.product-item-card');
    const tabs = document.querySelectorAll('.filter-tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    if(typeof event !== 'undefined' && event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Portion or option based price update
function updateDynamicPricing(selectElement) {
    const selectedPrice = selectElement.value;
    const container = selectElement.closest('.product-card-body') || selectElement.closest('.fp-action-wrapper');
    if(container) {
        const priceDisplay = container.querySelector('.dynamic-render-price');
        if (priceDisplay) {
            priceDisplay.innerText = ' ৳ ' + selectedPrice;
            priceDisplay.setAttribute('data-base-price', selectedPrice);
        }
    }
}

// Main Add to Cart engine (Foodpanda style button transformation)
function addToCart(btn, itemName) {
    const container = btn.closest('.product-card-body') || btn.closest('.fp-action-wrapper');
    if (!container) return;

    let priceText = "0";
    const priceEl = container.querySelector('.dynamic-render-price');
    if (priceEl) {
        priceText = priceEl.getAttribute('data-base-price') || priceEl.innerText.replace(/[^0-9]/g, '');
    }
    
    const itemPrice = parseFloat(priceText);

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === itemName && item.price === itemPrice);
    
    if (!existingItem) {
        cart.push({
            name: itemName,
            price: itemPrice,
            qty: 1
        });
    }

    // Transform the Add button into an inline counter selector layout
    transformToInlineCounter(container, itemName, itemPrice);
    
    // Global Cart UI Layout synchronization
    updateCartUI();
}

// Transforms the main card button into a foodpanda style dynamic toggler
function transformToInlineCounter(container, itemName, itemPrice) {
    const targetBox = container.querySelector('.product-item-action-box') || container;
    if (!targetBox) return;

    const currentItem = cart.find(item => item.name === itemName && item.price === itemPrice);
    const currentQty = currentItem ? currentItem.qty : 0;

    // Safely store the original layout inside a data attribute for resetting later
    if (!targetBox.getAttribute('data-original-html')) {
        targetBox.setAttribute('data-original-html', targetBox.innerHTML);
    }

    if (currentQty > 0) {
        targetBox.innerHTML = `
            <div class="fp-card-inline-selector">
                <button class="fp-inline-action-btn minus" onclick="updateMenuCardQty(this, '${itemName}', ${itemPrice}, -1)">-</button>
                <span class="fp-inline-qty-text">${currentQty}</span>
                <button class="fp-inline-action-btn plus" onclick="updateMenuCardQty(this, '${itemName}', ${itemPrice}, 1)">+</button>
            </div>
        `;
    } else {
        // Reset back to original Add Button if count drops to zero
        const originalHTML = targetBox.getAttribute('data-original-html');
        if (originalHTML) {
            targetBox.innerHTML = originalHTML;
            targetBox.removeAttribute('data-original-html');
        }
    }
}

// Handles calculations when + or - is clicked on the food card itself
function updateMenuCardQty(element, itemName, itemPrice, change) {
    const container = element.closest('.product-card-body') || element.closest('.fp-action-wrapper');
    const itemIndex = cart.findIndex(item => item.name === itemName && item.price === itemPrice);

    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        
        if (cart[itemIndex].qty < 1) {
            cart.splice(itemIndex, 1); // Remove item if count is less than 1
        }
    }

    // Refresh UI states
    transformToInlineCounter(container, itemName, itemPrice);
    updateCartUI();
}

// Synchronizes the bottom bar or basket panel layout
function updateCartUI() {
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += (item.price * item.qty);
    });

    // Update global variables if elements exist
    const countEl = document.getElementById('cart-item-count');
    const priceEl = document.getElementById('cart-total-price');
    const floatingCart = document.getElementById('floating-cart');

    if (countEl) countEl.innerText = totalItems;
    if (priceEl) priceEl.innerText = '৳' + totalPrice;

    if (floatingCart) {
        if (totalItems > 0) {
            floatingCart.classList.remove('hidden');
        } else {
            floatingCart.classList.add('hidden');
        }
    }

    // Automatically re-render items inside the active checkout layout
    renderCheckoutItems();
}

// Modal open/close controller engine
function toggleCheckoutModal(show) {
    const modal = document.getElementById('checkoutModal');
    if(modal) {
        modal.style.display = show ? 'flex' : 'none';
        if (show) {
            renderCheckoutItems();
        }
    }
}

// Renders foodpanda structural layout inside checkout basket list
function renderCheckoutItems() {
    const listContainer = document.getElementById('checkout-items-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888; padding: 20px 0;">Your basket is empty.</p>';
        const totalValEl = document.getElementById('summary-total-val');
        if (totalValEl) totalValEl.innerText = '৳0';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;
        
        listContainer.innerHTML += `
            <div class="fp-checkout-basket-row">
                <div class="fp-basket-info">
                    <span class="fp-basket-name">${item.name}</span>
                    <span class="fp-basket-price">৳${item.price}</span>
                </div>
                
                <!-- Foodpanda +/- Controls inside checkout box -->
                <div class="fp-basket-counter-controls">
                    <button type="button" class="fp-basket-ctrl-btn" onclick="modifyBasketItemQty(${index}, -1)">-</button>
                    <span class="fp-basket-ctrl-qty">${item.qty}</span>
                    <button type="button" class="fp-basket-ctrl-btn" onclick="modifyBasketItemQty(${index}, 1)">+</button>
                </div>

                <span class="fp-basket-item-total">৳${itemTotal}</span>
                
                <!-- Trash/Delete Action -->
                <button type="button" class="fp-basket-delete-icon" onclick="deleteBasketItem(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    });

    const totalValEl = document.getElementById('summary-total-val');
    if (totalValEl) totalValEl.innerText = '৳' + grandTotal;
}

// Basket modifications handler
function modifyBasketItemQty(index, change) {
    cart[index].qty += change;
    
    if (cart[index].qty < 1) {
        deleteBasketItem(index);
    } else {
        syncAllCardsUI();
        updateCartUI();
    }
}

// Basket single row delete handler
function deleteBasketItem(index) {
    cart.splice(index, 1);
    syncAllCardsUI();
    updateCartUI();
}

// Synchronizes menu-card button components if items are removed from checkout list directly
function syncAllCardsUI() {
    const activeCards = document.querySelectorAll('.product-card-body, .fp-action-wrapper');
    activeCards.forEach(container => {
        const actionBox = container.querySelector('.product-item-action-box') || container;
        if (actionBox && actionBox.getAttribute('data-original-html')) {
            // Find matched elements
            const btnEl = actionBox.querySelector('button[onclick*="addToCart"]');
            if (btnEl) {
                // Extract item details
                const onclickAttr = btnEl.getAttribute('onclick');
                const match = onclickAttr.match(/'([^']+)'/);
                if (match) {
                    const itemName = match[1];
                    let priceText = "0";
                    const priceEl = container.querySelector('.dynamic-render-price');
                    if (priceEl) {
                        priceText = priceEl.getAttribute('data-base-price') || priceEl.innerText.replace(/[^0-9]/g, '');
                    }
                    const itemPrice = parseFloat(priceText);
                    
                    // Trigger custom view transformation updates
                    transformToInlineCounter(container, itemName, itemPrice);
                }
            }
        }
    });
}

// Order submission handler
function handleOrderSubmission(event) {
    event.preventDefault();
    
    if(cart.length === 0) {
        showToast("Please add items to your cart first!");
        return;
    }

    showToast("Order Placed Successfully! We will contact you soon.");
    
    // Full system state reset
    cart = [];
    syncAllCardsUI();
    updateCartUI();
    toggleCheckoutModal(false);
    event.target.reset();
}

// Table reservation handler
function handleReservation(event) {
    event.preventDefault();
    showToast("Table Reservation Confirmed! See you soon.");
    event.target.reset();
}

// Alert notifications manager
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    if(toast) {
        toast.innerText = message;
        toast.className = "show-alert";
        setTimeout(() => {
            toast.className = toast.className.replace("show-alert", "");
        }, 3000);
    }
}
