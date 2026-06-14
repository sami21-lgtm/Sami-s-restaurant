// developed by Md. Emtiaz Hossain Sami 2026
let cartArray = [];
let globalSelectedPayment = 'cod';

// ড্রপডাউন থেকে দাম চেঞ্জ হলে কার্ডের দাম আপডেট করবে
function updateCardPricing(dropdownNode) {
    if (!dropdownNode) return;
    const livePriceValue = dropdownNode.value;
    const parentCard = dropdownNode.closest('.food-item-card');
    if (!parentCard) return;

    const targetPriceSpan = parentCard.querySelector('.item-live-price');
    const targetActionWrapper = parentCard.querySelector('.fp-card-action-wrapper');
    const selectedTextLabel = dropdownNode.options[dropdownNode.selectedIndex].text.split('-')[0].trim();

    if (targetPriceSpan) targetPriceSpan.textContent = `৳ ${livePriceValue}`;
    if (targetActionWrapper) {
        targetActionWrapper.dataset.price = livePriceValue;
        targetActionWrapper.dataset.activeVariant = selectedTextLabel;
    }
}

// Add বাটনে ক্লিক করলে ফুডপান্ডার মত কার্টে যোগ হবে এবং সাইডবার ওপেন হবে
function addItemToCart(buttonNode) {
    const dataWrapper = buttonNode.closest('.fp-card-action-wrapper');
    if (!dataWrapper) return;

    const baseName = dataWrapper.getAttribute('data-base-name');
    const variantExtension = dataWrapper.dataset.activeVariant || 
                             dataWrapper.closest('.food-item-card').querySelector('.variant-select').options[0].text.split('-')[0].trim();
    
    const uniqueFullName = `${baseName} (${variantExtension})`;
    const fixedCalculatedPrice = parseInt(dataWrapper.dataset.price) || 0;

    let searchMatchItem = cartArray.find(element => element.fullName === uniqueFullName);
    if (searchMatchItem) {
        searchMatchItem.quantity += 1;
    } else {
        cartArray.push({ fullName: uniqueFullName, baseName: baseName, price: fixedCalculatedPrice, quantity: 1 });
    }

    synchronizeInterfaceState();
    recalculateMainCartSystem();
    toggleSidebar(true);
}

// সাইডবার বা মেনুর ভেতর থেকে + / - করলে কাজ করবে
function modifyItemQuantity(itemUniqueName, arithmeticFactor) {
    let matchedIndex = cartArray.findIndex(element => element.fullName === itemUniqueName);
    if (matchedIndex !== -1) {
        cartArray[matchedIndex].quantity += arithmeticFactor;
        if (cartArray[matchedIndex].quantity <= 0) {
            cartArray.splice(matchedIndex, 1);
        }
    }
    synchronizeInterfaceState();
    recalculateMainCartSystem();
}

// ডিলিট আইকন দিয়ে বাস্কেট থেকে রিমুভ করা
function removeEntireLineItem(itemUniqueName) {
    cartArray = cartArray.filter(element => element.fullName !== itemUniqueName);
    synchronizeInterfaceState();
    recalculateMainCartSystem();
}

function changeQty(btnNode, amount) {
    const wrapper = btnNode.closest('.fp-card-action-wrapper');
    if (!wrapper) return;
    const baseName = wrapper.getAttribute('data-base-name');
    const variantExtension = wrapper.dataset.activeVariant || 
                             wrapper.closest('.food-item-card').querySelector('.variant-select').options[0].text.split('-')[0].trim();
    const fullUniqueKeyName = `${baseName} (${variantExtension})`;
    modifyItemQuantity(fullUniqueKeyName, amount);
}

// UI আপডেট
function synchronizeInterfaceState() {
    document.querySelectorAll('.fp-card-action-wrapper').forEach(wrapper => {
        const bName = wrapper.getAttribute('data-base-name');
        const vExt = wrapper.dataset.activeVariant || 
                     wrapper.closest('.food-item-card').querySelector('.variant-select').options[0].text.split('-')[0].trim();
        const matchedKey = `${bName} (${vExt})`;

        const matchingCartEntry = cartArray.find(el => el.fullName === matchedKey);
        const addButton = wrapper.querySelector('.fp-card-add-btn');
        const stepperControlGroup = wrapper.querySelector('.fp-card-qty-control');
        const textDisplay = wrapper.querySelector('.fp-card-qty-display');

        if (matchingCartEntry) {
            if (addButton) addButton.style.display = 'none';
            if (stepperControlGroup) stepperControlGroup.style.display = 'flex';
            if (textDisplay) textDisplay.textContent = matchingCartEntry.quantity;
        } else {
            if (addButton) addButton.style.display = 'block';
            if (stepperControlGroup) stepperControlGroup.style.display = 'none';
        }
    });
}

// মূল বিলিং হিসাব
function recalculateMainCartSystem() {
    const sidebarScroller = document.getElementById('fp-cart-items-container');
    const checkoutSummaryArea = document.getElementById('checkout-invoice-items-list');
    const floatingMainContainer = document.getElementById('floating-cart');

    let aggregateQuantity = 0, combinedSubtotalPrice = 0;
    
    if (sidebarScroller) sidebarScroller.innerHTML = '';
    if (checkoutSummaryArea) checkoutSummaryArea.innerHTML = '';

    if (cartArray.length === 0) {
        if (sidebarScroller) {
            sidebarScroller.innerHTML = `
                <div style="text-align:center; padding:50px 10px; color:#aaa;">
                    <i class="fa-solid fa-basket-shopping" style="font-size:35px; margin-bottom:10px;"></i>
                    <p style="font-weight:600; font-size:14px;">Your current basket layer is empty.</p>
                </div>`;
        }
        if (floatingMainContainer) floatingMainContainer.classList.add('hidden');
        toggleSidebar(false);
    } else {
        if (floatingMainContainer) floatingMainContainer.classList.remove('hidden');

        cartArray.forEach(entry => {
            aggregateQuantity += entry.quantity;
            let inlineRowTotalPrice = entry.price * entry.quantity;
            combinedSubtotalPrice += inlineRowTotalPrice;

            if (sidebarScroller) {
                sidebarScroller.innerHTML += `
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f9f9f9; padding:12px 0;">
                        <div style="flex:1;">
                            <span style="font-size:14px; font-weight:700; display:block; color:#222;">${entry.fullName}</span>
                            <div class="fp-card-qty-control" style="margin-top:6px; width:fit-content; height:28px;">
                                <button class="fp-card-qty-btn" onclick="modifyItemQuantity('${entry.fullName}', -1)">-</button>
                                <span class="fp-card-qty-display" style="font-size:13px; line-height:26px;">${entry.quantity}</span>
                                <button class="fp-card-qty-btn" onclick="modifyItemQuantity('${entry.fullName}', 1)">+</button>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <strong style="font-size:14px; color:#111;">৳${inlineRowTotalPrice}</strong>
                            <button style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:14px;" onclick="removeEntireLineItem('${entry.fullName}')"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>`;
            }

            if (checkoutSummaryArea) {
                checkoutSummaryArea.innerHTML += `
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px;">
                        <span><strong>${entry.quantity}x</strong> ${entry.fullName}</span>
                        <strong>৳${inlineRowTotalPrice}</strong>
                    </div>`;
            }
        });
    }

    let deliveryFeeCost = 32;
    let setupVatCost = 19;
    let aggregateFinalInvoiceTotal = combinedSubtotalPrice > 0 ? (combinedSubtotalPrice + deliveryFeeCost + setupVatCost) : 0;

    document.getElementById('cart-item-count').textContent = aggregateQuantity;
    document.getElementById('cart-total-price').textContent = `৳ ${combinedSubtotalPrice}`;
    document.getElementById('fp-sidebar-subtotal').textContent = `৳ ${combinedSubtotalPrice}`;
    document.getElementById('chk-subtotal').textContent = `৳ ${combinedSubtotalPrice}`;
    document.getElementById('chk-final-total').textContent = `৳ ${aggregateFinalInvoiceTotal}`;
}

// সাইডবার ওপেন ও ক্লোজ
function toggleSidebar(shouldDisplay) {
    const layoutOverlay = document.getElementById('fp-sidebar-overlay');
    const targetSidebarPanel = document.getElementById('fp-sidebar');
    if (layoutOverlay) layoutOverlay.style.display = shouldDisplay ? 'block' : 'none';
    if (targetSidebarPanel) targetSidebarPanel.style.right = shouldDisplay ? '0px' : '-450px';
}

function openCheckoutView() {
    if (cartArray.length === 0) return;
    toggleSidebar(false);
    const viewTargetPage = document.getElementById('full-checkout-page');
    if (viewTargetPage) viewTargetPage.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCheckoutView() {
    const viewTargetPage = document.getElementById('full-checkout-page');
    if (viewTargetPage) viewTargetPage.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function setPaymentMethod(cardDomElement, codeValue) {
    document.querySelectorAll('.payment-card-option').forEach(element => element.classList.remove('active-opt'));
    cardDomElement.classList.add('active-opt');
    const coreRadio = cardDomElement.querySelector('input[type="radio"]');
    if (coreRadio) coreRadio.checked = true;
    globalSelectedPayment = codeValue;
}

function triggerOrderSubmission() {
    const currentName = document.getElementById('fp-custName').value.trim();
    const currentPhone = document.getElementById('fp-custPhone').value.trim();
    const currentAddress = document.getElementById('fp-custAddress').value.trim();

    if (!currentName || !currentPhone || !currentAddress) {
        alert("⚠️ Please provide all missing delivery address fields first!");
        return;
    }

    document.getElementById('checkout-success-view').style.display = 'flex';
}

function wipeDataAndResetHome() {
    cartArray = [];
    recalculateMainCartSystem();
    synchronizeInterfaceState();
    closeCheckoutView();

    document.getElementById('fp-custName').value = '';
    document.getElementById('fp-custPhone').value = '';
    document.getElementById('fp-custAddress').value = '';
    document.getElementById('checkout-success-view').style.display = 'none';
}

// ক্যাটাগরি ফিল্টার লজিক (Breakfast, Lunch, Dinner etc.)
function filterCategory(targetCategoryString) {
    const currentEvent = window.event;
    document.querySelectorAll('.menu-filter-tab').forEach(tab => tab.classList.remove('active'));
    if (currentEvent && currentEvent.target) currentEvent.target.classList.add('active');

    document.querySelectorAll('.food-item-card').forEach(cardElement => {
        if (targetCategoryString === 'all' || cardElement.classList.contains(targetCategoryString)) {
            cardElement.style.display = 'flex';
        } else {
            cardElement.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    synchronizeInterfaceState();
    recalculateMainCartSystem();
});
