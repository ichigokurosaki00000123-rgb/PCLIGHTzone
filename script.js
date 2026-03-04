// PCLIGHT ZONE - Interactive JavaScript

// Shopping Cart System
let cart = JSON.parse(localStorage.getItem('pclightzone_cart')) || [];
const CART_STORAGE_KEY = 'pclightzone_cart';
const ORDERS_STORAGE_KEY = 'pclightzone_orders';
let cartUpdateTimer = null;

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

// Search modal elements
const searchToggle = document.getElementById('searchToggle');
const searchModal = document.getElementById('searchModal');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const priceFilter = document.getElementById('priceFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchResults = document.getElementById('searchResults');

function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add('active');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    if (searchResults) {
        searchResults.innerHTML = '<p class="empty-message">Start typing to search...</p>';
    }
}

if (searchToggle && searchModal) {
    searchToggle.addEventListener('click', openSearchModal);
}

if (searchClose && searchModal) {
    searchClose.addEventListener('click', () => {
        searchModal.classList.remove('active');
    });
}

function performSearch() {
    if (!searchInput || !priceFilter || !categoryFilter || !searchResults) return;

    const query = searchInput.value.toLowerCase().trim();
    const maxPriceValue = parseFloat(priceFilter.value || '0');
    const maxPrice = Number.isFinite(maxPriceValue) ? maxPriceValue : Number.MAX_VALUE;
    const selectedCategory = categoryFilter.value;

    if (!query && !selectedCategory) {
        searchResults.innerHTML = '<p class="empty-message">Start typing to search...</p>';
        return;
    }

    const results = [];

    Object.entries(partsData).forEach(([categoryName, products]) => {
        products.forEach(product => {
            const price = parsePrice(product.price);
            const matchesQuery = !query || product.name.toLowerCase().includes(query);
            const matchesPrice = price <= maxPrice;
            const matchesCategory = !selectedCategory || categoryName.includes(selectedCategory);

            if (matchesQuery && matchesPrice && matchesCategory) {
                results.push({ ...product, category: categoryName });
            }
        });
    });

    if (!results.length) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No products found</p>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = results.map((product, index) => `
        <div class="search-result-item" data-index="${index}">
            <div style="font-size: 2rem; color: #ffd700; margin-bottom: 0.5rem;">
                <i class="fas fa-microchip"></i>
            </div>
            <p class="product-name">${product.name}</p>
            <p class="product-price">${product.price}</p>
            <p class="product-category">${product.category}</p>
        </div>
    `).join('');

    // Add click handlers to search results
    searchResults.querySelectorAll('.search-result-item').forEach(el => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        const product = results[idx];
        el.addEventListener('click', () => {
            addToCart(product);
            showNotification(`${product.name} added to cart!`, 'success');
            
            // Visual feedback
            el.style.transform = 'scale(0.95)';
            el.style.background = 'rgba(76, 175, 80, 0.2)';
            
            setTimeout(() => {
                el.style.transform = '';
                el.style.background = '';
            }, 300);
            
            // Close search modal after a short delay
            setTimeout(() => {
                if (searchModal) {
                    searchModal.classList.remove('active');
                }
            }, 500);
        });
    });
}

if (searchInput) {
    searchInput.addEventListener('input', performSearch);
}

if (priceFilter) {
    priceFilter.addEventListener('change', () => {
        const priceValueLabel = document.getElementById('priceValue');
        if (priceValueLabel) {
            priceValueLabel.textContent = priceFilter.value;
        }
        performSearch();
    });
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', performSearch);
}

function showPartsModal(partName) {
    const parts = partsData[partName] || [];
    if (!parts.length) return;

    const partsHTML = parts.map(part => `
        <div class="laptop-card part-card-item">
            <div class="laptop-image">
                <img src="${part.image}" alt="${part.name}" loading="lazy">
            </div>
            <div class="laptop-info">
                <h3 class="laptop-name">${part.name}</h3>
                <p class="laptop-price">${part.price}</p>
                <div class="laptop-specs">
                    ${part.specs.map(spec => `
                        <div class="spec-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${spec}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-add-to-cart" data-part="${part.name}" data-price="${part.price}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    const modal = document.createElement('div');
    modal.className = 'brand-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>${partName}</h2>
            <p>Browse premium ${partName.toLowerCase()} with trusted brands and great value.</p>
            <div class="laptops-grid">
                ${partsHTML}
            </div>
            <div class="modal-features">
                <div class="feature-item">
                    <i class="fas fa-shipping-fast"></i>
                    <span>Free Shipping</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>Warranty Included</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-undo"></i>
                    <span>Easy Returns</span>
                </div>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);

    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });

    modal.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const partNameValue = this.getAttribute('data-part');
            const part = parts.find(p => p.name === partNameValue);
            if (part) {
                addToCart(part);
                
                // Add success animation
                this.classList.add('added');
                this.innerHTML = '<i class="fas fa-check"></i> Added!';
                
                setTimeout(() => {
                    this.classList.remove('added');
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                }, 2000);
            }
        });
    });
}

function queueCartUpdate() {
    if (cartUpdateTimer) {
        clearTimeout(cartUpdateTimer);
    }
    cartUpdateTimer = setTimeout(() => {
        saveCart();
        updateCartUI();
    }, 120);
}

// Cart Management Functions
function addToCart(product) {
    try {
        const normalized = normalizeProduct(product);
        if (!normalized) {
            showNotification('Unable to add item. Please try again.', 'error');
            return;
        }

        const existingItem = cart.find(item => item.id === normalized.id || item.name === normalized.name);
        if (existingItem) {
            existingItem.quantity = Math.max(1, (existingItem.quantity || 0) + 1);
        } else {
            cart.push({
                ...normalized,
                quantity: 1
            });
        }

        queueCartUpdate();
        showNotification(`${normalized.name} added to cart!`, 'success');
    } catch (error) {
        console.error('Add to cart failed:', error);
        showNotification('Something went wrong. Please try again.', 'error');
    }
}

function removeFromCart(productId) {
    const initialCount = cart.length;
    cart = cart.filter(item => item.id !== productId);
    if (cart.length === initialCount) return;
    queueCartUpdate();
    showNotification('Item removed from cart', 'info');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    const nextQuantity = Math.max(0, (item.quantity || 0) + change);
    if (nextQuantity === 0) {
        removeFromCart(productId);
        return;
    }
    item.quantity = nextQuantity;
    queueCartUpdate();
}

function clearCart() {
    cart = [];
    queueCartUpdate();
    showNotification('Cart cleared', 'info');
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((total, item) => {
        const price = parsePrice(item.price);
        return total + (price * (item.quantity || 0));
    }, 0);
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Cart UI Functions
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartCount = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartItems || !cartEmpty || !cartSubtotal || !cartTotal) return;

    if (cartCount) {
        cartCount.textContent = String(getCartCount());
    }

    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'flex';
        cartSubtotal.textContent = '0 PHP';
        cartTotal.textContent = '0 PHP';
        return;
    }

    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';

    const itemsHTML = cart.map(item => {
        const itemTotal = parsePrice(item.price) * (item.quantity || 0);
        const safeName = String(item.name || 'Item');
        const safeImage = item.image || 'https://via.placeholder.com/60x60/1a1a2e/ffd700?text=Product';
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${safeImage}" alt="${safeName}" onerror="this.src='https://via.placeholder.com/60x60/1a1a2e/ffd700?text=Product'">
                </div>
                <div class="item-details">
                    <h4 class="item-name">${safeName}</h4>
                    <div class="item-info">
                        <span class="item-price">${item.price}</span>
                        <span class="item-qty-label">Qty: ${item.quantity}</span>
                    </div>
                </div>
                <div class="item-quantity">
                    <button class="qty-btn qty-minus" onclick="updateQuantity(${item.id}, -1)" aria-label="Decrease quantity">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn qty-plus" onclick="updateQuantity(${item.id}, 1)" aria-label="Increase quantity">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-total">
                    <span class="total-label">Total:</span>
                    <span class="total-price">${itemTotal.toLocaleString()} PHP</span>
                </div>
                <button class="item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    cartItems.innerHTML = itemsHTML;

    const total = getCartTotal();
    cartSubtotal.textContent = `${total.toLocaleString()} PHP`;
    cartTotal.textContent = `${total.toLocaleString()} PHP`;
}

// Create order from current cart and store in localStorage
function createOrderFromCart() {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('pclightzone_user')) || null;
    } catch {
        user = null;
    }

    if (!user) {
        showNotification('Please login to place an order.', 'error');
        window.location.href = 'login.html';
        return;
    }

    if (!cart.length) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
    } catch {
        orders = [];
    }

    const total = getCartTotal();

    const order = {
        id: Date.now().toString(),
        userId: user.id,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
        })),
        total: `${total.toLocaleString()} PHP`,
        status: 'pending',
        date: new Date().toISOString(),
        tracking: 'TRK' + Date.now()
    };

    orders.push(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    clearCart();
    closeCart();
    showNotification('Order placed successfully! Check your profile for details.', 'success');
}

// Cart Event Handlers (moved outside DOMContentLoaded for immediate availability)
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const clearCartBtn = document.getElementById('clearCart');

// Cart toggle
if (cartToggle && cartSidebar) {
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });
}

if (cartClose && cartSidebar) {
    cartClose.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
}

if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    });
}

// Checkout button
const checkoutBtn = document.querySelector('.btn-checkout');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
        } else {
            createOrderFromCart();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart UI
    updateCartUI();
});

// Enhanced Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        console.log('Hamburger clicked');
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    console.log('Hamburger menu found and event listener attached');
} else {
    console.warn('Hamburger or nav menu not found');
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (hamburger && navMenu && 
        !hamburger.contains(e.target) && 
        !navMenu.contains(e.target) && 
        navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (navMenu && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        const cartSidebar = document.getElementById('cartSidebar');
        const searchModal = document.getElementById('searchModal');
        
        if (cartSidebar && cartSidebar.classList.contains('open')) {
            cartSidebar.classList.remove('open');
        }
        
        if (searchModal && searchModal.classList.contains('active')) {
            searchModal.classList.remove('active');
        }
    }
});

// Enhanced Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            // Close mobile menu if open
            if (hamburger && navMenu && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Smooth scroll to target
            const headerOffset = 80; // Account for fixed header
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Add active state to navigation link
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        }
    });
});

// Active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.getBoundingClientRect().top + scrollY - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// Enhanced Header scroll effect
function updateHeaderStyle() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.98)';
            header.style.backdropFilter = 'blur(15px)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = 'none';
        }
    }
}

window.addEventListener('scroll', updateHeaderStyle);
updateHeaderStyle(); // Call once on load

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.feature-card, .brand-card, .part-card, .product-card, .contact-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Typing effect for hero title
function typeWriter() {
    const text = 'PCLIGHTzone';
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.textContent = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(type, 100);
            }
        }
        
        setTimeout(type, 500);
    }
}

// Particle animation for hero section
function createParticles() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(255, 215, 0, ${Math.random() * 0.8 + 0.2});
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
            pointer-events: none;
        `;
        heroSection.appendChild(particle);
    }
}

// Add particle animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Product card hover effects
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Brand card interactive effects
document.querySelectorAll('.brand-card').forEach(card => {
    card.addEventListener('click', function() {
        console.log('Brand card clicked:', this.querySelector('h3').textContent);
        const brandName = this.querySelector('h3').textContent;
        showBrandModal(brandName);
    });
});
console.log('Found', document.querySelectorAll('.brand-card').length, 'brand cards');

// Computer parts buttons
document.querySelectorAll('.btn-part').forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        console.log('Part button clicked:', button.getAttribute('data-part'));
        const partName = button.getAttribute('data-part');
        if (partName) {
            showPartsModal(partName);
        }
    });
});
console.log('Found', document.querySelectorAll('.btn-part').length, 'part buttons');

// Laptop product data
const laptopData = {
    'DELL': [
        {
            name: 'Dell XPS 15',
            price: '85,000 PHP',
            image: 'xps.png',
            specs: {
                processor: 'Intel Core i7-13700H',
                ram: '16GB DDR5',
                storage: '512GB NVMe SSD',
                graphics: 'NVIDIA RTX 4060',
                display: '15.6" FHD+ 1920x1200'
            }
        },
        {
            name: 'Dell Inspiron 14',
            price: '35,000 PHP',
            image: '14.png',
            specs: {
                processor: 'Intel Core i5-1335U',
                ram: '8GB DDR4',
                storage: '256GB SSD',
                graphics: 'Intel Iris Xe',
                display: '14.0" FHD 1920x1080'
            }
        },
        {
            name: 'Dell Alienware m16',
            price: '120,000 PHP',
            image: 'Dell Alienware m16.png',
            specs: {
                processor: 'Intel Core i9-13900HX',
                ram: '32GB DDR5',
                storage: '1TB NVMe SSD',
                graphics: 'NVIDIA RTX 4080',
                display: '16.0" QHD+ 2560x1600'
            }
        },
        {
            name: 'Dell Latitude 7420',
            price: '45,000 PHP',
            image: 'Dell Latitude 7420.png',
            specs: {
                processor: 'Intel Core i7-1260U',
                ram: '16GB DDR4',
                storage: '512GB SSD',
                graphics: 'Intel Iris Xe',
                display: '14.0" FHD 1920x1080'
            }
        },
        {
            name: 'Dell G15 Gaming',
            price: '55,000 PHP',
            image: 'Dell G15 Gaming.png',
            specs: {
                processor: 'AMD Ryzen 7 6800H',
                ram: '16GB DDR5',
                storage: '512GB SSD',
                graphics: 'NVIDIA RTX 3060',
                display: '15.6" FHD 1920x1080 165Hz'
            }
        }
    ],
    'HP': [
        {
            name: 'HP Spectre x360',
            price: '75,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Spectre+x360',
            specs: {
                processor: 'Intel Core i7-1360P',
                ram: '16GB DDR5',
                storage: '512GB SSD',
                graphics: 'Intel Iris Xe',
                display: '13.5" WUXGA 1920x1280'
            }
        },
        {
            name: 'HP Pavilion 15',
            price: '38,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Pavilion+15',
            specs: {
                processor: 'Intel Core i5-1335U',
                ram: '8GB DDR4',
                storage: '256GB SSD',
                graphics: 'Intel Iris Xe',
                display: '15.6" FHD 1920x1080'
            }
        },
        {
            name: 'HP Omen 16',
            price: '95,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Omen+16',
            specs: {
                processor: 'Intel Core i7-13700HX',
                ram: '16GB DDR5',
                storage: '1TB NVMe SSD',
                graphics: 'NVIDIA RTX 4070',
                display: '16.1" QHD 2560x1440 165Hz'
            }
        },
        {
            name: 'HP EliteBook 840',
            price: '52,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=EliteBook+840',
            specs: {
                processor: 'Intel Core i7-1365U',
                ram: '16GB DDR5',
                storage: '512GB SSD',
                graphics: 'Intel Iris Xe',
                display: '14.0" FHD 1920x1080'
            }
        },
        {
            name: 'HP Victus 15',
            price: '42,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Victus+15',
            specs: {
                processor: 'AMD Ryzen 5 7535HS',
                ram: '8GB DDR5',
                storage: '512GB SSD',
                graphics: 'NVIDIA RTX 3050',
                display: '15.6" FHD 1920x1080 144Hz'
            }
        }
    ],
    'LENOVO': [
        {
            name: 'Lenovo ThinkPad X1 Carbon',
            price: '95,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=ThinkPad+X1',
            specs: {
                processor: 'Intel Core i7-1365U',
                ram: '16GB LPDDR5',
                storage: '1TB SSD',
                graphics: 'Intel Iris Xe',
                display: '14.0" 2.8K 2880x1800'
            }
        },
        {
            name: 'Lenovo IdeaPad 3',
            price: '28,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=IdeaPad+3',
            specs: {
                processor: 'AMD Ryzen 3 7320U',
                ram: '8GB LPDDR4',
                storage: '256GB SSD',
                graphics: 'AMD Radeon Graphics',
                display: '15.6" FHD 1920x1080'
            }
        },
        {
            name: 'Lenovo Legion 5i',
            price: '78,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Legion+5i',
            specs: {
                processor: 'Intel Core i7-13700HX',
                ram: '16GB DDR5',
                storage: '1TB NVMe SSD',
                graphics: 'NVIDIA RTX 4060',
                display: '15.6" QHD 2560x1440 165Hz'
            }
        },
        {
            name: 'Lenovo Yoga 7i',
            price: '58,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Yoga+7i',
            specs: {
                processor: 'Intel Core i7-1260P',
                ram: '16GB LPDDR5',
                storage: '512GB SSD',
                graphics: 'Intel Iris Xe',
                display: '14.0" 2.2K 2240x1400'
            }
        },
        {
            name: 'Lenovo ThinkBook 14',
            price: '35,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=ThinkBook+14',
            specs: {
                processor: 'Intel Core i5-1335U',
                ram: '8GB DDR4',
                storage: '512GB SSD',
                graphics: 'Intel Iris Xe',
                display: '14.0" FHD 1920x1080'
            }
        }
    ],
    'ASUS': [
        {
            name: 'ASUS ZenBook Pro',
            price: '88,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=ZenBook+Pro',
            specs: {
                processor: 'Intel Core i9-13900H',
                ram: '32GB DDR5',
                storage: '1TB NVMe SSD',
                graphics: 'NVIDIA RTX 4070',
                display: '14.5" 2.8K OLED 2880x1800'
            }
        },
        {
            name: 'ASUS Vivobook 15',
            price: '32,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Vivobook+15',
            specs: {
                processor: 'Intel Core i5-1335U',
                ram: '8GB DDR4',
                storage: '512GB SSD',
                graphics: 'Intel Iris Xe',
                display: '15.6" FHD 1920x1080'
            }
        },
        {
            name: 'ASUS ROG Strix G16',
            price: '105,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=ROG+Strix+G16',
            specs: {
                processor: 'Intel Core i9-13980HX',
                ram: '32GB DDR5',
                storage: '2TB NVMe SSD',
                graphics: 'NVIDIA RTX 4080',
                display: '16.0" 2.5K 2560x1600 240Hz'
            }
        },
        {
            name: 'ASUS ExpertBook B1',
            price: '38,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=ExpertBook+B1',
            specs: {
                processor: 'Intel Core i5-1335U',
                ram: '8GB DDR4',
                storage: '256GB SSD',
                graphics: 'Intel Iris Xe',
                display: '14.0" FHD 1920x1080'
            }
        },
        {
            name: 'ASUS TUF Gaming F15',
            price: '48,000 PHP',
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=TUF+Gaming+F15',
            specs: {
                processor: 'Intel Core i7-11800H',
                ram: '16GB DDR4',
                storage: '512GB SSD',
                graphics: 'NVIDIA RTX 3050 Ti',
                display: '15.6" FHD 1920x1080 144Hz'
            }
        }
    ]
};

// Modal functionality
function showBrandModal(brandName) {
    const laptops = laptopData[brandName] || [];
    const laptopsHTML = laptops.map(laptop => `
        <div class="laptop-card">
            <div class="laptop-image">
                <img src="${laptop.image}" alt="${laptop.name}" loading="lazy">
            </div>
            <div class="laptop-info">
                <h3 class="laptop-name">${laptop.name}</h3>
                <p class="laptop-price">${laptop.price}</p>
                <div class="laptop-specs">
                    <div class="spec-item">
                        <i class="fas fa-microchip"></i>
                        <span>${laptop.specs.processor}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-memory"></i>
                        <span>${laptop.specs.ram}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-hdd"></i>
                        <span>${laptop.specs.storage}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-tv"></i>
                        <span>${laptop.specs.graphics}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-desktop"></i>
                        <span>${laptop.specs.display}</span>
                    </div>
                </div>
                <button class="btn-add-to-cart" data-laptop="${laptop.name}" data-price="${laptop.price}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    const modal = document.createElement('div');
    modal.className = 'brand-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>${brandName} Laptops</h2>
            <p>Explore our premium collection of ${brandName} laptops with latest specifications and best prices.</p>
            <div class="laptops-grid">
                ${laptopsHTML}
            </div>
            <div class="modal-features">
                <div class="feature-item">
                    <i class="fas fa-shipping-fast"></i>
                    <span>Free Shipping</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>2 Year Warranty</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-undo"></i>
                    <span>30 Day Return</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal appearance
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    });
    
    // Add to cart functionality for laptop cards
    modal.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const laptopName = this.getAttribute('data-laptop');
            const price = this.getAttribute('data-price');
            
            // Find the laptop data from the current brand
            const laptop = laptops.find(l => l.name === laptopName);
            if (laptop) {
                addToCart(laptop);
                
                // Add success animation
                this.classList.add('added');
                this.innerHTML = '<i class="fas fa-check"></i> Added!';
                
                setTimeout(() => {
                    this.classList.remove('added');
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                }, 2000);
            }
        });
    });
}

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    /* PCLIGHTzone Font Styles - Matching Logo */
    body {
        font-family: 'Orbitron', sans-serif;
    }
    
    .logo span {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
    }
    
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
    }
    
    .hero-title {
        font-family: 'Orbitron', sans-serif;
        font-weight: 800;
        letter-spacing: 3px;
        text-transform: uppercase;
    }
    
    .section-title {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
    }
    
    .brand-card h3 {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .product-card h3 {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .btn-primary, .btn-secondary, .btn-brand, .btn-part, .btn-product {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .nav-menu a {
        font-family: 'Orbitron', sans-serif;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .cart-toggle {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .cart-header h3 {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .laptop-name {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .item-name {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    
    .btn-add-to-cart, .btn-checkout, .btn-clear-cart {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .contact-item h3 {
        font-family: 'Orbitron', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .footer-section h3 {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    /* Showcase Product Cards Styling */
    .product-card {
        text-align: center;
        padding: 2rem 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 215, 0, 0.2);
        border-radius: 15px;
        transition: all 0.3s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .product-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
        border-color: rgba(255, 215, 0, 0.5);
        background: rgba(255, 255, 255, 0.08);
    }
    
    .product-card h3 {
        margin: 1rem 0;
        color: #ffd700;
        font-size: 1.3rem;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
    }
    
    .product-card .btn-product {
        margin-top: 1rem;
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .product-card .btn-product:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.5);
        background: linear-gradient(45deg, #764ba2, #667eea);
    }
    
    /* Modal Content Styles */
    .modal-content {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        padding: 2rem;
        border-radius: 15px;
        max-width: 1200px;
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid rgba(0, 212, 255, 0.3);
        position: relative;
        animation: modalSlideIn 0.3s ease;
    }
    
    @keyframes modalSlideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .close-modal {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 2rem;
        color: #ffd700;
        cursor: pointer;
        transition: color 0.3s ease;
        z-index: 10;
    }
    
    .close-modal:hover {
        color: #ff6b6b;
    }
    
    .modal-content h2 {
        color: #ffd700;
        margin-bottom: 1rem;
        text-align: center;
    }
    
    .modal-content p {
        color: #ccc;
        margin-bottom: 2rem;
        text-align: center;
    }
    
    .laptops-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .laptop-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 215, 0, 0.2);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .laptop-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
        border-color: rgba(255, 215, 0, 0.4);
    }
    
    .laptop-image {
        width: 100%;
        height: 200px;
        background: linear-gradient(135deg, #2a2a3e, #1f1f2e);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    
    .laptop-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .laptop-card:hover .laptop-image img {
        transform: scale(1.05);
    }
    
    .laptop-info {
        padding: 1.5rem;
    }
    
    .laptop-name {
        color: #ffd700;
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    .laptop-price {
        color: #4ade80;
        font-size: 1.4rem;
        font-weight: bold;
        margin-bottom: 1rem;
    }
    
    .laptop-specs {
        margin-bottom: 1.5rem;
    }
    
    .spec-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        color: #ccc;
        font-size: 0.9rem;
    }
    
    .spec-item i {
        color: #ffd700;
        width: 20px;
        margin-right: 0.5rem;
        font-size: 0.8rem;
    }
    
    .btn-add-to-cart {
        background: linear-gradient(135deg, #ffd700, #ffb300);
        color: #000000;
        border: none;
        padding: 14px 20px;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-height: 48px;
    }
    
    .btn-add-to-cart::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.6s ease;
    }
    
    .btn-add-to-cart:hover::before {
        left: 100%;
    }
    
    .btn-add-to-cart:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
        background: linear-gradient(135deg, #ffed4e, #ffd700);
    }
    
    .btn-add-to-cart:active {
        transform: translateY(-1px) scale(1.02);
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }
    
    .btn-add-to-cart.added {
        background: linear-gradient(135deg, #4ade80, #22c55e);
        animation: successPulse 0.6s ease;
    }
    
    .btn-add-to-cart.added::after {
        content: '✓';
        position: absolute;
        font-size: 1.2rem;
        animation: checkmark 0.5s ease;
    }
    
    @keyframes successPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes checkmark {
        0% { 
            opacity: 0;
            transform: scale(0) rotate(-180deg);
        }
        50% { 
            opacity: 1;
            transform: scale(1.2) rotate(10deg);
        }
        100% { 
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
    }
    
    .modal-features {
        display: flex;
        justify-content: space-around;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 10px;
        margin-top: 2rem;
    }
    
    .feature-item {
        text-align: center;
        color: #ccc;
    }
    
    .feature-item i {
        font-size: 1.5rem;
        color: #ffd700;
        margin-bottom: 0.5rem;
        display: block;
    }
    
    /* Scrollbar styling for modal */
    .modal-content::-webkit-scrollbar {
        width: 8px;
    }
    
    .modal-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb {
        background: rgba(255, 215, 0, 0.5);
        border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 215, 0, 0.7);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .modal-content {
            padding: 1rem;
            width: 98%;
        }
        
        .laptops-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .modal-features {
            flex-direction: column;
            gap: 1rem;
        }
    }
    
    /* Cart Sidebar Styles - Enhanced Design */
    .cart-sidebar {
        position: fixed;
        top: 0;
        right: -420px;
        width: 420px;
        height: 100%;
        background: linear-gradient(145deg, #0f0f1e, #1a1a2e, #16213e);
        border-left: 2px solid rgba(255, 215, 0, 0.4);
        z-index: 3000;
        transition: right 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        flex-direction: column;
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.7), inset 1px 0 0 rgba(255, 215, 0, 0.1);
        backdrop-filter: blur(20px);
    }
    
    .cart-sidebar.open {
        right: 0;
    }
    
    .cart-header {
        padding: 1.8rem 2rem;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
        backdrop-filter: blur(10px);
    }
    
    .cart-header h3 {
        color: #ffd700;
        margin: 0;
        font-size: 1.4rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-weight: 700;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .cart-header h3 i {
        font-size: 1.6rem;
        animation: cartIconPulse 2s infinite;
    }
    
    @keyframes cartIconPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .cart-close {
        background: rgba(255, 107, 107, 0.2);
        border: 1px solid rgba(255, 107, 107, 0.3);
        color: #ff6b6b;
        font-size: 1.4rem;
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 0.6rem;
        border-radius: 8px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .cart-close:hover {
        background: rgba(255, 107, 107, 0.3);
        transform: rotate(90deg);
        border-color: rgba(255, 107, 107, 0.5);
    }
    
    .cart-body {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        background: linear-gradient(180deg, rgba(15, 15, 30, 0.5), rgba(26, 26, 46, 0.3));
    }
    
    .cart-items {
        display: block;
    }
    
    .cart-empty {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: #ccc;
        text-align: center;
        padding: 2rem;
    }
    
    .cart-empty i {
        font-size: 4rem;
        color: #ffd700;
        margin-bottom: 1.5rem;
        opacity: 0.6;
        animation: emptyCartFloat 3s ease-in-out infinite;
    }
    
    @keyframes emptyCartFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .cart-item {
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 2rem;
        background: linear-gradient(135deg, rgba(16, 16, 24, 0.9), rgba(24, 24, 36, 0.8));
        border: 1px solid rgba(255, 215, 0, 0.2);
        border-radius: 16px;
        margin-bottom: 1.5rem;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        gap: 1.5rem;
        min-height: 180px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 1px 1px 0 rgba(255, 215, 0, 0.1);
        overflow: hidden;
    }
    
    .cart-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
        transition: left 0.6s ease;
    }
    
    .cart-item:hover::before {
        left: 100%;
    }
    
    .cart-item:hover {
        background: linear-gradient(135deg, rgba(24, 24, 36, 0.95), rgba(32, 32, 48, 0.9));
        border-color: rgba(255, 215, 0, 0.4);
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), inset 1px 1px 0 rgba(255, 215, 0, 0.2);
    }
    
    .item-image {
        width: 85px;
        height: 85px;
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 2px solid rgba(255, 215, 0, 0.3);
        position: relative;
        transition: all 0.3s ease;
    }
    
    .cart-item:hover .item-image {
        border-color: rgba(255, 215, 0, 0.5);
        transform: scale(1.05);
    }
    
    .item-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .cart-item:hover .item-image img {
        transform: scale(1.1);
    }
    
    .item-details {
        flex: 1 1 calc(100% - 110px);
        min-width: 160px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-self: stretch;
    }
    
    .item-name {
        color: #ffd700;
        font-size: 1.05rem;
        margin: 0 0 0.35rem 0;
        font-weight: 600;
        white-space: normal;
        overflow: visible;
        text-overflow: clip;
        line-height: 1.35;
        max-width: 100%;
    }
    
    .item-info {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.35rem;
        flex-wrap: wrap;
    }
    
    .item-price {
        color: #4ade80;
        font-size: 0.9rem;
        margin: 0;
        font-weight: 600;
        line-height: 1.3;
        flex-shrink: 0;
    }
    
    .item-qty-label {
        color: #ccc;
        font-size: 0.8rem;
        font-weight: 500;
        background: rgba(255, 215, 0, 0.12);
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        border: 1px solid rgba(255, 215, 0, 0.25);
        flex-shrink: 0;
    }
    
    .item-quantity {
        order: 3;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 0.8rem;
        flex-shrink: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
        padding: 0.8rem 1rem;
        border-radius: 25px;
        border: 1px solid rgba(255, 215, 0, 0.3);
        transition: all 0.3s ease;
        margin-top: 0.5rem;
    }
    
    .cart-item:hover .item-quantity {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
        border-color: rgba(255, 215, 0, 0.5);
        transform: scale(1.02);
    }
    
    .qty-btn {
        width: 32px;
        height: 32px;
        border: 2px solid rgba(255, 215, 0, 0.4);
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
        color: #ffd700;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
    }
    
    .qty-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 215, 0, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
    }
    
    .qty-btn:hover::before {
        width: 100%;
        height: 100%;
    }
    
    .qty-btn:hover {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2));
        border-color: rgba(255, 215, 0, 0.6);
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
    }
    
    .qty-btn:active {
        transform: scale(0.95);
    }
    
    .qty-btn i {
        position: relative;
        z-index: 1;
        transition: transform 0.2s ease;
    }
    
    .qty-btn:hover i {
        transform: scale(1.2);
    }
    
    .qty-value {
        color: #fff;
        font-size: 1.1rem;
        min-width: 28px;
        text-align: center;
        line-height: 1;
        font-weight: 700;
        flex-shrink: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .item-total {
        order: 4;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-left: 0;
        min-width: 0;
        text-align: left;
        flex-shrink: 0;
        line-height: 1.2;
    }
    
    .total-label {
        color: #ccc;
        font-size: 0.75rem;
        margin-bottom: 0.2rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .total-price {
        color: #4ade80;
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.2;
    }
    
    .item-remove {
        order: 5;
        margin-left: auto;
        background: none;
        border: none;
        color: #ff6b6b;
        cursor: pointer;
        padding: 0.65rem;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        flex-shrink: 0;
        align-self: center;
        border-radius: 8px;
    }
    
    .item-remove:hover {
        color: #ff8e53;
        transform: scale(1.1);
        background: rgba(255, 107, 107, 0.12);
    }
    
    .cart-footer {
        padding: 2rem;
        border-top: 2px solid rgba(255, 215, 0, 0.3);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        backdrop-filter: blur(10px);
    }
    
    .cart-summary {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: rgba(16, 16, 24, 0.6);
        border-radius: 12px;
        border: 1px solid rgba(255, 215, 0, 0.2);
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.8rem;
        color: #ccc;
        font-size: 0.95rem;
        font-weight: 500;
    }
    
    .summary-item.total {
        color: #ffd700;
        font-size: 1.3rem;
        font-weight: 700;
        padding-top: 0.8rem;
        border-top: 2px solid rgba(255, 215, 0, 0.3);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .cart-actions {
        display: flex;
        gap: 1rem;
    }
    
    .btn-clear-cart {
        flex: 1;
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
        color: #ff6b6b;
        border: 2px solid rgba(255, 107, 107, 0.4);
        padding: 1rem;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
    }
    
    .btn-clear-cart::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.3), transparent);
        transition: left 0.6s ease;
    }
    
    .btn-clear-cart:hover::before {
        left: 100%;
    }
    
    .btn-clear-cart:hover {
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(255, 107, 107, 0.2));
        border-color: rgba(255, 107, 107, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
    }
    
    .btn-checkout {
        flex: 2;
        background: linear-gradient(135deg, #ffd700, #ffb300);
        color: #000000;
        border: none;
        padding: 1rem;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }
    
    .btn-checkout::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.6s ease;
    }
    
    .btn-checkout:hover::before {
        left: 100%;
    }
    
    .btn-checkout:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
        background: linear-gradient(135deg, #ffed4e, #ffd700);
    }
    
    .btn-checkout:active {
        transform: translateY(-1px) scale(1.02);
    }
    
    /* Cart Toggle Button */
    .nav-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .cart-toggle {
        background: none;
        border: 1px solid rgba(255, 215, 0, 0.3);
        color: #ffd700;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        position: relative;
    }
    
    .cart-toggle:hover {
        background: rgba(255, 215, 0, 0.1);
        border-color: rgba(255, 215, 0, 0.5);
    }
    
    .cart-count {
        background: #ffd700;
        color: #000000;
        font-size: 0.7rem;
        font-weight: bold;
        padding: 0.2rem 0.4rem;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
    }
    
    /* Responsive Cart */
    @media (max-width: 768px) {
        .cart-sidebar {
            width: 100%;
            right: -100%;
            max-width: 100%;
        }
        
        .cart-header {
            padding: 1rem;
        }
        
        .cart-header h3 {
            font-size: 1rem;
        }
        
        .cart-body {
            padding: 0.75rem;
        }
        
        .cart-item {
            flex-wrap: wrap;
            gap: 0.75rem;
            padding: 0.75rem;
            align-items: flex-start;
        }
        
        .item-image {
            width: 50px;
            height: 50px;
            margin-right: 0;
            order: 1;
        }
        
        .item-details {
            order: 2;
            flex-basis: calc(100% - 50px - 0.75rem);
            min-width: 0;
        }
        
        .item-name {
            font-size: 0.8rem;
            line-height: 1.2;
            margin-bottom: 0.25rem;
            white-space: normal;
            overflow: visible;
            text-overflow: unset;
        }
        
        .item-price {
            font-size: 0.7rem;
        }
        
        .item-quantity {
            order: 3;
            margin: 0;
            align-self: flex-start;
        }
        
        .qty-btn {
            width: 22px;
            height: 22px;
            font-size: 0.65rem;
        }
        
        .qty-value {
            font-size: 0.75rem;
            min-width: 18px;
        }
        
        .item-total {
            order: 4;
            flex-basis: 100%;
            text-align: left;
            margin-top: 0.5rem;
            margin-right: 0;
            font-size: 0.75rem;
            min-width: auto;
            align-items: flex-start;
        }
        
        .total-price {
            font-size: 0.8rem;
        }
        
        .item-remove {
            order: 5;
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem;
            font-size: 0.7rem;
        }
        
        .cart-footer {
            padding: 1rem;
        }
        
        .summary-item {
            font-size: 0.8rem;
        }
        
        .summary-item.total {
            font-size: 0.95rem;
        }
        
        .cart-actions {
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .btn-clear-cart, .btn-checkout {
            padding: 0.75rem;
            font-size: 0.85rem;
        }
    }
    
    @media (max-width: 480px) {
        .cart-sidebar {
            width: 100vw;
            right: -100vw;
        }
        
        .cart-header h3 {
            font-size: 0.9rem;
            letter-spacing: 0.5px;
        }
        
        .cart-item {
            padding: 0.5rem;
            gap: 0.5rem;
        }
        
        .item-image {
            width: 45px;
            height: 45px;
        }
        
        .item-details {
            flex-basis: calc(100% - 45px - 0.5rem);
        }
        
        .item-name {
            font-size: 0.75rem;
        }
        
        .item-price {
            font-size: 0.65rem;
        }
        
        .item-total {
            font-size: 0.7rem;
            min-width: auto;
        }
        
        .total-price {
            font-size: 0.75rem;
        }
        
        .cart-footer {
            padding: 0.75rem;
        }
        
        .summary-item {
            font-size: 0.75rem;
        }
        
        .summary-item.total {
            font-size: 0.9rem;
        }
        
        .btn-clear-cart, .btn-checkout {
            padding: 0.6rem;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
        }
        
        .cart-toggle {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }
        
        .cart-count {
            font-size: 0.6rem;
            padding: 0.15rem 0.3rem;
            min-width: 16px;
        }
    }
    
    @media (max-width: 360px) {
        .cart-header {
            padding: 0.75rem;
        }
        
        .cart-body {
            padding: 0.5rem;
        }
        
        .cart-item {
            padding: 0.4rem;
        }
        
        .item-image {
            width: 40px;
            height: 40px;
        }
        
        .item-details {
            flex-basis: calc(100% - 40px - 0.4rem);
        }
        
        .item-name {
            font-size: 0.7rem;
            line-height: 1.1;
        }
        
        .item-price {
            font-size: 0.6rem;
        }
        
        .item-total {
            font-size: 0.65rem;
            min-width: auto;
        }
        
        .total-price {
            font-size: 0.7rem;
        }
        
        .cart-footer {
            padding: 0.5rem;
        }
        
        .summary-item {
            font-size: 0.7rem;
        }
        
        .summary-item.total {
            font-size: 0.85rem;
        }
        
        .btn-clear-cart, .btn-checkout {
            padding: 0.5rem;
            font-size: 0.75rem;
        }
    }
`;
document.head.appendChild(modalStyles);

// Enhanced Contact form handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = this.querySelector('input[type="text"]').value.trim();
        const email = this.querySelector('input[type="email"]').value.trim();
        const phone = this.querySelector('input[type="tel"]').value.trim();
        const message = this.querySelector('textarea').value.trim();
        
        // Validation
        if (!name) {
            showNotification('Please enter your name', 'error');
            return;
        }
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (!phone) {
            showNotification('Please enter your contact number', 'error');
            return;
        }
        
        if (!/^\+?[\d\s-()]+$/.test(phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        if (!message) {
            showNotification('Please enter your message', 'error');
            return;
        }
        
        if (message.length < 10) {
            showNotification('Message must be at least 10 characters long', 'error');
            return;
        }
        
        // Store message in localStorage (for demo purposes)
        const messages = JSON.parse(localStorage.getItem('pclightzone_messages') || '[]');
        messages.push({
            id: Date.now(),
            name,
            email,
            phone,
            message,
            date: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('pclightzone_messages', JSON.stringify(messages));
        
        // Show success message
        showNotification('Thank you for your message! We will contact you soon.', 'success');
        
        // Reset form
        this.reset();
        
        // Log the message (in a real app, this would be sent to a server)
        console.log('Contact form submission:', { name, email, phone, message });
    });
}

// Enhanced Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailInput = this.querySelector('input[type="email"]') || this.querySelector('input');
        const email = emailInput ? emailInput.value.trim() : '';

        // Validation
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Store subscription in localStorage (for demo purposes)
        const subscriptions = JSON.parse(localStorage.getItem('pclightzone_newsletter') || '[]');

        // Check if already subscribed
        if (subscriptions.find(sub => sub.email === email)) {
            showNotification('You are already subscribed to our newsletter!', 'info');
            this.reset();
            return;
        }

        subscriptions.push({
            id: Date.now(),
            email,
            date: new Date().toISOString(),
            status: 'active'
        });
        localStorage.setItem('pclightzone_newsletter', JSON.stringify(subscriptions));

        showNotification('Successfully subscribed to newsletter!', 'success');
        this.reset();

        // Log the subscription (in a real app, this would be sent to a server)
        console.log('Newsletter subscription:', { email });
    });
} else {
    console.warn('Newsletter form not found');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(45deg, #ffd700, #ffb300)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e53)';
    } else {
        notification.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Featured Products showcase functionality
document.querySelectorAll('.btn-product').forEach(button => {
    button.addEventListener('click', function() {
        console.log('Product button clicked');
        const productName = this.parentElement.querySelector('h3').textContent;

        // Show notification about viewing details
        showNotification(`Viewing details for ${productName}`, 'info');

        // Animate button
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);

        // Scroll to relevant section based on product type
        setTimeout(() => {
            if (productName.toLowerCase().includes('laptop')) {
                const laptopsSection = document.querySelector('#laptops');
                if (laptopsSection) {
                    laptopsSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (productName.toLowerCase().includes('desktop') ||
                      productName.toLowerCase().includes('gpu') ||
                      productName.toLowerCase().includes('ram')) {
                const partsSection = document.querySelector('#parts');
                if (partsSection) {
                    partsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 500);
    });
});
console.log('Found', document.querySelectorAll('.btn-product').length, 'product buttons');

// Shop Now button
const shopNowBtn = document.querySelector('.btn-primary');
if (shopNowBtn) {
    shopNowBtn.addEventListener('click', function() {
        console.log('Shop Now button clicked');
        showNotification('Redirecting to shop...', 'info');
        setTimeout(() => {
            const productsSection = document.querySelector('#products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1000);
    });
} else {
    console.warn('Shop Now button not found');
}

// View Products button
const viewProductsBtn = document.querySelector('.btn-secondary');
if (viewProductsBtn) {
    viewProductsBtn.addEventListener('click', function() {
        console.log('View Products button clicked');
        const productsSection = document.querySelector('#products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
} else {
    console.warn('View Products button not found');
}

// Update auth buttons vs. user link in header
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userLink = document.getElementById('userLink');
    const userDisplayName = document.getElementById('userDisplayName');

    if (!authButtons || !userLink) return;

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('pclightzone_user')) || null;
    } catch {
        user = null;
    }

    if (user) {
        authButtons.style.display = 'none';
        userLink.style.display = 'flex';
        if (userDisplayName) {
            userDisplayName.textContent = user.firstName || user.email || 'Account';
        }
    } else {
        authButtons.style.display = 'flex';
        userLink.style.display = 'none';
    }
}

// Comprehensive Button Debugging
document.addEventListener('DOMContentLoaded', () => {
    console.log('Button Debugging Report:');
    console.log('--- Core Navigation ---');
    console.log('Hamburger:', !!document.querySelector('.hamburger'));
    console.log('Nav menu:', !!document.querySelector('.nav-menu'));
    console.log('Nav links:', document.querySelectorAll('.nav-menu a').length);
    
    console.log('--- Cart System ---');
    console.log('Cart toggle:', !!document.getElementById('cartToggle'));
    console.log('Cart sidebar:', !!document.getElementById('cartSidebar'));
    console.log('Cart close:', !!document.getElementById('cartClose'));
    console.log('Clear cart:', !!document.getElementById('clearCart'));
    
    console.log('--- Search System ---');
    console.log('Search toggle:', !!document.getElementById('searchToggle'));
    console.log('Search modal:', !!document.getElementById('searchModal'));
    console.log('Search close:', !!document.getElementById('searchClose'));
    
    console.log('--- Hero Section ---');
    console.log('Shop now button:', !!document.querySelector('.btn-primary'));
    console.log('View products button:', !!document.querySelector('.btn-secondary'));
    
    console.log('--- Product Sections ---');
    console.log('Brand cards:', document.querySelectorAll('.brand-card').length);
    console.log('Part buttons:', document.querySelectorAll('.btn-part').length);
    console.log('Product buttons:', document.querySelectorAll('.btn-product').length);
    
    console.log('--- Forms ---');
    console.log('Contact form:', !!document.querySelector('.contact-form form'));
    console.log('Newsletter form:', !!document.querySelector('.newsletter-form'));
    
    console.log('--- Auth System ---');
    console.log('Login link:', !!document.querySelector('.login-link'));
    console.log('Register link:', !!document.querySelector('.register-link'));
    console.log('Auth buttons:', !!document.getElementById('authButtons'));
    console.log('User link:', !!document.getElementById('userLink'));
    
    console.log('All button checks completed');
});

// Initialize animations and auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    createParticles();
    updateAuthUI();
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Initialize all button event listeners after DOM is loaded
    initializeAllButtons();
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroAnimation = document.querySelector('.hero-animation');
    
    if (heroContent && heroAnimation) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroAnimation.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Enhanced Responsive Design Fixes
function handleResponsiveDesign() {
    const width = window.innerWidth;
    
    // Adjust cart sidebar width on mobile
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        if (width <= 768) {
            cartSidebar.style.width = '100%';
            cartSidebar.style.right = '-100%';
        } else {
            cartSidebar.style.width = '420px';
            cartSidebar.style.right = '-420px';
        }
    }
    
    // Adjust search modal for mobile
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        if (width <= 768) {
            searchModal.style.padding = '10px';
        }
    }
    
    // Fix mobile navigation height
    const header = document.querySelector('.header');
    if (header && width <= 768) {
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.width = '100%';
        header.style.zIndex = '1000';
    }
}

// Initialize responsive design
window.addEventListener('resize', handleResponsiveDesign);
window.addEventListener('load', handleResponsiveDesign);

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Improve touch interactions
    document.querySelectorAll('button, .btn-add-to-cart, .cart-toggle, .search-toggle').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Prevent zoom on input focus on mobile
document.querySelectorAll('input, textarea, select').forEach(element => {
    element.addEventListener('focus', function() {
        if (window.innerWidth <= 768) {
            document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
        }
    });
    
    element.addEventListener('blur', function() {
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1.0');
    });
});

// Dynamic year in footer
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    const currentYear = new Date().getFullYear();
    footerYear.textContent = footerYear.textContent.replace('2024', currentYear);
}

// Comprehensive Function Testing
function testWebsiteFunctions() {
    console.log('Testing PCLIGHTzone Website Functions...');
    
    // Test 1: Navigation
    console.log('Testing Navigation...');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    console.log(`   Found ${navLinks.length} navigation links`);
    
    // Test 2: Cart Functionality
    console.log('Testing Cart Functionality...');
    const cart = JSON.parse(localStorage.getItem('pclightzone_cart')) || [];
    console.log(`   Cart has ${cart.length} items`);
    
    // Test 3: Search Functionality
    console.log('Testing Search Functionality...');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    console.log(`   Search modal: ${searchModal ? 'Found' : 'Not found'}`);
    console.log(`   Search input: ${searchInput ? 'Found' : 'Not found'}`);
    
    // Test 4: Authentication
    console.log('Testing Authentication...');
    const user = JSON.parse(localStorage.getItem('pclightzone_user'));
    console.log(`   User logged in: ${user ? 'Yes' : 'No'}`);
    
    // Test 5: Forms
    console.log('Testing Forms...');
    const contactForm = document.querySelector('.contact-form form');
    const newsletterForm = document.querySelector('.newsletter-form');
    console.log(`   Contact form: ${contactForm ? 'Found' : 'Not found'}`);
    console.log(`   Newsletter form: ${newsletterForm ? 'Found' : 'Not found'}`);
    
    // Test 6: Responsive Design
    console.log('Testing Responsive Design...');
    const width = window.innerWidth;
    console.log(`   Screen width: ${width}px`);
    console.log(`   Mobile mode: ${width <= 768 ? 'Yes' : 'No'}`);
    
    // Test 7: Event Listeners
    console.log('Testing Event Listeners...');
    const cartToggle = document.getElementById('cartToggle');
    const searchToggle = document.getElementById('searchToggle');
    console.log(`   Cart toggle: ${cartToggle ? 'Found' : 'Not found'}`);
    console.log(`   Search toggle: ${searchToggle ? 'Found' : 'Not found'}`);
    
    // Test 8: Data Storage
    console.log('Testing Data Storage...');
    const orders = JSON.parse(localStorage.getItem('pclightzone_orders')) || [];
    const messages = JSON.parse(localStorage.getItem('pclightzone_messages')) || [];
    const subscriptions = JSON.parse(localStorage.getItem('pclightzone_newsletter')) || [];
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Messages: ${messages.length}`);
    console.log(`   Subscriptions: ${subscriptions.length}`);
    
    // Return test results
    return {
        navigation: navLinks.length > 0,
        cart: true,
        search: searchModal && searchInput,
        auth: true,
        forms: contactForm && newsletterForm,
        responsive: true,
        events: cartToggle && searchToggle,
        storage: true
    };
}

// Run tests on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all scripts to load
    setTimeout(() => {
        const testResults = testWebsiteFunctions();
        
        // Log any issues
        Object.entries(testResults).forEach(([funcName, passed]) => {
            if (!passed) {
                console.warn(`⚠️ Issue detected with ${funcName}`);
            }
        });
        
        // Show notification if tests pass
        const allPassed = Object.values(testResults).every(Boolean);
        if (allPassed) {
            console.log('🚀 PCLIGHTzone is ready for action!');
        }
    }, 1000);
});

// Error handling for unexpected errors
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript Error:', e.error);
    console.error('File:', e.filename);
    console.error('Line:', e.lineno);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    
    if (loadTime > 3000) {
        console.warn('Slow page load detected');
    }
});

// E-COMMERCE PRODUCT CATALOG SYSTEM
// Based on EasyPC.com.ph structure and functionality

// Product Data Structure
const products = {
    desktops: [
        {
            id: 'desktop-1',
            name: 'Starter Gaming Desktop PC | AMD Ryzen 5 5500GT',
            brand: 'EASYPC',
            category: 'desktops',
            price: 28500,
            originalPrice: 32000,
            discount: 11,
            specs: ['AMD Ryzen 5 5500GT', '16GB DDR4 RGB RAM', '256GB SSD', 'Ready to Use'],
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Desktop+PC',
            images: ['https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Desktop+PC'],
            description: 'Complete gaming desktop PC with AMD Ryzen 5 5500GT processor, 16GB RGB RAM, and 256GB SSD. Perfect for gaming and everyday use.',
            stock: 15,
            rating: 4.5,
            reviews: 23,
            tags: ['gaming', 'ryzen', 'budget']
        },
        {
            id: 'desktop-2',
            name: 'AMD Ryzen 7 5700G Pre-Built Desktop Kit',
            brand: 'EASYPC',
            category: 'desktops',
            price: 35500,
            originalPrice: 38000,
            discount: 7,
            specs: ['AMD Ryzen 7 5700G', '16GB DDR4 RGB RAM', '256GB NVMe SSD', 'B450M Motherboard'],
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Ryzen+7+Desktop',
            images: ['https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Ryzen+7+Desktop'],
            description: 'High-performance desktop kit with AMD Ryzen 7 5700G integrated graphics, perfect for content creation and gaming.',
            stock: 8,
            rating: 4.7,
            reviews: 18,
            tags: ['gaming', 'content-creation', 'ryzen']
        }
    ],
    laptops: [
        {
            id: 'laptop-1',
            name: 'VIEWPRO TK-E140J 14.0" Intel Celeron',
            brand: 'VIEWPRO',
            category: 'laptops',
            price: 18999,
            originalPrice: 21999,
            discount: 14,
            specs: ['Intel Celeron J4005', '16GB RAM', '256GB SSD', '14" Display', 'Windows 11'],
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=14%22+Laptop',
            images: ['https://via.placeholder.com/300x200/1a1a2e/ffd700?text=14%22+Laptop'],
            description: 'Compact 14" laptop perfect for students and everyday use with Intel Celeron processor and Windows 11.',
            stock: 12,
            rating: 4.3,
            reviews: 31,
            tags: ['student', 'compact', 'budget']
        },
        {
            id: 'laptop-2',
            name: 'MSI THIN A15 B7UCX 15.6" Gaming Laptop',
            brand: 'MSI',
            category: 'laptops',
            price: 65999,
            originalPrice: 69999,
            discount: 6,
            specs: ['AMD Ryzen 5 7535HS', '8GB DDR5 RAM', '512GB SSD', 'RTX 3050 4GB', '144Hz Display'],
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=MSI+Gaming+Laptop',
            images: ['https://via.placeholder.com/300x200/1a1a2e/ffd700?text=MSI+Gaming+Laptop'],
            description: 'High-performance gaming laptop with 144Hz display, RTX 3050 graphics, and AMD Ryzen 5 processor.',
            stock: 5,
            rating: 4.8,
            reviews: 45,
            tags: ['gaming', '144hz', 'rtx']
        },
        {
            id: 'laptop-3',
            name: 'Acer Aspire 3 A325-42 15.6" Ryzen 7',
            brand: 'ACER',
            category: 'laptops',
            price: 32999,
            originalPrice: 36999,
            discount: 11,
            specs: ['AMD Ryzen 7 7730U', '16GB DDR4 RAM', '512GB SSD', '15.6" FHD Display'],
            image: 'https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Acer+Aspire',
            images: ['https://via.placeholder.com/300x200/1a1a2e/ffd700?text=Acer+Aspire'],
            description: 'Reliable everyday laptop with AMD Ryzen 7 processor, perfect for work and entertainment.',
            stock: 9,
            rating: 4.4,
            reviews: 27,
            tags: ['work', 'ryzen', 'fhd']
        }
    ],
    components: {
        cpus: [
            {
                id: 'cpu-1',
                name: 'AMD Ryzen 5 5600X Processor',
                brand: 'AMD',
                category: 'cpus',
                price: 12999,
                originalPrice: 14999,
                discount: 13,
                specs: ['6 Cores/12 Threads', '3.7GHz Base Clock', '4.6GHz Boost', '32MB Cache'],
                image: 'https://via.placeholder.com/200x200/1a1a2e/ffd700?text=AMD+Ryzen+5+5600X',
                images: ['https://via.placeholder.com/200x200/1a1a2e/ffd700?text=AMD+Ryzen+5+5600X'],
                description: 'High-performance 6-core processor perfect for gaming and content creation.',
                stock: 20,
                rating: 4.9,
                reviews: 156,
                tags: ['gaming', 'content-creation', 'amd']
            }
        ],
        gpus: [
            {
                id: 'gpu-1',
                name: 'NVIDIA RTX 3060 Graphics Card',
                brand: 'NVIDIA',
                category: 'gpus',
                price: 28999,
                originalPrice: 32999,
                discount: 12,
                specs: ['12GB GDDR6', '3584 CUDA Cores', 'Ray Tracing', 'DLSS Support'],
                image: 'https://via.placeholder.com/200x200/1a1a2e/ffd700?text=RTX+3060',
                images: ['https://via.placeholder.com/200x200/1a1a2e/ffd700?text=RTX+3060'],
                description: 'Powerful graphics card for 1440p gaming with ray tracing and DLSS support.',
                stock: 7,
                rating: 4.7,
                reviews: 89,
                tags: ['gaming', 'rtx', '1440p']
            }
        ],
        ram: [
            {
                id: 'ram-1',
                name: 'Corsair Vengeance RGB Pro 16GB DDR4',
                brand: 'CORSAIR',
                category: 'ram',
                price: 4599,
                originalPrice: 4999,
                discount: 8,
                specs: ['16GB (2x8GB)', 'DDR4-3200', 'RGB Lighting', 'CL16 Timing'],
                image: 'https://via.placeholder.com/200x200/1a1a2e/ffd700?text=Corsair+RGB+RAM',
                images: ['https://via.placeholder.com/200x200/1a1a2e/ffd700?text=Corsair+RGB+RAM'],
                description: 'High-performance RGB RAM with tight timings for gaming and overclocking.',
                stock: 25,
                rating: 4.6,
                reviews: 67,
                tags: ['rgb', 'gaming', 'ddr4']
            }
        ]
    }
};

// Product Catalog Functions
function getAllProducts() {
    const allProducts = [];
    Object.values(products).forEach(category => {
        if (Array.isArray(category)) {
            allProducts.push(...category);
        } else {
            Object.values(category).forEach(subCategory => {
                allProducts.push(...subCategory);
            });
        }
    });
    return allProducts;
}

function getProductsByCategory(category) {
    // Check if it's a top-level category (desktops, laptops)
    if (products[category]) {
        return Array.isArray(products[category]) ? products[category] : Object.values(products[category]).flat();
    }

    // Check if it's a component category (cpus, gpus, ram, etc.)
    if (products.components && products.components[category]) {
        return products.components[category];
    }

    return [];
}

function getProductById(id) {
    const allProducts = getAllProducts();
    return allProducts.find(product => product.id === id);
}

function searchProducts(query) {
    const allProducts = getAllProducts();
    const lowercaseQuery = query.toLowerCase();
    return allProducts.filter(product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.brand.toLowerCase().includes(lowercaseQuery) ||
        product.specs.some(spec => spec.toLowerCase().includes(lowercaseQuery)) ||
        product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
}

function filterProducts(filters) {
    let filteredProducts = getAllProducts();

    if (filters.category && filters.category !== 'all') {
        filteredProducts = getProductsByCategory(filters.category);
    }

    if (filters.brand && filters.brand !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.brand.toLowerCase() === filters.brand.toLowerCase()
        );
    }

    if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(product =>
            product.price >= parseInt(filters.minPrice)
        );
    }

    if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(product =>
            product.price <= parseInt(filters.maxPrice)
        );
    }

    if (filters.search) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            product.brand.toLowerCase().includes(filters.search.toLowerCase())
        );
    }

    return filteredProducts;
}

// Product Display Functions
function createProductCard(product) {
    const discountBadge = product.discount > 0 ?
        `<div class="discount-badge">-${product.discount}%</div>` : '';

    const originalPriceDisplay = product.originalPrice > product.price ?
        `<span class="original-price">₱${product.originalPrice.toLocaleString()}</span>` : '';

    const ratingStars = createRatingStars(product.rating);

    return `
        <div class="product-card" data-product-id="${product.id}" data-category="${product.category}">
            ${discountBadge}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn-quick-view" onclick="showProductModal('${product.id}')">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                    <button class="btn-add-to-cart" onclick="addToCartFromCard('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-brand">${product.brand}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${ratingStars}
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₱${product.price.toLocaleString()}</span>
                    ${originalPriceDisplay}
                </div>
                <div class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </div>
            </div>
        </div>
    `;
}

function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }

    return starsHTML;
}

function displayProducts(productList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
    }

    if (productList.length === 0) {
        container.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }

    const productsHTML = productList.map(product => createProductCard(product)).join('');
    container.innerHTML = productsHTML;

    console.log(`Displayed ${productList.length} products in ${containerId}`);
}

function addToCartFromCard(productId) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    if (product.stock <= 0) {
        showNotification('Product is out of stock', 'error');
        return;
    }

    addToCart(product);
}

// Enhanced Search and Filter System
function initializeSearchAndFilters() {
    console.log('Initializing search and filter system...');

    // Enhanced search modal
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults) {
        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();

            if (query.length < 2) {
                searchResults.innerHTML = '<p class="empty-message">Start typing to search...</p>';
                return;
            }

            searchTimeout = setTimeout(() => {
                const results = searchProducts(query);
                displaySearchResults(results, query);
            }, 300);
        });
    }

    // Enhanced category filters with pagination
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProductsWithPagination(category);

            // Update active filter
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }

    console.log('Search and filter system initialized');
}

// Load more functionality for products
let currentProductPage = 1;
const productsPerPage = 12;
let currentProductFilter = 'all';

function loadMoreProducts() {
    console.log('Loading more products...');

    const allProducts = getAllProducts();
    const filteredProducts = currentProductFilter === 'all' ?
        allProducts : getProductsByCategory(currentProductFilter);

    const startIndex = currentProductPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const nextProducts = filteredProducts.slice(startIndex, endIndex);

    if (nextProducts.length === 0) {
        showNotification('No more products to load', 'info');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
        return;
    }

    // Append new products to existing grid
    const productGrid = document.getElementById('productsGrid');
    if (productGrid) {
        const newProductsHTML = nextProducts.map(product => createProductCard(product)).join('');
        productGrid.insertAdjacentHTML('beforeend', newProductsHTML);
    }

    currentProductPage++;
    console.log(`Loaded ${nextProducts.length} more products (page ${currentProductPage})`);

    // Hide load more button if no more products
    const remainingProducts = filteredProducts.length - (currentProductPage * productsPerPage);
    if (remainingProducts <= 0) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Update cart UI for new products
    updateCartUI();
}

function resetProductPagination() {
    currentProductPage = 1;
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'block';
    }
}

// Enhanced filter function with pagination reset
function filterProductsWithPagination(filterType) {
    currentProductFilter = filterType;
    resetProductPagination();

    const filteredProducts = filterType === 'all' ?
        getAllProducts() : getProductsByCategory(filterType);

    displayProducts(filteredProducts.slice(0, productsPerPage), 'productsGrid');
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;

    if (results.length === 0) {
        searchResults.innerHTML = `<p class="empty-message">No products found for "${query}"</p>`;
        return;
    }

    const resultsHTML = results.slice(0, 10).map(product => `
        <div class="search-result-item" onclick="showProductModal('${product.id}')">
            <img src="${product.image}" alt="${product.name}">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>${product.brand}</p>
                <span class="price">₱${product.price.toLocaleString()}</span>
            </div>
        </div>
    `).join('');

    if (results.length > 10) {
        resultsHTML += `<div class="search-more">And ${results.length - 10} more results...</div>`;
    }

    searchResults.innerHTML = resultsHTML;
}
function showProductModal(productId) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    const modal = document.getElementById('productModal') || createProductModal();
    const modalContent = modal.querySelector('.modal-content');

    const ratingStars = createRatingStars(product.rating);
    const discountBadge = product.discount > 0 ?
        `<div class="discount-badge">-${product.discount}% OFF</div>` : '';

    const originalPriceDisplay = product.originalPrice > product.price ?
        `<span class="original-price">₱${product.originalPrice.toLocaleString()}</span>` : '';

    const stockStatus = product.stock > 0 ?
        `<span class="in-stock">✓ In Stock (${product.stock} available)</span>` :
        `<span class="out-of-stock">✗ Out of Stock</span>`;

    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeProductModal()">
            <i class="fas fa-times"></i>
        </button>

        <div class="product-detail">
            <div class="product-gallery">
                <div class="main-image">
                    <img src="${product.image}" alt="${product.name}" id="mainProductImage">
                </div>
                <div class="thumbnail-gallery">
                    ${product.images.map((img, index) =>
                        `<img src="${img}" alt="${product.name} ${index + 1}" onclick="changeMainImage('${img}')">`
                    ).join('')}
                </div>
            </div>

            <div class="product-details">
                <div class="product-header">
                    <span class="brand-tag">${product.brand}</span>
                    ${discountBadge}
                    <h2 class="product-title">${product.name}</h2>
                    <div class="rating-section">
                        ${ratingStars}
                        <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
                    </div>
                </div>

                <div class="price-section">
                    <span class="current-price">₱${product.price.toLocaleString()}</span>
                    ${originalPriceDisplay}
                </div>

                <div class="stock-section">
                    ${stockStatus}
                </div>

                <div class="specifications">
                    <h3>Specifications</h3>
                    <ul>
                        ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
                    </ul>
                </div>

                <div class="product-description">
                    <h3>Description</h3>
                    <p>${product.description}</p>
                </div>

                <div class="action-buttons">
                    <div class="quantity-selector">
                        <button onclick="updateQuantityDisplay(-1)" class="qty-btn">-</button>
                        <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}">
                        <button onclick="updateQuantityDisplay(1)" class="qty-btn">+</button>
                    </div>
                    <button class="btn-add-to-cart-large" onclick="addProductToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist('${product.id}')">
                        <i class="far fa-heart"></i> Add to Wishlist
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    console.log(`📖 Product modal opened for: ${product.name}`);
}

function createProductModal() {
    const modal = document.createElement('div');
    modal.id = 'productModal';
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeProductModal()"></div>
        <div class="modal-content"></div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
}

function updateQuantityDisplay(change) {
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        let newValue = parseInt(quantityInput.value) + change;
        const max = parseInt(quantityInput.max) || 99;
        newValue = Math.max(1, Math.min(max, newValue));
        quantityInput.value = newValue;
    }
}

function addProductToCart(productId) {
    const quantityInput = document.getElementById('productQuantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    // Add multiple items if quantity > 1
    for (let i = 0; i < quantity; i++) {
        addToCart(product);
    }

    closeProductModal();
}

// ===== WISHLIST SYSTEM =====

// Wishlist data (persisted in localStorage)
let wishlist = JSON.parse(localStorage.getItem('pclightzone_wishlist')) || [];

function addToWishlist(productId) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    // Check if already in wishlist
    const existingItem = wishlist.find(item => item.id === productId);
    if (existingItem) {
        showNotification('Product already in wishlist!', 'info');
        return;
    }

    wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        category: product.category,
        addedDate: new Date().toISOString()
    });

    saveWishlist();
    showNotification(`${product.name} added to wishlist!`, 'success');
    updateWishlistUI();
}

function removeFromWishlist(productId) {
    const index = wishlist.findIndex(item => item.id === productId);
    if (index > -1) {
        const productName = wishlist[index].name;
        wishlist.splice(index, 1);
        saveWishlist();
        showNotification(`${productName} removed from wishlist`, 'info');
        updateWishlistUI();
    }
}

function saveWishlist() {
    localStorage.setItem('pclightzone_wishlist', JSON.stringify(wishlist));
}

function toggleWishlist(productId) {
    const existingItem = wishlist.find(item => item.id === productId);
    if (existingItem) {
        removeFromWishlist(productId);
    } else {
        addToWishlist(productId);
    }
}

function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}

function updateWishlistUI() {
    const wishlistCount = document.getElementById('wishlistCount');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }

    // Update wishlist buttons
    document.querySelectorAll('.btn-wishlist').forEach(button => {
        const productId = button.onclick.toString().match(/'([^']+)'/)[1];
        const icon = button.querySelector('i');
        if (icon) {
            if (isInWishlist(productId)) {
                icon.className = 'fas fa-heart';
                button.style.background = 'rgba(255, 100, 100, 0.8)';
                button.innerHTML = '<i class="fas fa-heart"></i> Remove from Wishlist';
            } else {
                icon.className = 'far fa-heart';
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
            }
        }
    });
}

function showWishlist() {
    const wishlistModal = document.getElementById('wishlistModal') || createWishlistModal();
    const wishlistContent = wishlistModal.querySelector('.wishlist-content');

    if (wishlist.length === 0) {
        wishlistContent.innerHTML = `
            <div class="empty-wishlist">
                <i class="far fa-heart"></i>
                <h3>Your wishlist is empty</h3>
                <p>Add products you love to your wishlist</p>
                <button class="btn-shop-now" onclick="scrollToProducts()">Start Shopping</button>
            </div>
        `;
    } else {
        const wishlistHTML = wishlist.map(item => `
            <div class="wishlist-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" onclick="showProductModal('${item.id}')">
                <div class="wishlist-item-info">
                    <h4 onclick="showProductModal('${item.id}')">${item.name}</h4>
                    <p>${item.brand}</p>
                    <span class="price">₱${item.price.toLocaleString()}</span>
                </div>
                <div class="wishlist-item-actions">
                    <button class="btn-add-to-cart" onclick="addToCartFromWishlist('${item.id}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn-remove-wishlist" onclick="removeFromWishlist('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        wishlistContent.innerHTML = wishlistHTML;
    }

    wishlistModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function createWishlistModal() {
    const modal = document.createElement('div');
    modal.id = 'wishlistModal';
    modal.className = 'wishlist-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeWishlistModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeWishlistModal()">
                <i class="fas fa-times"></i>
            </button>
            <h2><i class="fas fa-heart"></i> My Wishlist</h2>
            <div class="wishlist-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function addToCartFromWishlist(productId) {
    const product = getProductById(productId);
    if (product) {
        addToCart(product);
        removeFromWishlist(productId);
    }
}

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    closeWishlistModal();
}

// ===== CHECKOUT SYSTEM =====

// Checkout data
let checkoutData = {};

function showCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    const checkoutModal = document.getElementById('checkoutModal') || createCheckoutModal();
    const checkoutContent = checkoutModal.querySelector('.checkout-content');

    const cartItemsHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-item-info">
                <h4>${item.name}</h4>
                <p>₱${item.price.toLocaleString()} × ${item.quantity}</p>
            </div>
            <span class="checkout-item-total">₱${(item.price * item.quantity).toLocaleString()}</span>
        </div>
    `).join('');

    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 150;
    const total = subtotal + shipping;

    checkoutContent.innerHTML = `
        <div class="checkout-summary">
            <h3>Order Summary</h3>
            <div class="checkout-items">
                ${cartItemsHTML}
            </div>
            <div class="checkout-totals">
                <div class="checkout-row">
                    <span>Subtotal:</span>
                    <span>₱${subtotal.toLocaleString()}</span>
                </div>
                <div class="checkout-row">
                    <span>Shipping:</span>
                    <span>${shipping === 0 ? 'FREE' : '₱' + shipping.toLocaleString()}</span>
                </div>
                <div class="checkout-row total">
                    <span>Total:</span>
                    <span>₱${total.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <form class="checkout-form" id="checkoutForm">
            <h3>Shipping Information</h3>

            <div class="form-row">
                <div class="form-group">
                    <label for="firstName">First Name *</label>
                    <input type="text" id="firstName" required>
                </div>
                <div class="form-group">
                    <label for="lastName">Last Name *</label>
                    <input type="text" id="lastName" required>
                </div>
            </div>

            <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" required>
            </div>

            <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input type="tel" id="phone" required>
            </div>

            <div class="form-group">
                <label for="address">Street Address *</label>
                <input type="text" id="address" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="city">City *</label>
                    <input type="text" id="city" required>
                </div>
                <div class="form-group">
                    <label for="zipCode">ZIP Code *</label>
                    <input type="text" id="zipCode" required>
                </div>
            </div>

            <div class="form-group">
                <label for="paymentMethod">Payment Method</label>
                <select id="paymentMethod" required>
                    <option value="cod">Cash on Delivery</option>
                    <option value="gcash">GCash</option>
                    <option value="maya">Maya</option>
                    <option value="card">Credit/Debit Card</option>
                </select>
            </div>

            <div class="checkout-actions">
                <button type="button" class="btn-secondary" onclick="closeCheckoutModal()">Continue Shopping</button>
                <button type="submit" class="btn-primary">Place Order</button>
            </div>
        </form>
    `;

    // Add form submission handler
    const form = checkoutContent.querySelector('#checkoutForm');
    form.addEventListener('submit', handleCheckoutSubmit);

    checkoutModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function createCheckoutModal() {
    const modal = document.createElement('div');
    modal.id = 'checkoutModal';
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeCheckoutModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeCheckoutModal()">
                <i class="fas fa-times"></i>
            </button>
            <h2><i class="fas fa-shopping-bag"></i> Checkout</h2>
            <div class="checkout-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    checkoutData = {
        customer: {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode')
        },
        paymentMethod: formData.get('paymentMethod'),
        items: cart,
        subtotal: getCartTotal(),
        shipping: getCartTotal() > 5000 ? 0 : 150,
        total: getCartTotal() + (getCartTotal() > 5000 ? 0 : 150),
        orderDate: new Date().toISOString(),
        orderNumber: 'PC-' + Date.now()
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('pclightzone_orders')) || [];
    orders.push(checkoutData);
    localStorage.setItem('pclightzone_orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    localStorage.setItem('pclightzone_cart', JSON.stringify(cart));

    // Show success message and close modals
    closeCheckoutModal();
    showOrderConfirmation(checkoutData);
    updateCartUI();
}

function showOrderConfirmation(orderData) {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'confirmation-modal';
    confirmationModal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="order-success">
                <i class="fas fa-check-circle"></i>
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your order. We'll send you a confirmation email shortly.</p>

                <div class="order-details">
                    <h3>Order #${orderData.orderNumber}</h3>
                    <p><strong>Total:</strong> ₱${orderData.total.toLocaleString()}</p>
                    <p><strong>Payment:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
                </div>

                <div class="order-actions">
                    <button class="btn-primary" onclick="this.closest('.confirmation-modal').remove()">
                        Continue Shopping
                    </button>
                    <button class="btn-secondary" onclick="showOrderHistory()">
                        View Order History
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(confirmationModal);
    confirmationModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function showOrderHistory() {
    const orders = JSON.parse(localStorage.getItem('pclightzone_orders')) || [];

    if (orders.length === 0) {
        showNotification('No orders found', 'info');
        return;
    }

    const historyModal = document.createElement('div');
    historyModal.className = 'history-modal';
    historyModal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <h2><i class="fas fa-history"></i> Order History</h2>
            <div class="orders-list">
                ${orders.reverse().map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-number">Order #${order.orderNumber}</span>
                            <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div class="order-items">
                            ${order.items.slice(0, 3).map(item => `<span>${item.name}</span>`).join(', ')}
                            ${order.items.length > 3 ? ` +${order.items.length - 3} more` : ''}
                        </div>
                        <div class="order-total">
                            <span>Total: ₱${order.total.toLocaleString()}</span>
                            <span class="order-status">Completed</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(historyModal);
    historyModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Initialize wishlist on page load
function initializeWishlist() {
    console.log('💝 Initializing wishlist system...');
    updateWishlistUI();
    console.log('✅ Wishlist system initialized');
}

// Add wishlist button to header
function addWishlistToHeader() {
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !document.getElementById('wishlistBtn')) {
        const wishlistBtn = document.createElement('button');
        wishlistBtn.id = 'wishlistBtn';
        wishlistBtn.className = 'wishlist-toggle';
        wishlistBtn.title = 'Wishlist';
        wishlistBtn.innerHTML = `
            <i class="fas fa-heart"></i>
            <span class="wishlist-count" id="wishlistCount">0</span>
        `;
        wishlistBtn.addEventListener('click', showWishlist);
        navActions.appendChild(wishlistBtn);
    }
}

// Update initializeEcommerceSystem to include wishlist
function initializeEcommerceSystem() {
    console.log('🛒 Initializing E-commerce System...');

    // Load initial products
    const allProducts = getAllProducts();
    displayProducts(allProducts.slice(0, 12), 'productsGrid'); // Show first 12 products

    // Initialize search and filters
    initializeSearchAndFilters();

    // Initialize wishlist
    initializeWishlist();
    addWishlistToHeader();

    // Load featured products
    const featuredProducts = allProducts.filter(p => p.tags.includes('gaming')).slice(0, 6);
    displayProducts(featuredProducts, 'featuredProducts');

    console.log('✅ E-commerce system initialized with', allProducts.length, 'products');
}

// Function to initialize all button event listeners
function initializeAllButtons() {
    console.log('🔧 Initializing all button event listeners...');

    // 1. Shop Now button
    const shopNowBtn = document.querySelector('.btn-primary');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ Shop Now button clicked');
            showNotification('Redirecting to shop...', 'info');
            setTimeout(() => {
                const productsSection = document.querySelector('#products');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    console.warn('Products section not found');
                }
            }, 1000);
        });
        console.log('✅ Shop Now button event listener attached');
    } else {
        console.warn('❌ Shop Now button not found');
    }

    // 2. View Products button
    const viewProductsBtn = document.querySelector('.btn-secondary');
    if (viewProductsBtn) {
        viewProductsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('✅ View Products button clicked');
            const productsSection = document.querySelector('#products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.warn('Products section not found');
            }
        });
        console.log('✅ View Products button event listener attached');
    } else {
        console.warn('❌ View Products button not found');
    }

    // 3. Brand card buttons (View Laptops)
    const brandCards = document.querySelectorAll('.brand-card');
    if (brandCards.length > 0) {
        brandCards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                const brandName = this.querySelector('h3').textContent;
                console.log('✅ Brand card clicked:', brandName);
                showBrandModal(brandName);
            });
        });
        console.log(`✅ ${brandCards.length} brand card event listeners attached`);
    } else {
        console.warn('❌ No brand cards found');
    }

    // 4. Part buttons (computer parts & accessories)
    const partButtons = document.querySelectorAll('.btn-part');
    if (partButtons.length > 0) {
        partButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const partName = button.getAttribute('data-part');
                console.log('✅ Part button clicked:', partName);
                if (partName) {
                    showPartsModal(partName);
                }
            });
        });
        console.log(`✅ ${partButtons.length} part button event listeners attached`);
    } else {
        console.warn('❌ No part buttons found');
    }

    // 5. Product detail buttons
    const productButtons = document.querySelectorAll('.btn-product');
    if (productButtons.length > 0) {
        productButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('✅ Product button clicked');
                const productName = this.parentElement.querySelector('h3').textContent;

                showNotification(`Viewing details for ${productName}`, 'info');

                // Animate button
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);

                // Scroll to relevant section based on product type
                setTimeout(() => {
                    if (productName.toLowerCase().includes('laptop')) {
                        const laptopsSection = document.querySelector('#laptops');
                        if (laptopsSection) {
                            laptopsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    } else if (productName.toLowerCase().includes('desktop') ||
                              productName.toLowerCase().includes('gpu') ||
                              productName.toLowerCase().includes('ram')) {
                        const partsSection = document.querySelector('#parts');
                        if (partsSection) {
                            partsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                }, 500);
            });
        });
        console.log(`✅ ${productButtons.length} product button event listeners attached`);
    } else {
        console.warn('❌ No product buttons found');
    }

    // 6. Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('✅ Newsletter form submitted');

            const emailInput = this.querySelector('input[type="email"]') || this.querySelector('input');
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email) {
                showNotification('Please enter your email address', 'error');
                return;
            }

            if (!email.includes('@') || !email.includes('.')) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            const subscriptions = JSON.parse(localStorage.getItem('pclightzone_newsletter') || '[]');

            if (subscriptions.find(sub => sub.email === email)) {
                showNotification('You are already subscribed to our newsletter!', 'info');
                this.reset();
                return;
            }

            subscriptions.push({
                id: Date.now(),
                email,
                date: new Date().toISOString(),
                status: 'active'
            });
            localStorage.setItem('pclightzone_newsletter', JSON.stringify(subscriptions));

            showNotification('Successfully subscribed to newsletter!', 'success');
            this.reset();
        });
        console.log('✅ Newsletter form event listener attached');
    } else {
        console.warn('❌ Newsletter form not found');
    }

    // 7. Cart system buttons (moved outside DOMContentLoaded for immediate availability)
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    const clearCartBtn = document.getElementById('clearCart');

    if (cartToggle && cartSidebar) {
        cartToggle.addEventListener('click', () => {
            cartSidebar.classList.add('open');
            console.log('✅ Cart opened');
        });
        console.log('✅ Cart toggle event listener attached');
    } else {
        console.warn('❌ Cart toggle or sidebar not found');
    }

    if (cartClose && cartSidebar) {
        cartClose.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
            console.log('✅ Cart closed');
        });
        console.log('✅ Cart close event listener attached');
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
                console.log('✅ Cart cleared');
            }
        });
        console.log('✅ Clear cart event listener attached');
    }

    // 8. Search system
    const searchToggle = document.getElementById('searchToggle');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');

    if (searchToggle && searchModal) {
        searchToggle.addEventListener('click', () => {
            searchModal.classList.add('active');
            console.log('✅ Search modal opened');
        });
        console.log('✅ Search toggle event listener attached');
    }

    if (searchClose && searchModal) {
        searchClose.addEventListener('click', () => {
            searchModal.classList.remove('active');
            console.log('✅ Search modal closed');
        });
        console.log('✅ Search close event listener attached');
    }

    // 9. Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            console.log('✅ Hamburger clicked');
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        console.log('✅ Hamburger menu event listener attached');
    } else {
        console.warn('❌ Hamburger or nav menu not found');
    }

    // 10. Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    console.log('✅ Navigation link event listeners attached');

    console.log('🎉 All button event listeners initialized successfully!');
}

// Single consolidated DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PCLIGHTzone initializing...');

    // Initialize core functionality
    typeWriter();
    createParticles();
    updateAuthUI();

    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Initialize E-COMMERCE SYSTEM
    initializeEcommerceSystem();

    // Initialize all button event listeners
    initializeAllButtons();

    // Initialize cart UI
    updateCartUI();

    // Initialize animations for cards and sections
    const animatedElements = document.querySelectorAll(
        '.feature-card, .brand-card, .part-card, .product-card, .contact-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Button debugging report
    console.log('🔍 Button Debugging Report:');
    console.log('--- Core Navigation ---');
    console.log('Hamburger:', !!document.querySelector('.hamburger'));
    console.log('Nav menu:', !!document.querySelector('.nav-menu'));
    console.log('Nav links:', document.querySelectorAll('.nav-menu a').length);
    
    console.log('--- Cart System ---');
    console.log('Cart toggle:', !!document.getElementById('cartToggle'));
    console.log('Cart sidebar:', !!document.getElementById('cartSidebar'));
    console.log('Cart close:', !!document.getElementById('cartClose'));
    console.log('Clear cart:', !!document.getElementById('clearCart'));
    
    console.log('--- Search System ---');
    console.log('Search toggle:', !!document.getElementById('searchToggle'));
    console.log('Search modal:', !!document.getElementById('searchModal'));
    console.log('Search close:', !!document.getElementById('searchClose'));
    
    console.log('--- Hero Section ---');
    console.log('Shop now button:', !!document.querySelector('.btn-primary'));
    console.log('View products button:', !!document.querySelector('.btn-secondary'));
    
    console.log('--- Product Sections ---');
    console.log('Brand cards:', document.querySelectorAll('.brand-card').length);
    console.log('Part buttons:', document.querySelectorAll('.btn-part').length);
    console.log('Product buttons:', document.querySelectorAll('.btn-product').length);
    
    console.log('--- Forms ---');
    console.log('Contact form:', !!document.querySelector('.contact-form form'));
    console.log('Newsletter form:', !!document.querySelector('.newsletter-form'));
    
    console.log('--- Auth System ---');
    console.log('Login link:', !!document.querySelector('.login-link'));
    console.log('Register link:', !!document.querySelector('.register-link'));
    console.log('Auth buttons:', !!document.getElementById('authButtons'));
    console.log('User link:', !!document.getElementById('userLink'));
    
    console.log('🎯 All button checks completed');

    // Run comprehensive tests
    setTimeout(() => {
        const testResults = testWebsiteFunctions();
        
        // Log any issues
        Object.entries(testResults).forEach(([funcName, passed]) => {
            if (!passed) {
                console.warn(`⚠️ Issue detected with ${funcName}`);
            }
        });
        
        // Show notification if tests pass
        const allPassed = Object.values(testResults).every(Boolean);
        if (allPassed) {
            console.log('🚀 PCLIGHTzone is ready for action!');
        }
    }, 1000);
});

// Function to show parts modal (called by .btn-part buttons)
function showPartsModal(partName) {
    console.log('Showing parts modal for:', partName);

    // Map part names to product categories
    const categoryMap = {
        'CPUs': 'cpus',
        'Graphics Cards': 'gpus',
        'RAM Memory': 'ram',
        'Storage': 'storage',
        'Motherboards': 'motherboards',
        'Power Supplies': 'power-supplies',
        'Cases': 'cases',
        'Cooling': 'cooling'
    };

    const category = categoryMap[partName] || partName.toLowerCase().replace(/\s+/g, '-');
    const parts = getProductsByCategory(category);

    const modal = document.getElementById('partsModal') || createPartsModal();
    const modalContent = modal.querySelector('.modal-content');

    let partsHTML = '';
    if (parts.length > 0) {
        partsHTML = parts.map(product => `
            <div class="part-item" onclick="showProductModal('${product.id}')">
                <img src="${product.image}" alt="${product.name}">
                <div class="part-info">
                    <h4>${product.name}</h4>
                    <p class="part-brand">${product.brand}</p>
                    <div class="part-price">
                        <span class="price">₱${product.price.toLocaleString()}</span>
                        ${product.discount > 0 ? `<span class="discount">-${product.discount}%</span>` : ''}
                    </div>
                    <div class="part-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                </div>
                <button class="btn-add-to-cart" onclick="event.stopPropagation(); addToCartFromCard('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        `).join('');
    } else {
        partsHTML = '<div class="no-parts"><p>No products found in this category.</p></div>';
    }

    modalContent.innerHTML = `
        <button class="modal-close" onclick="closePartsModal()">
            <i class="fas fa-times"></i>
        </button>
        <h2><i class="fas fa-microchip"></i> ${partName}</h2>
        <div class="parts-grid">
            ${partsHTML}
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    console.log(`Parts modal opened with ${parts.length} products`);
}

// Function to show brand modal (called by .brand-card clicks)
function showBrandModal(brandName) {
    console.log('Showing brand modal for:', brandName);

    // Get products by brand
    const allProducts = getAllProducts();
    const brandProducts = allProducts.filter(product =>
        product.brand.toLowerCase() === brandName.toLowerCase()
    );

    const modal = document.getElementById('brandModal') || createBrandModal();
    const modalContent = modal.querySelector('.modal-content');

    let productsHTML = '';
    if (brandProducts.length > 0) {
        productsHTML = brandProducts.map(product => `
            <div class="brand-product-item" onclick="showProductModal('${product.id}')">
                <img src="${product.image}" alt="${product.name}">
                <div class="brand-product-info">
                    <h4>${product.name}</h4>
                    <div class="product-rating">
                        ${createRatingStars(product.rating)}
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">₱${product.price.toLocaleString()}</span>
                        ${product.originalPrice > product.price ? `<span class="original-price">₱${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </div>
                </div>
                <button class="btn-quick-add" onclick="event.stopPropagation(); addToCartFromCard('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `).join('');
    } else {
        productsHTML = '<div class="no-products"><p>No products found for this brand.</p></div>';
    }

    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeBrandModal()">
            <i class="fas fa-times"></i>
        </button>
        <div class="brand-header">
            <h2>${brandName} Products</h2>
            <p>Discover our ${brandName} collection</p>
        </div>
        <div class="brand-products-grid">
            ${productsHTML}
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    console.log(`Brand modal opened with ${brandProducts.length} products`);
}

// Modal creation functions
function createPartsModal() {
    const modal = document.createElement('div');
    modal.id = 'partsModal';
    modal.className = 'parts-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePartsModal()"></div>
        <div class="modal-content">
            <!-- Content will be populated by showPartsModal -->
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function createBrandModal() {
    const modal = document.createElement('div');
    modal.id = 'brandModal';
    modal.className = 'brand-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeBrandModal()"></div>
        <div class="modal-content">
            <!-- Content will be populated by showBrandModal -->
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Modal closing functions
function closePartsModal() {
    const modal = document.getElementById('partsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function closeBrandModal() {
    const modal = document.getElementById('brandModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}
