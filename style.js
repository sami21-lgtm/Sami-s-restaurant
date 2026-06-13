let cartState = [];
let otpCountdownTimerInterval = null;

// Profile Photo live custom updates inside browser
function previewOwnerImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('owner-profile-img').src = e.target.result;
            showToast("Profile image updated successfully!");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateQty(btn, change) {
    const qtyInput = btn.parentElement.querySelector('.qty-input');
    let currentQty = parseInt(qtyInput.value) || 1;
    currentQty += change;
    if (currentQty < 1) currentQty = 1;
    qtyInput.value = currentQty;
}

function updateDynamicPricing(selectElem) {
    const card = selectElem.closest('.product-item-card');
    const priceSpan = card.querySelector('.dynamic-render-price');
    const selectedPrice = selectElem.value;
    priceSpan.textContent = "৳" + selectedPrice;
    priceSpan.setAttribute('data-base-price', selectedPrice);
}

function filterMenu(category) {
    const tabs = document.querySelectorAll('.filter-tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const products = document.querySelectorAll('.product-item-card');
    products.forEach(product => {
        if (category === 'all' || product.classList.contains(category)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function addToCart(btn, itemName) {
    const card = btn.closest('.product-item-card');
    const qty = parseInt(card.querySelector('.qty-input').value) || 1;
    const price = parseFloat(card.querySelector('.dynamic-render-price').getAttribute('data-base-price'));
    const variantSelect = card.querySelector('.variant-select');
    
    let variantName = "";
    if (variantSelect) {
        variantName = variantSelect.options[variantSelect.selectedIndex].text.split('(')[0].trim();
    }

    const uniqueId = itemName + "_" + variantName;
    const existingIndex = cartState.findIndex(item => item.id === uniqueId);
    
    if (existingIndex > -1) {
        cartState[existingIndex].qty += qty;
    } else {
        cartState.push({ id: uniqueId, name: itemName, variant: variantName, price: price, qty: qty });
    }

    card.querySelector('.qty-input').value = 1;
    renderCartUI();
    showToast(`${itemName} added to your basket.`);
}

function deleteCartItem(uniqueId) {
    const itemIndex = cartState.findIndex(item => item.id === uniqueId);
    if (itemIndex > -1) {
        const name = cartState[itemIndex].name;
        cartState.splice(itemIndex, 1);
        renderCartUI();
        showToast(`${name} removed from basket.`);
    }
}

function renderCartUI() {
    const countSpan = document.getElementById('cart-item-count');
    const priceSpan = document.getElementById('cart-total-price');
    const floatingBar = document.getElementById('floating-cart');
    const listContainer = document.getElementById('checkout-items-list');
    const summaryTotalVal = document.getElementById('summary-total-val');

    let totalItemsCount = 0;
    let grandTotalPrice = 0;
    let htmlContent = "";

    cartState.forEach(item => {
        const rowTotalPrice = item.price * item.qty;
        totalItemsCount += item.qty;
        grandTotalPrice += rowTotalPrice;

        htmlContent += `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>${item.variant ? item.variant + ' &times; ' : ''}${item.qty}</span>
                </div>
                <div class="cart-item-right-side">
                    <span class="cart-item-price">৳${rowTotalPrice}</span>
                    <button type="button" class="btn-delete-cart-item" onclick="deleteCartItem('${item.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    });

    countSpan.textContent = totalItemsCount;
    priceSpan.textContent = "৳" + grandTotalPrice;
    summaryTotalVal.textContent = "৳" + grandTotalPrice;
    listContainer.innerHTML = htmlContent || `<p style='text-align:center; color:#999; padding:20px 0;'>Your basket is empty.</p>`;

    if (totalItemsCount > 0) {
        floatingBar.classList.remove('hidden');
    } else {
        floatingBar.classList.add('hidden');
        toggleCheckoutModal(false);
    }
}

function toggleCheckoutModal(show) {
    document.getElementById('checkoutModal').style.display = show ? 'flex' : 'none';
}

function toggleMfsField() {
    const paymentVal = document.querySelector('input[name="paymentOpt"]:checked').value;
    const mfsBox = document.getElementById('mfs-account-field');
    const mfsLabel = document.getElementById('mfs-label');
    const mfsInput = document.getElementById('mfsNumber');

    if (paymentVal === 'bkash' || paymentVal === 'nagad') {
        mfsBox.classList.remove('hidden');
        mfsInput.required = true;
        mfsLabel.textContent = paymentVal === 'bkash' ? "bKash Personal Number *" : "Nagad Personal Number *";
    } else {
        mfsBox.classList.add('hidden');
        mfsInput.required = false;
        mfsInput.value = "";
    }
}

// Order Form Interceptor Logic
function handleOrderSubmission(event) {
    event.preventDefault();
    const paymentMethod = document.querySelector('input[name="paymentOpt"]:checked').value;

    // COD হলে ওটিপি ছাড়াই সরাসরি অর্ডার হয়ে যাবে
    if (paymentMethod === 'cod') {
        finalizeOrderDatabaseRecord("Cash on Delivery");
    } else {
        // bKash অথবা Nagad হলে গেটওয়ে ওটিপি স্ক্রিন চালু হবে
        triggerOtpVerificationFlow(paymentMethod);
    }
}

// ================= STYLISH OTP TRIGGER & LOGIC =================
function triggerOtpVerificationFlow(provider) {
    const otpModal = document.getElementById('otpModal');
    const brandingHeader = document.getElementById('otp-branding-header');
    const brandText = document.getElementById('otp-brand-text');
    const cardContainer = document.querySelector('.otp-card-theme');

    // ইনপুট বক্সের আগের ওটিপি ডেটা রিসেট
    document.querySelectorAll('.otp-digit').forEach(input => input.value = "");

    // ওয়ালেটের ব্র্যান্ডিং থিম অ্যাপ্লাই
    brandingHeader.className = "otp-brand-logo-container"; 
    cardContainer.className = "modal-card-container otp-card-theme";

    if (provider === 'bkash') {
        brandingHeader.classList.add('bg-bkash-gateway');
        cardContainer.classList.add('focus-bkash');
        brandText.innerHTML = `<span style="font-weight:900;">bKash</span> Payment`;
    } else if (provider === 'nagad') {
        brandingHeader.classList.add('bg-nagad-gateway');
        cardContainer.classList.add('focus-nagad');
        brandText.innerHTML = `<span style="font-weight:900;">Nagad</span> Checkout`;
    }

    // ওটিপি উইন্ডো ডিসপ্লে অন
    otpModal.style.display = 'flex';
    document.querySelectorAll('.otp-digit')[0].focus();

    // ২ মিনিটের লাইভ কাউন্টডাউন টাইমার রান
    startOtpCountdownTimer(119);
}

// ওটিপি টাইপ করার সাথে সাথে পরের বক্সে অটোমেটিক ফোকাস যাওয়ার লজিক
function moveToNextOtpInput(currentInput) {
    if (currentInput.value.length >= 1) {
        const next = currentInput.nextElementSibling;
        if (next && next.classList.contains('otp-digit')) {
            next.focus();
        }
    }
}

// ব্যাকস্পেস (Backspace) দিলে আগের বক্সে ফিরে যাওয়ার লজিক
function handleOtpBackspace(currentInput, event) {
    if (event.key === "Backspace" && currentInput.value.length === 0) {
        const prev = currentInput.previousElementSibling;
        if (prev && prev.classList.contains('otp-digit')) {
            prev.focus();
        }
    }
}

function startOtpCountdownTimer(durationSeconds) {
    clearInterval(otpCountdownTimerInterval);
    const display = document.getElementById('otp-countdown');
    let timer = durationSeconds;

    otpCountdownTimerInterval = setInterval(() => {
        let minutes = parseInt(timer / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(otpCountdownTimerInterval);
            display.textContent = "Code Expired";
        }
    }, 1000);
}

function closeOtpModal() {
    clearInterval(otpCountdownTimerInterval);
    document.getElementById('otpModal').style.display = 'none';
}

// ওটিপি সাবমিশন চেকআপ
function validateEnteredOtpCode() {
    let code = "";
    document.querySelectorAll('.otp-digit').forEach(input => code += input.value);

    if (code.length < 4) {
        alert("Please fill all 4 digits of the OTP code!");
        return;
    }

    // ডেমো সিস্টেমে যেকোনো ৪ ডিজিট টাইপ করলেই ভেরিফাইড হবে
    closeOtpModal();
    const paymentMethod = document.querySelector('input[name="paymentOpt"]:checked').value;
    const mfsNumber = document.getElementById('mfsNumber').value;
    
    finalizeOrderDatabaseRecord(`${paymentMethod.toUpperCase()} Online Wallet (${mfsNumber})`);
}

// ফাইনাল অর্ডার কনফার্মেশন অ্যালার্ট মেসেজ
function finalizeOrderDatabaseRecord(paymentInfo) {
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;

    alert(`🎉 Order Placed Successfully!\n\nCustomer: ${name}\nPhone: ${phone}\nAddress: ${address}\nPayment system: ${paymentInfo}`);
    
    // কার্ট খালি ও রিসেট করা
    cartState = [];
    renderCartUI();
    document.getElementById('orderCheckoutForm').reset();
    toggleMfsField();
}

function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = msg;
    toast.classList.add('show-alert');
    setTimeout(() => { toast.classList.remove('show-alert'); }, 2800);
}
