// Profile Page Script using local-storage data

let currentUser = null;

const USERS_KEY = 'pclightzone_users';
const CURRENT_USER_KEY = 'pclightzone_user';
const ORDERS_KEY = 'pclightzone_orders';

function getStoredUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveStoredUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUserLocal() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
        return null;
    }
}

function getWishlistForUser(userId) {
    try {
        return JSON.parse(localStorage.getItem(`pclightzone_wishlist_${userId}`)) || [];
    } catch {
        return [];
    }
}

function getReviewsForUser(userId) {
    try {
        return JSON.parse(localStorage.getItem(`pclightzone_reviews_${userId}`)) || [];
    } catch {
        return [];
    }
}

function getOrdersForUser(userId) {
    try {
        const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
        return allOrders.filter(o => o.userId === userId);
    } catch {
        return [];
    }
}

// Initialize Profile
function initializeProfile() {
    currentUser = getCurrentUserLocal();

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update user info in sidebar
    document.getElementById('userNameDisplay').textContent =
        `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
    document.getElementById('userEmailDisplay').textContent = currentUser.email;

    // Load all profile data
    loadProfileForm();
    updateDashboard();
    loadOrders();
    loadWishlist();
    loadReviews();
}

// Load Profile Form Data
function loadProfileForm() {
    document.getElementById('profileFirstName').value = currentUser.firstName || '';
    document.getElementById('profileLastName').value = currentUser.lastName || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileAddress').value = currentUser.address || '';
    document.getElementById('profileCity').value = currentUser.city || '';
    document.getElementById('profileZip').value = currentUser.zipCode || '';
}

// Update Dashboard Stats
function updateDashboard() {
    const orders = getOrdersForUser(currentUser.id);
    const wishlist = getWishlistForUser(currentUser.id);
    const reviews = getReviewsForUser(currentUser.id);

    const totalSpent = orders.reduce((sum, order) => {
        const numeric = parseFloat(String(order.total).replace(/[^0-9.]/g, ''));
        return sum + (Number.isFinite(numeric) ? numeric : 0);
    }, 0);

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalWishlist').textContent = wishlist.length;
    document.getElementById('totalReviews').textContent = reviews.length;
    document.getElementById('totalSpent').textContent = `${totalSpent.toLocaleString()} PHP`;
}

// Load Orders
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    const orders = getOrdersForUser(currentUser.id);

    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="empty-message">No orders yet. Start shopping!</p>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <p class="order-number">Order #${String(order.id).substring(0, 8)}</p>
                    <p style="color: #888; font-size: 0.85rem;">Placed on ${new Date(order.date || order.created_at).toLocaleDateString()}</p>
                </div>
                <span class="order-status ${order.status}">${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}</span>
            </div>
            <div class="order-info">
                <div>
                    <p style="color: #888;">Items</p>
                    <p style="color: white;">${(order.items || []).length} product(s)</p>
                </div>
                <div>
                    <p style="color: #888;">Total</p>
                    <p style="color: #ffd700; font-weight: 600;">${order.total}</p>
                </div>
                <div>
                    <p style="color: #888;">Tracking</p>
                    <p style="color: white;">${order.tracking || order.tracking_number || 'N/A'}</p>
                </div>
            </div>
            <div class="order-items">
                <strong style="color: #ffd700;">Items Ordered:</strong>
                <ul style="margin-top: 0.5rem; margin-left: 1rem; color: #ccc;">
                    ${(order.items || []).map(item => `<li>${item.name} ${item.quantity ? 'x' + item.quantity : ''}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

// Load Wishlist
function loadWishlist() {
    const wishlistContainer = document.getElementById('wishlistContainer');
    const wishlist = getWishlistForUser(currentUser.id);

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = '<p class="empty-message">Your wishlist is empty</p>';
        return;
    }

    wishlistContainer.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
            <div class="product-icon">
                <i class="fas fa-microchip"></i>
            </div>
            <h4>${item.name}</h4>
            <p class="product-price">${item.price}</p>
            <button class="wishlist-remove" onclick="removeWishlistItem('${item.id}')">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `).join('');
}

// Remove Wishlist Item
function removeWishlistItem(itemId) {
    const wishlist = getWishlistForUser(currentUser.id).filter(item => String(item.id) !== String(itemId));
    localStorage.setItem(`pclightzone_wishlist_${currentUser.id}`, JSON.stringify(wishlist));
    showAlert('Item removed from wishlist', 'success');
    loadWishlist();
    updateDashboard();
}

// Load Reviews
function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const reviews = getReviewsForUser(currentUser.id);

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="empty-message">You haven\'t written any reviews yet</p>';
        return;
    }

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-product">${review.productName}</div>
                <div class="review-rating">
                    ${Array(5).fill(0).map((_, i) => `
                        <i class="fas fa-star${i < review.rating ? '' : '-empty'}"></i>
                    `).join('')}
                    <span style="color: #ccc; font-size: 0.9rem; margin-left: 0.5rem;">${review.rating}/5</span>
                </div>
            </div>
            <p class="review-text">${review.text}</p>
            <p class="review-date">Reviewed on ${new Date(review.date || review.created_at).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// Profile Form Submit
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updates = {
            firstName: document.getElementById('profileFirstName').value,
            lastName: document.getElementById('profileLastName').value,
            phone: document.getElementById('profilePhone').value,
            address: document.getElementById('profileAddress').value,
            city: document.getElementById('profileCity').value,
            zipCode: document.getElementById('profileZip').value
        };

        const users = getStoredUsers();
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            saveStoredUsers(users);
            currentUser = users[index];
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }

        document.getElementById('userNameDisplay').textContent =
            `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;

        showAlert('Profile updated successfully!', 'success');
    });
}

// Password Change Form
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword.length < 8) {
            showAlert('Password must be at least 8 characters.', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        const users = getStoredUsers();
        const index = users.findIndex(u => u.id === currentUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], password: newPassword };
            saveStoredUsers(users);
            currentUser = users[index];
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }

        passwordForm.reset();
        showAlert('Password changed successfully!', 'success');
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        showAlert('You have been logged out.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    });
}

// Section Navigation
document.querySelectorAll('.profile-nav-item').forEach(item => {
    if (!item.classList.contains('logout-btn')) {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');

            document.querySelectorAll('.profile-nav-item').forEach(i => {
                i.classList.remove('active');
            });

            document.querySelectorAll('.profile-section-content').forEach(s => {
                s.classList.remove('active');
            });

            item.classList.add('active');
            document.getElementById(`${section}Section`).classList.add('active');
        });
    }
});

// Show Alert
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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initializeProfile);

