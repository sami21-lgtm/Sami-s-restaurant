// ==================== Global Cart Array ====================
let cart = []; 

// ==================== 1. Click "Add" -> Open Checkout Directly ====================
function addToCart(btnElement, itemName) {
    let price = 0;
    let image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120'; // Default image

    // Card theke price ar image dhorar try korbe
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

    // Cart-e item add ba update kora
    let existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ id: Date.now(), name: itemName, price: price || 0, qty: 1, image: image });
    }

    // Data render kore sathe sathe Checkout/Basket open kora!
    renderCartData();
    openCheckoutSidebar(); // <--- Ei function direct sidebar open kore dibe!
}

// ==================== 2. Checkout Panel Data Rendering ====================
function renderCartData() {
    const itemsContainer = document.getElementById('fp-cart-items-container');
    const totalBadge = document.getElementById('fp-sticky-total');

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    // Apnar delivery fee thakle ekhane add hobe
    let grandTotal = subtotal > 0 ? subtotal : 0; 

    if (totalBadge) totalBadge.textContent = 'Tk ' + grandTotal;

    // Checkout/Basket er bhetor item dekhano ar sathe DELETE option
    if (itemsContainer) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = `<p style="text-align:center; color:#888; padding: 20px;">Your basket is empty. Please add items.</p>`;
        } else {
            let itemsHtml = '';
            cart.forEach((item, index) => {
                itemsHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:12px; border-radius:8px; margin-bottom:12px; border:1px solid #eee;">
                        <div style="display:flex; gap:12px; align-items:center;">
                            <img src="${item.image}" style="width:45px; height:45px; border-radius:8px; object-fit:cover;">
                            <div>
                                <strong style="font-size:14px; display:block; color:#333;">${item.name} (x${item.qty})</strong>
                                <span style="color:#e21b70; font-weight:bold; font-size:14px;">Tk ${item.price * item.qty}</span>
                            </div>
                        </div>
                        
                        <button onclick="deleteItem(${index})" style="background:none; border:none; color:#ff4757; cursor:pointer; font-size:18px;" title="Delete Item">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;
            });
            itemsContainer.innerHTML = itemsHtml;
        }
    }
}

// ==================== 3. Item Delete Logic ====================
function deleteItem(index) {
    cart.splice(index, 1); // Delete item from array
    renderCartData(); // Update panel
    
    // Jodi shob delete kore dey, tahole panel auto close hoye jabe
    if (cart.length === 0) {
        closeCheckoutSidebar();
    }
}

// ==================== 4. Modal / Sidebar Open & Close Logic ====================
function openCheckoutSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.style.setProperty('right', '0px', 'important');
    if (overlay) overlay.style.setProperty('display', 'block', 'important');
}

function closeCheckoutSidebar() {
    const sidebar = document.getElementById('fp-sidebar');
    const overlay = document.getElementById('fp-sidebar-overlay');
    if (sidebar) sidebar.style.setProperty('right', '-450px', 'important');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
}

// Payment method select logic
function selectFpPayment(method, element) {
    document.querySelectorAll('.fp-pay-card').forEach(c => c.classList.remove('active'));
    if(element) element.classList.add('active');
    
    // Digital payment select korle (bKash/Nagad) otp section dekhabe
    const otpSection = document.getElementById('fp-otp-section');
    if(otpSection) {
        otpSection.style.display = (method === 'digital') ? 'block' : 'none';
    }
}

// ==================== 5. Final Order Confirmation ====================
function submitFpOrder() {
    if (cart.length === 0) {
        alert("Please add at least one item to order.");
        return;
    }
    
    // Docx html theke inputs (Name, Address, Phone) check kora
    const name = document.getElementById('fp-custName');
    const phone = document.getElementById('fp-custPhone');
    const address = document.getElementById('fp-custAddress');
    
    if (name && address && (!name.value || !address.value || !phone.value)) {
        alert("⚠️ Please fill in your Full Name, Phone, and Delivery Address!");
        return;
    }

    // Success Message
    const successOverlay = document.getElementById('orderSuccessOverlay');
    if (successOverlay) {
        successOverlay.style.display = 'block';
    } else {
        alert("🎉 Order Placed Successfully!");
    }

    // Reset everything
    cart = [];
    renderCartData();
    closeCheckoutSidebar();
    
    // Clear form data
    if(name) name.value = '';
    if(phone) phone.value = '';
    if(address) address.value = '';
}

function closeOrderSuccess() {
    const successOverlay = document.getElementById('orderSuccessOverlay');
    if (successOverlay) successOverlay.style.display = 'none';
}

// Run mapping inside initialization state setup
document.addEventListener("DOMContentLoaded", () => {
    renderCartData();
});
