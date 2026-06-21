// Mock Product Data
const products = [
    {
        id: 1,
        title: "Minimalist Leather Backpack",
        price: 129.00,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Crafted from premium full-grain leather, this minimalist backpack is designed for both urban commutes and weekend getaways. Features a padded laptop sleeve and hidden security pockets."
    },
    {
        id: 2,
        title: "Ceramic Pour-Over Coffee Set",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Elevate your morning ritual with our handcrafted ceramic pour-over set. Includes a dripper and matching carafe, finished in a matte charcoal glaze."
    },
    {
        id: 3,
        title: "Matte Black Desk Lamp",
        price: 89.00,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "A sleek, fully adjustable desk lamp featuring touch-sensitive dimming and a warm LED light source, perfect for late-night productivity."
    },
    {
        id: 4,
        title: "Linen Lounge Chair",
        price: 349.00,
        image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Combining Scandinavian design with ultimate comfort, this lounge chair features an ash wood frame and durable, breathable linen upholstery."
    }
];

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Helper to update cart UI
function updateCartCount() {
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartLink.textContent = `Cart (${totalItems})`;
    }
}

// Add to Cart
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart!');
}

// Render Products (Home & Shop)
function renderProducts() {
    const container = document.getElementById('featured-products') || document.getElementById('shop-products');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-img-wrapper">
                <a href="product.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.title}" class="product-img">
                </a>
            </div>
            <div class="product-info">
                <a href="product.html?id=${product.id}">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-outline" style="width: 100%;" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Render Product Details
function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = '<p>Product not found.</p>';
        return;
    }

    container.innerHTML = `
        <div class="product-detail-grid">
            <img src="${product.image}" alt="${product.title}" class="product-detail-img">
            <div class="product-detail-info">
                <h1 class="product-detail-title">${product.title}</h1>
                <div class="product-detail-price">$${product.price.toFixed(2)}</div>
                <p class="product-detail-desc">${product.description}</p>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `;
}

// Render Cart
function renderCart() {
    const container = document.getElementById('cart-container');
    const summary = document.getElementById('cart-summary');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. <a href="shop.html" style="color:var(--primary); text-decoration:underline;">Go shopping</a></p>';
        if (summary) summary.style.display = 'none';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div>
                    <h4>${item.title}</h4>
                    <p style="color: var(--text-muted);">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
            </div>
            <button class="btn btn-outline" style="padding: 0.5rem 1rem;" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    if (summary) {
        summary.style.display = 'block';
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalEl.textContent = total.toFixed(2);
    }
}

// Remove from Cart
window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderProducts();
    renderProductDetail();
    renderCart();
});
