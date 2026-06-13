// Global Shopping Basket State Array Array
let cart = [];

// ==================== Owner Live Image Photo Preview ====================
function previewOwnerImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('owner-profile-img').src = e.target.result;
            showToast("Founder's profile picture updated locally!");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==================== Menu Filter Tab Category Sorting ====================
function filterMenu(category) {
    // Active tabs class switching handle
    const tabs = document.querySelectorAll('.filter-tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Automatic element selection matcher based on standard parameters inline trigger
    const clickedTab = Array.from(tabs).find(t => t.getAttribute('onclick').includes(category));
    if (clickedTab) clickedTab.classList.add('active');

    // Product cards animation filtering view controller
    const cards = document.querySelectorAll('.product-item-card');
    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==================== Dynamic Live Pricing Selector via Dropdowns Options ====================
function updateDynamicPricing(selectEl) {
    const chosenPrice = selectEl.value;
    const card = selectEl.closest('.product-item-card');
    const priceDisplay = card.querySelector('.dynamic-render-price');
    if (priceDisplay) {
        priceDisplay.textContent = ' ৳ ' + chosenPrice;
        priceDisplay.setAttribute('data-base-price', chosenPrice);
    }
}

// ==================== Foodpanda Card Quantity Counter Handler (+/- Button) ====================
function updateQty(btn, change) {
    const input = btn.closest('.qty-selector').querySelector('.qty-input');
    let currentVal = parseInt(input.value) || 1;
    currentVal += change;
    if (currentVal < 1) currentVal = 1; // 1 er niche jabe na counter value
    input.value = currentVal;
}

// ==================== Add To Cart Main Functionality ====================
function addToCart(btn, itemName) {
    const card = btn.closest('.product-item-card');
    const variantSelect = card.querySelector('.variant-select');
    let variantText = '';
    
    if (variantSelect) {
        // Dropdown variations option display text cleanup filter
        variantText = variantSelect.options[variantSelect.selectedIndex].text.split('(')[0].trim();
    }
    
    const priceDisplay = card.querySelector('.dynamic-render-price');
    const priceValue = parseFloat(priceDisplay.getAttribute('data-base-price')) || 0;
    const qtyInput = card.querySelector('.qty-input');
    const qtyValue = parseInt(qtyInput.value) || 1;
    
    // Existing item variant checker in local checkout state array
    const existingIndex = cart.findIndex(item => item.name === itemName && item.variant === variantText);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += qtyValue;
    } else {
        cart.push({
            name: itemName,
            variant: variantText,
            price: priceValue,
            qty: qtyValue
        });
    }
    
    // Default item selection state card value resetting index back to 1
    qtyInput.value = 1;
    
    // Local storage sidebar viewport refreshing flow
    renderCartData();
    showToast(`${qtyValue}x ${itemName} added to your basket successfully!`);
}

// ==================== Foodpanda Basket Sidebar Visibility Toggle UI ====================
function toggleFpCart() {
    const panel = document.getElementById('fp-cart-sidebar');
    if (panel) {
        panel.classList.toggle('active');
    }
}

// ==================== Render Reactive Dynamic Cart Interface Renderer ====================
function renderCartData() {
    const body = document.getElementById('fp-cart-items-body');
    const countBadge = document.getElementById('fp-basket-count');
    const totalAmountDisplay = document.getElementById('fp-total-amount');
    
    if (!body) return;
    
    if (cart.length === 0) {
        body.innerHTML = '<div class="fp-empty-msg">Your basket is empty. Add delicious meals to start ordering!</div>';
        if (countBadge) countBadge.textContent = '0';
        if (totalAmountDisplay) totalAmountDisplay.textContent = '৳ 0';
        return;
    }
    
    let totalItems = 0;
    let totalSum = 0;
    let htmlContent = '';
    
    cart.forEach((item, index) => {
        const itemCost = item.price * item.qty;
        totalSum += itemCost;
        totalItems += item.qty;
        
        htmlContent += `
            <div class="fp-cart-item">
                <div class="fp-item-info">
                    <h4>${item.name}</h4>
                    ${item.variant ? `<p style="margin:2px 0; color:#666; font-size:13px;">${item.variant}</p>` : ''}
                    <div style="display:flex; align-items:center; gap:10px; margin-top:5px;">
                        <span style="font-size:14px; color:#555;">Qty: <strong>${item.qty}</strong></span>
                    </div>
                </div>
                <div style="text-align: right; display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                    <span class="fp-item-price" style="font-weight:700; color:#d70f64;">৳ ${itemCost}</span>
                    <button onclick="removeCartItem(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:14px;" title="Remove Item">
                        <i class="fa-solid fa-trash-can"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    body.innerHTML = htmlContent;
    if (countBadge) countBadge.textContent = totalItems;
    if (totalAmountDisplay) totalAmountDisplay.textContent = '৳ ' + totalSum;
}

// ==================== Remove Single Target Item from Basket Handler ====================
function removeCartItem(index) {
    if (index > -1 && index < cart.length) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        renderCartData();
        showToast(`Removed ${removedItem.name} from basket.`);
    }
}

// ==================== Dynamic Payment Method Type Select Control Card ====================
function selectFpPayment(type, element) {
    // Resetting states on current payment components fields
    const cards = document.querySelectorAll('.fp-pay-card');
    cards.forEach(c => {
        c.classList.remove('active');
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
    });
    
    // Highlight active card components node selection
    element.classList.add('active');
    const currentRadio = element.querySelector('input[type="radio"]');
    if (currentRadio) currentRadio.checked = true;
    
    // Secure Digital Mobile Wallet Verification component toggle container visibility
    const otpSection = document.getElementById('fp-otp-section');
    if (otpSection) {
        if (type === 'digital') {
            otpSection.style.display = 'block';
        } else {
            otpSection.style.display = 'none';
        }
    }
}

// ==================== Digital Mobile Wallet Gateway: Send OTP simulated action flow ====================
function handleFpSendOtp() {
    const walletNum = document.getElementById('fp-walletNumber').value.trim();
    const sendBtn = document.getElementById('fp-sendBtn');
    
    if (!walletNum) {
        showToast("Please enter a valid bKash or Nagad wallet number first!");
        return;
    }
    
    if (sendBtn.classList.contains('success')) {
        // Guard check if transaction system status verified already
        return;
    }
    
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    sendBtn.disabled = true;
    
    // Simulated asynchronous automated mock security transaction layer response timeout
    setTimeout(() => {
        sendBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> OTP Verified Successfully';
        sendBtn.classList.add('success');
        sendBtn.disabled = false;
        
        // Automated insertion simulated layout logic inside target security code input elements fields
        const boxesArea = document.getElementById('fp-otp-boxes-area');
        if (boxesArea) {
            boxesArea.style.display = 'block';
            const boxes = document.querySelectorAll('.fp-otp-box');
            boxes.forEach((b) => {
                b.value = Math.floor(Math.random() * 10);
                b.disabled = true;
                b.style.borderColor = '#27ae60';
            });
        }
        showToast("Simulated Digital Secure Payment Verified!");
    }, 1500);
}

// ==================== Manual Secure 4 Digit Input Focus Controller Shift ====================
function moveFpOtpFocus(current, nextIndex) {
    if (current.value.length >= 1) {
        const boxes = document.querySelectorAll('.fp-otp-box');
        if (boxes[nextIndex]) {
            boxes[nextIndex].focus();
        }
    }
}

// ==================== Final Confirm Checkout Submit Form Validation Handler ====================
function submitFpOrder() {
    if (cart.length === 0) {
        showToast("Your basket is empty. Add items before checking out!");
        return;
    }
    
    const name = document.getElementById('fp-custName').value.trim();
    const phone = document.getElementById('fp-custPhone').value.trim();
    const address = document.getElementById('fp-custAddress').value.trim();
    
    if (!name || !phone || !address) {
        showToast("Please complete your delivery details: Name, Phone, and Address!");
        return;
    }
    
    // Digital validation gate keeper filter options state
    const selectedPayOption = document.querySelector('input[name="fp_payment"]:checked').value;
    if (selectedPayOption === 'digital') {
        const sendBtn = document.getElementById('fp-sendBtn');
        if (!sendBtn.classList.contains('success')) {
            showToast("Please complete and verify your Mobile Wallet OTP before finalizing delivery!");
            return;
        }
    }
    
    // Trigger animated order confirmation overlay modal screen
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'flex';
        successModal.classList.add('active');
    }
    
    // Resetting structural logic arrays data objects state back to pristine empty structure state
    cart = [];
    renderCartData();
    
    // Clear targeted visual information inputs field items forms
    document.getElementById('fp-custName').value = '';
    document.getElementById('fp-custPhone').value = '';
    document.getElementById('fp-custAddress').value = '';
    
    // Revert checkout default components selection structure
    const codLabel = document.querySelector('.fp-pay-card');
    if (codLabel) selectFpPayment('cod', codLabel);
    
    // Reset verification views panels status
    const walletInput = document.getElementById('fp-walletNumber');
    if (walletInput) walletInput.value = '';
    
    const boxesArea = document.getElementById('fp-otp-boxes-area');
    if (boxesArea) boxesArea.style.display = 'none';
    
    const sendBtn = document.getElementById('fp-sendBtn');
    if (sendBtn) {
        sendBtn.innerHTML = 'Send OTP';
        sendBtn.classList.remove('success');
        sendBtn.disabled = false;
    }
}

// ==================== Success Confirmation Modal Action Dismiss Window Window ====================
function closeOrderSuccess() {
    const successModal = document.getElementById('orderSuccessOverlay');
    if (successModal) {
        successModal.style.display = 'none';
        successModal.classList.remove('active');
    }
}

// ==================== Global Toast Notification System Handler ====================
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show-alert');
    setTimeout(() => {
        toast.classList.remove('show-alert');
    }, 3000);
}

// ==================== Keyboard Accessibility Escape Listener Event Mode Dismiss ====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const panel = document.getElementById('fp-cart-sidebar');
        if (panel) panel.classList.remove('active');
        closeOrderSuccess();
    }
});

// ==================== App Application Setup Lifecycle State Initializer ====================
document.addEventListener('DOMContentLoaded', function() {
    renderCartData();
});
