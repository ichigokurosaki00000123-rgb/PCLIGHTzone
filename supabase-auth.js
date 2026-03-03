// Supabase Authentication Functions for PCLIGHTzone

// Register new user
async function registerWithSupabase(firstName, lastName, email, password, phone) {
    try {
        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });

        if (authError) {
            showAlert(authError.message, 'error');
            return null;
        }

        // Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                phone: phone
            })
            .eq('id', authData.user.id);

        if (profileError) console.error('Profile update error:', profileError);

        showAlert('Account created! Please check your email to verify.', 'success');
        return authData.user;
    } catch (error) {
        showAlert(error.message, 'error');
        return null;
    }
}

// Login user
async function loginWithSupabase(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showAlert(error.message, 'error');
            return null;
        }

        showAlert('Login successful! Redirecting...', 'success');
        return data.user;
    } catch (error) {
        showAlert(error.message, 'error');
        return null;
    }
}

// Logout user
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        showAlert('You have been logged out.', 'success');
        return true;
    } catch (error) {
        showAlert(error.message, 'error');
        return false;
    }
}

// Get current session
async function getCurrentSession() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    } catch (error) {
        console.error('Session error:', error);
        return null;
    }
}

// Get current user
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('User error:', error);
        return null;
    }
}

// Get user profile
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Profile fetch error:', error);
        return null;
    }
}

// Update user profile
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
        showAlert('Profile updated successfully!', 'success');
        return data;
    } catch (error) {
        showAlert(error.message, 'error');
        return null;
    }
}

// Change password
async function changePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        showAlert('Password changed successfully!', 'success');
        return true;
    } catch (error) {
        showAlert(error.message, 'error');
        return false;
    }
}

// Check authentication status on page load
async function checkSupabaseAuth() {
    const user = await getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userLink = document.getElementById('userLink');

    if (user && authButtons && userLink) {
        authButtons.style.display = 'none';
        userLink.style.display = 'flex';
        const profile = await getUserProfile(user.id);
        if (profile) {
            document.getElementById('userDisplayName').textContent = profile.first_name || user.email;
        }
    } else if (authButtons && userLink) {
        authButtons.style.display = 'flex';
        userLink.style.display = 'none';
    }

    // Redirect to login if not authenticated on profile page
    if (window.location.pathname.includes('profile.html') && !user) {
        window.location.href = 'login.html';
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
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Add animation styles if not present
if (!document.querySelector('style[data-auth]')) {
    const style = document.createElement('style');
    style.setAttribute('data-auth', 'true');
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
}

// Check auth on every page load
window.addEventListener('DOMContentLoaded', checkSupabaseAuth);
