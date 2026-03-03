// Enhanced PCLIGHT ZONE JavaScript - With Auth, Search, Wishlists, Reviews

// Check user authentication
function checkUserStatus() {
    const user = JSON.parse(localStorage.getItem('pclightzone_user'));
    const authButtons = document.getElementById('authButtons');
    const userLink = document.getElementById('userLink');

    if (user && authButtons && userLink) {
        authButtons.style.display = 'none';
        userLink.style.display = 'flex';
        document.getElementById('userDisplayName').textContent = user.firstName;
    }
}

// Shopping Cart System (Original)
let cart = JSON.parse(localStorage.getItem('pclightzone_cart')) || [];
const CART_STORAGE_KEY = 'pclightzone_cart';

function parsePrice(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeProduct(product) {
    if (!product || typeof product !== 'object') return null;
    const name = String(product.name || '').trim();
    if (!name) return null;
    return {
        id: product.id ?? Date.now(),
        name,
        price: product.price ?? '0 PHP',
        image: product.image || 'https://via.placeholder.com/60x60/1a1a2e/ffd700?text=Product'
    };
}

// Computer parts data
const partsData = {
    'Processors (CPU)': [
        { name: 'Intel Core i7-14700K', price: '22,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=CPU', specs: ['20 Cores', '5.6GHz Boost', 'LGA1700'] },
        { name: 'Intel Core i5-14600K', price: '16,800 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=CPU', specs: ['14 Cores', '5.3GHz Boost', 'LGA1700'] },
        { name: 'AMD Ryzen 9 7900X', price: '24,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=CPU', specs: ['12 Cores', '5.6GHz Boost', 'AM5'] },
        { name: 'AMD Ryzen 7 7800X3D', price: '26,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=CPU', specs: ['8 Cores', '3D V-Cache', 'AM5'] },
        { name: 'AMD Ryzen 5 7600', price: '12,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=CPU', specs: ['6 Cores', '5.1GHz Boost', 'AM5'] }
    ],
    'RAM Memory': [
        { name: 'Corsair Vengeance 32GB DDR5', price: '6,800 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=RAM', specs: ['DDR5', '6000MHz', '2x16GB'] },
        { name: 'G.SKILL Trident Z 32GB DDR5', price: '7,200 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=RAM', specs: ['DDR5', '6400MHz', '2x16GB'] },
        { name: 'Kingston Fury 16GB DDR5', price: '3,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=RAM', specs: ['DDR5', '5200MHz', '2x8GB'] },
        { name: 'TeamGroup T-Force 32GB DDR4', price: '4,200 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=RAM', specs: ['DDR4', '3600MHz', '2x16GB'] },
        { name: 'Crucial 16GB DDR4', price: '2,300 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=RAM', specs: ['DDR4', '3200MHz', '2x8GB'] }
    ],
    'Graphics Cards': [
        { name: 'NVIDIA RTX 4070 SUPER', price: '38,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=GPU', specs: ['12GB GDDR6X', 'Ray Tracing', 'DLSS 3'] },
        { name: 'NVIDIA RTX 4060 Ti', price: '27,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=GPU', specs: ['8GB GDDR6', 'Ray Tracing', 'DLSS 3'] },
        { name: 'AMD Radeon RX 7800 XT', price: '36,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=GPU', specs: ['16GB GDDR6', 'RDNA 3', 'FSR'] },
        { name: 'AMD Radeon RX 7700 XT', price: '32,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=GPU', specs: ['12GB GDDR6', 'RDNA 3', 'FSR'] },
        { name: 'NVIDIA RTX 3060', price: '19,800 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=GPU', specs: ['12GB GDDR6', 'Ray Tracing', 'DLSS'] }
    ],
    'Motherboards': [
        { name: 'ASUS ROG Strix B650-F', price: '15,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MB', specs: ['AM5', 'WiFi 6E', 'DDR5'] },
        { name: 'MSI MAG B760 Tomahawk', price: '12,800 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MB', specs: ['LGA1700', 'DDR5', 'PCIe 4.0'] },
        { name: 'Gigabyte Z790 Aorus Elite', price: '17,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MB', specs: ['LGA1700', 'DDR5', 'PCIe 5.0'] },
        { name: 'ASRock B550 Steel Legend', price: '9,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MB', specs: ['AM4', 'DDR4', 'PCIe 4.0'] },
        { name: 'MSI MPG X670E Carbon', price: '23,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MB', specs: ['AM5', 'DDR5', 'PCIe 5.0'] }
    ],
    'Keyboards': [
        { name: 'Logitech G Pro X', price: '6,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=KB', specs: ['Mechanical', 'GX Switch', 'RGB'] },
        { name: 'Razer BlackWidow V4', price: '7,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=KB', specs: ['Mechanical', 'Green Switch', 'RGB'] },
        { name: 'SteelSeries Apex 7', price: '6,200 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=KB', specs: ['Mechanical', 'OLED Display', 'RGB'] },
        { name: 'Keychron K8 Pro', price: '4,300 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=KB', specs: ['Wireless', 'Hot-Swap', 'RGB'] },
        { name: 'Royal Kludge RK61', price: '2,300 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=KB', specs: ['60%', 'Wireless', 'RGB'] }
    ],
    'Mouse': [
        { name: 'Logitech G Pro X Superlight', price: '6,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MOUSE', specs: ['Wireless', '63g', '25K DPI'] },
        { name: 'Razer Viper V2 Pro', price: '6,800 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MOUSE', specs: ['Wireless', '58g', '30K DPI'] },
        { name: 'SteelSeries Rival 5', price: '3,200 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MOUSE', specs: ['Wired', '18K DPI', '9 Buttons'] },
        { name: 'Logitech G502 Hero', price: '3,600 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MOUSE', specs: ['Wired', '25K DPI', 'Weights'] },
        { name: 'Razer DeathAdder V2', price: '2,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MOUSE', specs: ['Wired', '20K DPI', 'Ergonomic'] }
    ],
    'Monitors': [
        { name: 'ASUS TUF 27" 144Hz', price: '12,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MONITOR', specs: ['27"', '144Hz', 'IPS'] },
        { name: 'Gigabyte M27Q 170Hz', price: '15,500 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MONITOR', specs: ['27"', '170Hz', 'IPS'] },
        { name: 'LG UltraGear 32" 165Hz', price: '19,800 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MONITOR', specs: ['32"', '165Hz', 'QHD'] },
        { name: 'Samsung Odyssey G5', price: '14,700 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MONITOR', specs: ['27"', '144Hz', 'Curved'] },
        { name: 'AOC 24" 144Hz', price: '9,800 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=MONITOR', specs: ['24"', '144Hz', 'IPS'] }
    ],
    'Storage': [
        { name: 'Samsung 990 Pro 1TB', price: '6,900 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=SSD', specs: ['NVMe', '7450MB/s', 'PCIe 4.0'] },
        { name: 'WD Black SN850X 1TB', price: '6,400 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=SSD', specs: ['NVMe', '7300MB/s', 'PCIe 4.0'] },
        { name: 'Crucial P5 Plus 1TB', price: '5,400 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=SSD', specs: ['NVMe', '6600MB/s', 'PCIe 4.0'] },
        { name: 'Seagate Barracuda 2TB', price: '3,200 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=HDD', specs: ['HDD', '7200RPM', 'SATA'] },
        { name: 'WD Blue 1TB HDD', price: '2,300 PHP', image: 'https://via.placeholder.com/140x140/1a1a2e/ffd700?text=HDD', specs: ['HDD', '7200RPM', 'SATA'] }
    ]
};

// Search Functionality
const searchToggle = document.getElementById('searchToggle');
const searchModal = document.getElementById('searchModal');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const priceFilter = document.getElementById('priceFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchResults = document.getElementById('searchResults');

if (searchToggle) {
    searchToggle.addEventListener('click', () => {
        searchModal.classList.add('active');
        searchInput.focus();
    });
}

if (searchClose) {
    searchClose.addEventListener('click', () => {
        searchModal.classList.remove('active');
    });
}

if (searchInput) {
    searchInput.addEventListener('input', performSearch);
}

if (priceFilter) {
    priceFilter.addEventListener('change', () => {
        document.getElementById('priceValue').textContent = priceFilter.value;
        performSearch();
    });
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', performSearch);
}

function performSearch() {
    const query = searchInput.value.toLowerCase();
    const maxPrice = parseFloat(priceFilter.value);
    const category = categoryFilter.value;

    if (!query && !category) {
        searchResults.innerHTML = '<p class="empty-message">Start typing to search...</p>';
        return;
    }

    let results = [];

    // Search in all products
    Object.entries(partsData).forEach(([category, products]) => {
        products.forEach(product => {
            const price = parsePrice(product.price);
            if ((product.name.toLowerCase().includes(query) || !query) &&
                price <= maxPrice &&
                (!categoryFilter.value || category.includes(categoryFilter.value))) {
                results.push(product);
            }
        });
    });

    if (results.length === 0) {
        searchResults.innerHTML = '<p class="empty-message">No products found</p>';
        return;
    }

    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="addToCart(${parsePrice(product.price)}, '${product.name.replace(/'/g, "\\'")}')">
            <div style="font-size: 2rem; color: #ffd700; margin-bottom: 0.5rem;">
                <i class="fas fa-microchip"></i>
            </div>
            <p class="product-name">${product.name}</p>
            <p class="product-price">${product.price}</p>
        </div>
    `).join('');
}

// Wishlist Functionality
function getWishlist() {
    const user = JSON.parse(localStorage.getItem('pclightzone_user'));
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`pclightzone_wishlist_${user.id}`)) || [];
}

function addToWishlist(productName, productPrice) {
    const user = JSON.parse(localStorage.getItem('pclightzone_user'));
    if (!user) {
        showAlert('Please login to add items to wishlist', 'error');
        window.location.href = 'login.html';
        return;
    }

    const wishlist = getWishlist();
    const exists = wishlist.some(item => item.name === productName);

    if (exists) {
        showAlert('Item already in wishlist', 'error');
        return;
    }

    wishlist.push({
        id: Date.now(),
        name: productName,
        price: productPrice,
        addedDate: new Date().toISOString()
    });

    localStorage.setItem(`pclightzone_wishlist_${user.id}`, JSON.stringify(wishlist));
    showAlert('Added to wishlist!', 'success');
}

// Review System
const reviewModal = document.getElementById('reviewModal');
const reviewModalClose = document.getElementById('reviewModalClose');
const reviewForm = document.getElementById('reviewForm');
const starRating = document.getElementById('starRating');

if (reviewModalClose) {
    reviewModalClose.addEventListener('click', () => {
        reviewModal.classList.remove('active');
    });
}

// Initialize star rating in review modal
if (starRating) {
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        star.setAttribute('data-rating', i);
        star.addEventListener('click', () => {
            document.getElementById('ratingValue').value = i;
            document.querySelectorAll('#starRating i').forEach((s, index) => {
                if (index < i) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        starRating.appendChild(star);
    }
    // Set initial state
    document.querySelectorAll('#starRating i').forEach((s, index) => {
        if (index < 5) {
            s.classList.add('active');
        }
    });
}

function openReviewModal(productName) {
    const user = JSON.parse(localStorage.getItem('pclightzone_user'));
    if (!user) {
        showAlert('Please login to write a review', 'error');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('reviewProductName').value = productName;
    document.getElementById('reviewProductDisplay').textContent = productName;
    reviewModal.classList.add('active');
}

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('pclightzone_user'));
        if (!user) return;

        const productName = document.getElementById('reviewProductName').value;
        const rating = parseInt(document.getElementById('ratingValue').value);
        const text = document.getElementById('reviewText').value;

        const reviews = JSON.parse(localStorage.getItem(`pclightzone_reviews_${user.id}`)) || [];
        reviews.push({
            id: Date.now(),
            productName,
            rating,
            text,
            date: new Date().toISOString()
        });

        localStorage.setItem(`pclightzone_reviews_${user.id}`, JSON.stringify(reviews));
        showAlert('Review submitted successfully!', 'success');

        reviewForm.reset();
        reviewModal.classList.remove('active');
    });
}

// Alert Helper
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Cart Functions (keep existing functionality)
function updateCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartItems = document.getElementById('cartItems');

    if (cartCount) cartCount.textContent = cart.length;

    if (!cartItems || !cartEmpty) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.style.display = 'block';
        document.getElementById('cartSubtotal').textContent = '0 PHP';
        document.getElementById('cartTotal').textContent = '0 PHP';
        return;
    }

    cartEmpty.style.display = 'none';

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price}</p>
            </div>
            <button onclick="removeFromCart(${index})" class="remove-item">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    updateCartTotal();
}

function updateCartTotal() {
    let total = 0;
    cart.forEach(item => {
        total += parsePrice(item.price);
    });

    const subtotal = total;
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');

    if (cartSubtotal) cartSubtotal.textContent = subtotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }).replace('₱', '').trim() + ' PHP';
    if (cartTotal) cartTotal.textContent = subtotal.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }).replace('₱', '').trim() + ' PHP';
}

function addToCart(price, name) {
    const product = {
        id: Date.now(),
        name: name,
        price: price + ' PHP'
    };

    cart.push(product);
    updateCart();
    showAlert(`${name} added to cart!`, 'success');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Cart UI
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const cartSidebar = document.getElementById('cartSidebar');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.querySelector('.btn-checkout');

if (cartToggle) {
    cartToggle.addEventListener('click', () => {
        cartSidebar.style.left = '0';
    });
}

if (cartClose) {
    cartClose.addEventListener('click', () => {
        cartSidebar.style.left = '-100%';
    });
}

if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        if (confirm('Clear cart?')) {
            cart = [];
            updateCart();
            showAlert('Cart cleared', 'success');
        }
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('pclightzone_user'));
        if (!user) {
            showAlert('Please login to checkout', 'error');
            window.location.href = 'login.html';
            return;
        }

        if (cart.length === 0) {
            showAlert('Cart is empty', 'error');
            return;
        }

        // Create order
        const orders = JSON.parse(localStorage.getItem('pclightzone_orders')) || [];
        const total = cart.reduce((sum, item) => sum + parsePrice(item.price), 0);

        orders.push({
            id: Date.now(),
            userId: user.id,
            items: cart,
            total: total + ' PHP',
            status: 'pending',
            date: new Date().toISOString(),
            tracking: 'TRK' + Date.now()
        });

        localStorage.setItem('pclightzone_orders', JSON.stringify(orders));
        cart = [];
        updateCart();
        cartSidebar.style.left = '-100%';

        showAlert('Order placed successfully! Check your profile for details.', 'success');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    checkUserStatus();
});
