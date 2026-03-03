// Authentication JavaScript for PCLIGHTzone (local-storage based)

const USERS_KEY = 'pclightzone_users';
const CURRENT_USER_KEY = 'pclightzone_user';

function getStoredUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveStoredUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function localRegister(firstName, lastName, email, password, phone) {
    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
        showAlert('An account with this email already exists.', 'error');
        return null;
    }

    const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password,
        phone,
        address: '',
        city: '',
        zipCode: ''
    };

    users.push(newUser);
    saveStoredUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    showAlert('Account created! Redirecting...', 'success');
    return newUser;
}

async function localLogin(email, password) {
    const users = getStoredUsers();
    const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
        showAlert('Invalid email or password.', 'error');
        return null;
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    showAlert('Login successful! Redirecting...', 'success');
    return user;
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.querySelector('input[name="remember"]')?.checked;

        const user = await localLogin(email, password);

        if (user) {
            if (rememberMe) {
                localStorage.setItem('pclightzone_remember', 'true');
            } else {
                localStorage.removeItem('pclightzone_remember');
            }
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phone = document.getElementById('phone').value.trim();
        const termsAccepted = document.querySelector('input[name="terms"]')?.checked;

        // Validation
        if (!firstName || !lastName) {
            showAlert('Please enter your first and last name.', 'error');
            return;
        }

        if (password.length < 8) {
            showAlert('Password must be at least 8 characters long.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        if (!termsAccepted) {
            showAlert('Please accept the terms and conditions.', 'error');
            return;
        }

        const user = await localRegister(firstName, lastName, email, password, phone);

        if (user) {
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        }
    });
}

// --- Supabase social login helpers (Google) ---

async function syncSupabaseUserToLocal() {
    try {
        if (typeof supabase === 'undefined' || !supabase.auth) return;

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        let users = getStoredUsers();
        let local = users.find(u => u.email && u.email.toLowerCase() === (user.email || '').toLowerCase());

        const meta = user.user_metadata || {};
        const firstName = meta.first_name || meta.firstName || meta.given_name || (user.email ? user.email.split('@')[0] : 'User');
        const lastName = meta.last_name || meta.lastName || meta.family_name || '';

        if (!local) {
            local = {
                id: user.id,
                firstName,
                lastName,
                email: user.email,
                password: '',
                phone: '',
                address: '',
                city: '',
                zipCode: ''
            };
            users.push(local);
        } else {
            local.firstName = local.firstName || firstName;
            local.lastName = local.lastName || lastName;
        }

        saveStoredUsers(users);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(local));
    } catch (err) {
        console.error('Supabase sync failed:', err);
    }
}

async function signInWithProvider(provider) {
    try {
        if (typeof supabase === 'undefined' || !supabase.auth) {
            showAlert('Social login is not configured yet.', 'error');
            return;
        }

        const redirectTo = `${window.location.origin}/profile.html`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo
            }
        });

        if (error) throw error;

        showAlert(`Redirecting to ${provider}...`, 'success');
    } catch (err) {
        showAlert(err.message || 'Unable to start social login.', 'error');
    }
}

// Attach handler to Google button if present
const googleBtn = document.querySelector('.google-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signInWithProvider('google');
    });
}

// Show Alert Messages
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

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(350px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(350px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// On every page load, if Supabase is available, sync its user into localStorage
document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase !== 'undefined' && supabase.auth) {
        syncSupabaseUserToLocal().then(() => {
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
        });
        // Fix Google sign-in button
        const googleBtn = document.getElementById('googleSignInBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                    if (error) {
                        showAlert('Google sign-in failed: ' + error.message, 'error');
                    }
                } catch (err) {
                    showAlert('Google sign-in error: ' + err.message, 'error');
                }
            });
        }
    }
});
