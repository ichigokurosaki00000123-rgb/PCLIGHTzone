// home-script.js - Script for the home page (shopping page)

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

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in, redirect to login if not
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize shopping functionality if needed
    // (script.js handles most of it)
});
