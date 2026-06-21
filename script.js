import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNb8N2Kp5jdzy15vet0KxQgj3QeBvYIhI",
  authDomain: "logintechtank.firebaseapp.com",
  databaseURL: "https://logintechtank-default-rtdb.firebaseio.com",
  projectId: "logintechtank",
  storageBucket: "logintechtank.firebasestorage.app",
  messagingSenderId: "726773869569",
  appId: "1:726773869569:web:d570b3f29c2638e05ba400",
  measurementId: "G-EBSJ3YVY2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Mock Products Fallback
const mockProducts = [
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

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- Firebase Auth Logic ---

// Listen to Auth State
onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;

    if (user) {
        // User is signed in
        authBtn.textContent = "Sign Out";
        authBtn.href = "#";
        authBtn.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = "index.html";
            }).catch((error) => console.error("Sign out error", error));
        };
    } else {
        // User is signed out
        authBtn.textContent = "Sign In";
        authBtn.href = "login.html";
        authBtn.onclick = null;
    }
});

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Login successful!");
                window.location.href = "index.html";
            })
            .catch((error) => {
                alert("Login failed: " + error.message);
            });
    });
}

// Handle Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Account created successfully!");
                window.location.href = "index.html";
            })
            .catch((error) => {
                alert("Registration failed: " + error.message);
            });
    });
}


// --- Products & Cart Logic ---

// Fetch Products from Firestore (or use fallback if DB empty/not setup)
async function fetchProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        if (!querySnapshot.empty) {
            products = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
            console.log("Firestore is empty! Automatically uploading mock data to Firestore...");
            // Automatically seed the Firestore database
            for (const p of mockProducts) {
                await setDoc(doc(db, "products", p.id.toString()), p);
            }
            products = mockProducts;
            console.log("Upload complete! Refresh your Firebase Console to see the data.");
        }
    } catch (error) {
        console.error("Error fetching from Firestore, using mock data", error);
        products = mockProducts;
    }
    
    // Once fetched, render
    renderProducts();
    renderProductDetail();
}

// Helper to update cart UI
function updateCartCount() {
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartLink.textContent = `Cart (${totalItems})`;
    }
}

// Add to Cart (Global function attached to window so inline HTML onclick can use it)
window.addToCart = function(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    const existing = cart.find(item => item.id == productId);
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
                <div class="product-price">$${Number(product.price).toFixed(2)}</div>
                <button class="btn btn-outline" style="width: 100%;" onclick="addToCart('${product.id}')">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// Render Product Details
function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const product = products.find(p => p.id == productId);

    if (!product) {
        container.innerHTML = '<p>Product not found.</p>';
        return;
    }

    container.innerHTML = `
        <div class="product-detail-grid">
            <img src="${product.image}" alt="${product.title}" class="product-detail-img">
            <div class="product-detail-info">
                <h1 class="product-detail-title">${product.title}</h1>
                <div class="product-detail-price">$${Number(product.price).toFixed(2)}</div>
                <p class="product-detail-desc">${product.description}</p>
                <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
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
                    <p style="color: var(--text-muted);">$${Number(item.price).toFixed(2)} x ${item.quantity}</p>
                </div>
            </div>
            <button class="btn btn-outline" style="padding: 0.5rem 1rem;" onclick="removeFromCart('${item.id}')">Remove</button>
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
    cart = cart.filter(item => item.id != productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
    
    // Only fetch products if we are on a page that needs them
    if (document.getElementById('featured-products') || document.getElementById('shop-products') || document.getElementById('product-detail-container') || document.getElementById('admin-product-list')) {
        fetchProducts();
    }
});

// --- Admin Logic ---

// Render Admin Products
function renderAdminProducts() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;

    if (products.length === 0) {
        list.innerHTML = '<p>No products found.</p>';
        return;
    }

    list.innerHTML = products.map(p => `
        <div class="admin-item">
            <div class="admin-item-info">
                <img src="${p.image}" class="admin-item-img">
                <div>
                    <strong>${p.title}</strong>
                    <div style="color: var(--text-muted);">$${Number(p.price).toFixed(2)}</div>
                </div>
            </div>
            <button class="btn btn-outline" style="color: red; border-color: red;" onclick="deleteProduct('${p.id}')">Delete</button>
        </div>
    `).join('');
}

// Global function to delete product
window.deleteProduct = async function(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        await deleteDoc(doc(db, "products", productId.toString()));
        alert("Product deleted!");
        fetchProducts(); // Refresh list
    } catch (error) {
        alert("Error deleting product: " + error.message);
    }
}

// Global hook into fetchProducts to also render admin list
const originalFetchProducts = fetchProducts;
window.fetchProducts = async function() {
    await originalFetchProducts();
    renderAdminProducts();
}

// Handle Add Product Form
const addProductForm = document.getElementById('add-product-form');
if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('admin-title').value;
        const price = document.getElementById('admin-price').value;
        const image = document.getElementById('admin-image').value;
        const description = document.getElementById('admin-desc').value;

        try {
            await addDoc(collection(db, "products"), {
                title,
                price: parseFloat(price),
                image,
                description
            });
            alert("Product added successfully!");
            addProductForm.reset();
            fetchProducts(); // Refresh list
        } catch (error) {
            alert("Error adding product: " + error.message);
        }
    });
}

