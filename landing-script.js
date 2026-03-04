// landing-script.js - Script for the landing page

async function isLoggedIn() {
    // Check localStorage for logged-in user
    try {
        const localUser = JSON.parse(localStorage.getItem('pclightzone_user'));
        if (localUser) return true;
    } catch (e) {
        // Ignore errors
    }

    // Check Supabase auth
    if (typeof getCurrentUser === 'function') {
        try {
            const user = await getCurrentUser();
            return !!user;
        } catch (e) {
            console.error('Supabase auth check failed:', e);
        }
    }

    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to hero buttons
    const shopNowBtn = document.getElementById('shopNowBtn');
    const viewProductsBtn = document.getElementById('viewProductsBtn');

    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', async () => {
            const loggedIn = await isLoggedIn();
            window.location.href = loggedIn ? 'home.html' : 'login.html';
        });
    }

    if (viewProductsBtn) {
        viewProductsBtn.addEventListener('click', async () => {
            const loggedIn = await isLoggedIn();
            window.location.href = loggedIn ? 'home.html' : 'login.html';
        });
    }
});
