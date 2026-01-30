// PCLIGHT ZONE - Interactive JavaScript

// Shopping Cart System
let cart = JSON.parse(localStorage.getItem('pclightzone_cart')) || [];
const CART_STORAGE_KEY = 'pclightzone_cart';
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
                this.style.transform = 'scale(0.95)';
                this.innerHTML = '<i class="fas fa-check"></i> Added!';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                }, 1500);
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

// Cart Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart UI
    updateCartUI();
    
    // Cart toggle
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    const clearCartBtn = document.getElementById('clearCart');
    
    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartSidebar.classList.add('open');
        });
    }
    
    if (cartClose) {
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
    
    // Keep cart open during interactions (no outside auto-close).
    
    // Checkout button
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
            } else {
                showNotification('Proceeding to checkout...', 'info');
                // Here you would typically redirect to a checkout page
            }
        });
    }
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
        header.style.backdropFilter = 'blur(15px)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

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
        const brandName = this.querySelector('h3').textContent;
        showBrandModal(brandName);
    });
});

// Computer parts buttons
document.querySelectorAll('.btn-part').forEach(button => {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const partName = button.getAttribute('data-part');
        if (partName) {
            showPartsModal(partName);
        }
    });
});

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
                
                // Animate button
                this.style.transform = 'scale(0.95)';
                this.innerHTML = '<i class="fas fa-check"></i> Added!';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                }, 1500);
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
        width: 100%;
        background: linear-gradient(45deg, #ffd700, #ffb300);
        color: #000000;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .btn-add-to-cart:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 215, 0, 0.5);
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
    
    /* Cart Sidebar Styles - Default Design */
    .cart-sidebar {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border-left: 1px solid rgba(255, 215, 0, 0.3);
        z-index: 3000;
        transition: right 0.3s ease;
        display: flex;
        flex-direction: column;
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
    }
    
    .cart-sidebar.open {
        right: 0;
    }
    
    .cart-header {
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.02);
    }
    
    .cart-header h3 {
        color: #ffd700;
        margin: 0;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cart-close {
        background: none;
        border: none;
        color: #ffd700;
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.3s ease;
        padding: 0.5rem;
    }
    
    .cart-close:hover {
        color: #ff6b6b;
    }
    
    .cart-body {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
    }
    
    .cart-items {
        display: block;
    }
    
    .cart-empty {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #ccc;
        text-align: center;
    }
    
    .cart-empty i {
        font-size: 3rem;
        color: #ffd700;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .cart-item {
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 1.75rem;
        background: rgba(16, 16, 24, 0.8);
        border: 1px solid rgba(255, 215, 0, 0.15);
        border-radius: 12px;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
        position: relative;
        gap: 1rem 1.5rem;
        min-height: 160px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    }
    
    .cart-item:hover {
        background: rgba(24, 24, 36, 0.9);
        border-color: rgba(255, 215, 0, 0.35);
        transform: translateY(-1px);
    }
    
    .item-image {
        width: 78px;
        height: 78px;
        border-radius: 12px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .item-image img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
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
        gap: 0.6rem;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.04);
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
    }
    
    .qty-btn {
        width: 28px;
        height: 28px;
        border: 1px solid rgba(255, 215, 0, 0.35);
        background: rgba(255, 215, 0, 0.12);
        color: #ffd700;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        transition: all 0.3s ease;
        flex-shrink: 0;
    }
    
    .qty-btn:hover {
        background: rgba(255, 215, 0, 0.2);
        border-color: rgba(255, 215, 0, 0.5);
    }
    
    .qty-value {
        color: #fff;
        font-size: 0.95rem;
        min-width: 24px;
        text-align: center;
        line-height: 1;
        font-weight: 600;
        flex-shrink: 0;
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
        padding: 1.5rem;
        border-top: 1px solid rgba(255, 215, 0, 0.2);
        background: rgba(255, 255, 255, 0.02);
    }
    
    .cart-summary {
        margin-bottom: 1rem;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        color: #ccc;
        font-size: 0.9rem;
    }
    
    .summary-item.total {
        color: #ffd700;
        font-size: 1.1rem;
        font-weight: 600;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255, 215, 0, 0.2);
    }
    
    .cart-actions {
        display: flex;
        gap: 1rem;
    }
    
    .btn-clear-cart {
        flex: 1;
        background: rgba(255, 107, 107, 0.2);
        color: #ff6b6b;
        border: 1px solid rgba(255, 107, 107, 0.3);
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .btn-clear-cart:hover {
        background: rgba(255, 107, 107, 0.3);
        border-color: rgba(255, 107, 107, 0.5);
    }
    
    .btn-checkout {
        flex: 2;
        background: linear-gradient(45deg, #ffd700, #ffb300);
        color: #000000;
        border: none;
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .btn-checkout:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 215, 0, 0.5);
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

// Contact form handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        
        // Show success message
        showNotification('Thank you for your message! We will contact you soon.', 'success');
        
        // Reset form
        this.reset();
    });
}

// Newsletter form handling
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input').value;
        
        if (email) {
            showNotification('Successfully subscribed to newsletter!', 'success');
            this.reset();
        }
    });
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
                document.querySelector('#laptops').scrollIntoView({ behavior: 'smooth' });
            } else if (productName.toLowerCase().includes('desktop') || 
                      productName.toLowerCase().includes('gpu') || 
                      productName.toLowerCase().includes('ram')) {
                document.querySelector('#parts').scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    });
});

// Shop Now button
document.querySelector('.btn-primary')?.addEventListener('click', function() {
    showNotification('Redirecting to shop...', 'info');
    setTimeout(() => {
        document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
});

// View Products button
document.querySelector('.btn-secondary')?.addEventListener('click', function() {
    document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
});

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    createParticles();
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
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

// Dynamic year in footer
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    const currentYear = new Date().getFullYear();
    footerYear.textContent = footerYear.textContent.replace('2024', currentYear);
}
