/* ================================================
   ArtisanConnect — Login Page JavaScript
   Uses ArtisanDB (db.js) for all data storage
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ========== Element References ==========
    const tabLogin     = document.getElementById('tab-login');
    const tabSignup    = document.getElementById('tab-signup');
    const tabIndicator = document.getElementById('tab-indicator');
    const loginForm    = document.getElementById('login-form');
    const signupForm   = document.getElementById('signup-form');
    const successState = document.getElementById('success-state');
    const forgotState  = document.getElementById('forgot-state');
    const forgotLink   = document.getElementById('forgot-password-link');
    const backToLogin  = document.getElementById('back-to-login');
    const tabSwitcher  = document.getElementById('tab-switcher');

    // ========== TAB SWITCHING ==========
    function switchTab(tab) {
        if (tab === 'login') {
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            tabIndicator.classList.remove('right');
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            successState.classList.add('hidden');
            forgotState.classList.add('hidden');
        } else {
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            tabIndicator.classList.add('right');
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            successState.classList.add('hidden');
            forgotState.classList.add('hidden');
        }
        clearAllErrors();
    }

    tabLogin.addEventListener('click',  () => switchTab('login'));
    tabSignup.addEventListener('click', () => switchTab('signup'));

    // ========== FORGOT PASSWORD ==========
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        tabSwitcher.style.display = 'none';
        forgotState.classList.remove('hidden');
    });

    backToLogin.addEventListener('click', () => {
        forgotState.classList.add('hidden');
        tabSwitcher.style.display = '';
        switchTab('login');
    });

    // ========== PASSWORD TOGGLE ==========
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const icon  = btn.querySelector('.material-icons-round');
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility_off';
            }
        });
    });

    // ========== PASSWORD STRENGTH ==========
    const signupPassword = document.getElementById('signup-password');
    const bars = [
        document.getElementById('str-bar-1'),
        document.getElementById('str-bar-2'),
        document.getElementById('str-bar-3'),
        document.getElementById('str-bar-4'),
    ];
    const strengthText = document.getElementById('strength-text');

    function checkPasswordStrength(pw) {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    }

    signupPassword.addEventListener('input', () => {
        const pw    = signupPassword.value;
        const score = checkPasswordStrength(pw);
        const levels  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        const classes = ['', 'weak', 'fair', 'good', 'strong'];

        bars.forEach((bar, i) => {
            bar.className = 'strength-bar';
            if (pw.length > 0 && i < score) bar.classList.add(classes[score]);
        });

        strengthText.textContent = pw.length > 0 ? levels[score] : '';
        strengthText.style.color = {
            Weak: '#e53935', Fair: '#ff9800', Good: '#ffc107', Strong: '#34c759'
        }[levels[score]] || '';
    });

    // ========== ROLE SELECTOR ==========
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ========== VALIDATION HELPERS ==========
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return phone.replace(/\D/g, '').length >= 10;
    }

    function showError(groupId, errorId, message) {
        const group   = document.getElementById(groupId);
        const error   = document.getElementById(errorId);
        const wrapper = group?.querySelector('.input-wrapper');
        if (wrapper) wrapper.classList.add('error');
        if (error)   error.textContent = message;
    }

    function clearError(groupId, errorId) {
        const group   = document.getElementById(groupId);
        const error   = document.getElementById(errorId);
        const wrapper = group?.querySelector('.input-wrapper');
        if (wrapper) { wrapper.classList.remove('error', 'success'); }
        if (error)   error.textContent = '';
    }

    function showSuccess(groupId) {
        const group   = document.getElementById(groupId);
        const wrapper = group?.querySelector('.input-wrapper');
        if (wrapper) { wrapper.classList.remove('error'); wrapper.classList.add('success'); }
    }

    function clearAllErrors() {
        document.querySelectorAll('.input-wrapper').forEach(w => w.classList.remove('error', 'success'));
        document.querySelectorAll('.input-error').forEach(e => e.textContent = '');
    }

    // ========== LIVE VALIDATION ==========
    function addLiveValidation(inputId, groupId, errorId, validator) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('blur', () => {
            if (input.value.trim() === '') { clearError(groupId, errorId); return; }
            const result = validator(input.value);
            if (result === true) { clearError(groupId, errorId); showSuccess(groupId); }
            else                 showError(groupId, errorId, result);
        });

        input.addEventListener('input', () => {
            if (input.value.trim() === '') clearError(groupId, errorId);
        });
    }

    addLiveValidation('login-email',   'login-email-group',   'login-email-error',
        v => isValidEmail(v) || 'Enter a valid email address');
    addLiveValidation('signup-email',  'signup-email-group',  'signup-email-error',
        v => isValidEmail(v) || 'Enter a valid email address');
    addLiveValidation('signup-phone',  'signup-phone-group',  'signup-phone-error',
        v => isValidPhone(v) || 'Enter a valid 10-digit phone number');
    addLiveValidation('signup-name',   'signup-name-group',   'signup-name-error',
        v => v.trim().length >= 2 || 'Name must be at least 2 characters');
    addLiveValidation('forgot-email',  'forgot-email-group',  'forgot-email-error',
        v => isValidEmail(v) || 'Enter a valid email address');

    // ========== LOADING STATE ==========
    function setLoading(btnId, loading) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        if (loading) { btn.classList.add('loading'); btn.disabled = true; }
        else         { btn.classList.remove('loading'); btn.disabled = false; }
    }

    // ========== TOAST ==========
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon  = document.getElementById('toast-icon');
        const msg   = document.getElementById('toast-msg');

        toast.className = 'toast ' + type;
        msg.textContent = message;
        icon.textContent = { success: 'check_circle', error: 'error', info: 'info' }[type] || 'info';
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 3500);
    }

    // ========== SUCCESS SCREEN ==========
    function showSuccessScreen(title, desc, redirectUrl) {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        forgotState.classList.add('hidden');
        tabSwitcher.style.display = 'none';

        document.getElementById('success-title').textContent = title;
        document.getElementById('success-desc').textContent  = desc;
        successState.classList.remove('hidden');

        setTimeout(() => { document.getElementById('success-bar').style.width = '100%'; }, 100);
        setTimeout(() => { window.location.href = redirectUrl || 'index.html'; }, 2700);
    }

    // ========== LOGIN FORM ==========
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();

        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        let valid = true;

        if (!email) {
            showError('login-email-group', 'login-email-error', 'Email is required');
            valid = false;
        } else if (!isValidEmail(email)) {
            showError('login-email-group', 'login-email-error', 'Enter a valid email address');
            valid = false;
        }

        if (!password) {
            showError('login-password-group', 'login-password-error', 'Password is required');
            valid = false;
        }

        if (!valid) return;

        setLoading('login-submit', true);

        setTimeout(async () => {
            // ── DATABASE: Authenticate user ──
            const result = await ArtisanDB.loginUser(email, password);

            setLoading('login-submit', false);

            if (!result.success) {
                showToast(result.error, 'error');
                if (result.error.includes('email')) {
                    showError('login-email-group', 'login-email-error', result.error);
                } else {
                    showError('login-password-group', 'login-password-error', result.error);
                }
                return;
            }

            const user = result.user;
            showToast('Login successful! Welcome back, ' + user.name, 'success');

            setTimeout(() => {
                if (user.role === 'professional') {
                    showSuccessScreen(
                        'Welcome back, ' + user.name + '!',
                        'Redirecting to your professional profile...',
                        'portfolio.html'
                    );
                } else {
                    showSuccessScreen(
                        'Welcome back, ' + user.name + '!',
                        'You\'ve been successfully logged in. Redirecting...',
                        'index.html'
                    );
                }
            }, 500);
        }, 1200);
    });

    // ========== SIGNUP FORM ==========
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();

        const name     = document.getElementById('signup-name').value.trim();
        const email    = document.getElementById('signup-email').value.trim();
        const phone    = document.getElementById('signup-phone').value.trim();
        const location = (document.getElementById('signup-location')?.value || '').trim();
        const password = document.getElementById('signup-password').value;
        const agreeTerms = document.getElementById('agree-terms').checked;
        const role     = document.querySelector('.role-btn.active')?.dataset.role || 'homeowner';

        let valid = true;

        if (!name || name.length < 2) {
            showError('signup-name-group', 'signup-name-error', 'Full name is required (at least 2 characters)');
            valid = false;
        }
        if (!email) {
            showError('signup-email-group', 'signup-email-error', 'Email is required');
            valid = false;
        } else if (!isValidEmail(email)) {
            showError('signup-email-group', 'signup-email-error', 'Enter a valid email address');
            valid = false;
        }
        if (!phone) {
            showError('signup-phone-group', 'signup-phone-error', 'Phone number is required');
            valid = false;
        } else if (!isValidPhone(phone)) {
            showError('signup-phone-group', 'signup-phone-error', 'Enter a valid 10-digit phone number');
            valid = false;
        }
        if (!password) {
            showError('signup-password-group', 'signup-password-error', 'Password is required');
            valid = false;
        } else if (password.length < 8) {
            showError('signup-password-group', 'signup-password-error', 'Password must be at least 8 characters');
            valid = false;
        }
        if (!agreeTerms) {
            showToast('Please agree to Terms of Service', 'error');
            valid = false;
        }

        if (!valid) return;

        setLoading('signup-submit', true);

        setTimeout(async () => {
            setLoading('signup-submit', false);

            let result;

            if (role === 'professional') {
                // ── DATABASE: Register professional ──
                result = await ArtisanDB.registerProfessional({ name, email, phone, password, location });
            } else {
                // ── DATABASE: Register homeowner ──
                result = await ArtisanDB.registerUser({ name, email, phone, password, location });
                if (result.success) {
                    // Set session for homeowner
                    await ArtisanDB.loginUser(email, password);
                }
            }

            if (!result.success) {
                showToast(result.error, 'error');
                if (result.error.toLowerCase().includes('email')) {
                    showError('signup-email-group', 'signup-email-error', result.error);
                } else if (result.error.toLowerCase().includes('phone')) {
                    showError('signup-phone-group', 'signup-phone-error', result.error);
                }
                return;
            }

            showToast('Account created successfully! Welcome, ' + name, 'success');

            setTimeout(() => {
                if (role === 'professional') {
                    showSuccessScreen(
                        'Account Created! 🎉',
                        'Setting up your professional profile...',
                        'pro-setup.html'
                    );
                } else {
                    showSuccessScreen(
                        'Welcome to ArtisanConnect! 🎉',
                        'Your account is ready. Redirecting to homepage...',
                        'index.html'
                    );
                }
            }, 500);
        }, 1500);
    });

    // ========== FORGOT PASSWORD ==========
    const forgotForm = document.getElementById('forgot-form');
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors();

        const email = document.getElementById('forgot-email').value.trim();
        if (!email) {
            showError('forgot-email-group', 'forgot-email-error', 'Email is required');
            return;
        }
        if (!isValidEmail(email)) {
            showError('forgot-email-group', 'forgot-email-error', 'Enter a valid email address');
            return;
        }

        setLoading('forgot-submit', true);

        setTimeout(async () => {
            setLoading('forgot-submit', false);
            const exists = await ArtisanDB.emailExists(email);
            if (!exists) {
                showError('forgot-email-group', 'forgot-email-error', 'No account found with this email.');
                return;
            }
            showToast('Password reset link sent to ' + email, 'success');
            setTimeout(() => {
                forgotState.classList.add('hidden');
                tabSwitcher.style.display = '';
                switchTab('login');
            }, 2000);
        }, 1500);
    });

    // ========== SOCIAL BUTTONS ==========
    ['google-login', 'google-signup', 'phone-login', 'phone-signup'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => {
            const method = id.includes('google') ? 'Google' : 'Phone';
            showToast(`${method} authentication coming soon!`, 'info');
        });
    });

    // ========== ALREADY LOGGED IN ==========
    const session = ArtisanDB.getSession();
    if (session && session.loggedIn) {
        showToast('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = session.role === 'professional' ? 'portfolio.html' : 'index.html';
        }, 1500);
    }
});
