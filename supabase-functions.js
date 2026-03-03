// Supabase Data Functions for PCLIGHTzone

// ==================== WISHLIST FUNCTIONS ====================

async function addToWishlistSupabase(productName, productPrice) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            showAlert('Please login to add items to wishlist', 'error');
            window.location.href = 'login.html';
            return false;
        }

        const { data, error } = await supabase
            .from('wishlist')
            .insert([
                {
                    user_id: user.id,
                    product_name: productName,
                    product_price: productPrice
                }
            ]);

        if (error) {
            if (error.code === '23505') {
                showAlert('Item already in wishlist', 'error');
            } else {
                throw error;
            }
            return false;
        }

        showAlert('Added to wishlist!', 'success');
        return true;
    } catch (error) {
        showAlert(error.message, 'error');
        return false;
    }
}

async function getWishlistSupabase() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Wishlist fetch error:', error);
        return [];
    }
}

async function removeFromWishlistSupabase(itemId) {
    try {
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
        showAlert('Item removed from wishlist', 'success');
        return true;
    } catch (error) {
        showAlert(error.message, 'error');
        return false;
    }
}

// ==================== REVIEW FUNCTIONS ====================

async function addReviewSupabase(productName, rating, text) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            showAlert('Please login to write a review', 'error');
            window.location.href = 'login.html';
            return false;
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert([
                {
                    user_id: user.id,
                    product_name: productName,
                    rating: parseInt(rating),
                    text: text
                }
            ]);

        if (error) throw error;
        showAlert('Review submitted successfully!', 'success');
        return true;
    } catch (error) {
        showAlert(error.message, 'error');
        return false;
    }
}

async function getProductReviewsSupabase(productName) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_name', productName)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Reviews fetch error:', error);
        return [];
    }
}

async function getUserReviewsSupabase() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('User reviews fetch error:', error);
        return [];
    }
}

async function deleteReviewSupabase(reviewId) {
    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) throw error;
        showAlert('Review deleted successfully!', 'success');
        return true;
    } catch (error) {
        showAlert(error.message, 'error');
        return false;
    }
}

// ==================== ORDER FUNCTIONS ====================

async function createOrderSupabase(items, total) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            showAlert('Please login to place an order', 'error');
            window.location.href = 'login.html';
            return null;
        }

        const trackingNumber = 'TRK' + Date.now();

        const { data, error } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user.id,
                    items: items,
                    total: total,
                    status: 'pending',
                    tracking_number: trackingNumber
                }
            ])
            .select();

        if (error) throw error;
        showAlert('Order placed successfully! Check your profile for details.', 'success');
        return data[0] || null;
    } catch (error) {
        showAlert(error.message, 'error');
        return null;
    }
}

async function getUserOrdersSupabase() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Orders fetch error:', error);
        return [];
    }
}

async function updateOrderStatusSupabase(orderId, status) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', orderId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Order update error:', error);
        return false;
    }
}

// ==================== STATISTICS FUNCTIONS ====================

async function getUserStatisticsSupabase() {
    try {
        const user = await getCurrentUser();
        if (!user) return {
            totalOrders: 0,
            totalWishlist: 0,
            totalReviews: 0,
            totalSpent: 0
        };

        const orders = await getUserOrdersSupabase();
        const wishlist = await getWishlistSupabase();
        const reviews = await getUserReviewsSupabase();

        let totalSpent = 0;
        orders.forEach(order => {
            totalSpent += parseFloat(order.total) || 0;
        });

        return {
            totalOrders: orders.length,
            totalWishlist: wishlist.length,
            totalReviews: reviews.length,
            totalSpent: totalSpent
        };
    } catch (error) {
        console.error('Statistics error:', error);
        return {
            totalOrders: 0,
            totalWishlist: 0,
            totalReviews: 0,
            totalSpent: 0
        };
    }
}

// ==================== HELPER FUNCTIONS ====================

function parsePrice(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
}

// Helper to format order data
function formatOrderData(items, total) {
    return {
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
        })),
        total: parsePrice(total)
    };
}

// Helper to check if product is in wishlist
async function isProductInWishlistSupabase(productName) {
    try {
        const wishlist = await getWishlistSupabase();
        return wishlist.some(item => item.product_name === productName);
    } catch (error) {
        return false;
    }
}

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
    `;

    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}
