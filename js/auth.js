// ============================================
// UTILS.JS - FILANTROPI DIGITAL (ANTI-FLICKER)
// ============================================

// ============================================
// 🛡️ ANTI-FLICKER INIT - PASTIKAN BODY TAMPIL
// ============================================
(function antiFlickerInit() {
    // Hapus style hidden dari body secepat mungkin jika sudah load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Force show body setelah 100ms (cepat, tidak nunggu loader)
            setTimeout(function() {
                document.body.classList.add('loaded');
            }, 100);
        });
    } else {
        // DOM sudah ready
        document.body.classList.add('loaded');
    }
})();

// ============================================
// TOAST NOTIFICATION (ANTI-FLICKER)
// ============================================
function showToast(message, type = 'success') {
    // Hapus toast lama
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300);
    });

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { 
        success: 'fa-check-circle', 
        error: 'fa-exclamation-circle', 
        info: 'fa-info-circle', 
        warning: 'fa-exclamation-triangle' 
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    // Pastikan toast styles sudah ada
    if (!document.getElementById('toast-dynamic-styles')) {
        initToastStyles();
    }
    
    document.body.appendChild(toast);
    
    // Force reflow untuk memastikan transition berjalan
    toast.offsetHeight;
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove
    const removeTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    // Simpan timeout untuk cleanup
    toast._removeTimeout = removeTimeout;
}

// ============================================
// TOAST STYLES (Dynamic - Anti Flicker)
// ============================================
function initToastStyles() {
    if (document.getElementById('toast-dynamic-styles')) return;
    
    const toastStyles = document.createElement('style');
    toastStyles.id = 'toast-dynamic-styles';
    toastStyles.textContent = `
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 14px 20px;
            background: var(--card, #ffffff);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(150%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 90vw;
            width: auto;
            min-width: 280px;
            border-left: 4px solid var(--primary, #2E7D32);
            font-size: 14px;
            color: var(--text, #1a1a1a);
            font-family: 'Poppins', sans-serif;
            pointer-events: none;
        }
        .toast.show { 
            transform: translateX(0); 
        }
        .toast-success { border-left-color: #4CAF50; }
        .toast-error { border-left-color: #dc3545; }
        .toast-info { border-left-color: #2196F3; }
        .toast-warning { border-left-color: #FF9800; }
        .toast i { font-size: 20px; flex-shrink: 0; }
        .toast-success i { color: #4CAF50; }
        .toast-error i { color: #dc3545; }
        .toast-info i { color: #2196F3; }
        .toast-warning i { color: #FF9800; }
        
        @media (max-width: 480px) {
            .toast {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
                width: auto;
                min-width: unset;
                padding: 12px 16px;
                font-size: 13px;
            }
        }
    `;
    document.head.appendChild(toastStyles);
}

// ============================================
// VALIDATION
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// PASSWORD TOGGLE
// ============================================
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const wrapper = input.closest('.password-wrapper');
    const icon = wrapper?.querySelector('.toggle-password i');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'fas fa-eye';
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ============================================
// FORMATTING
// ============================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(amount);
}

function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

function truncateText(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// ============================================
// 🛡️ ANTI-FLICKER LOADER CONTROL
// ============================================
function hideLoaderSmooth() {
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('loaderProgress');
    
    if (!loader) {
        // Kalau tidak ada loader, langsung show body
        document.body.classList.add('loaded');
        document.body.style.overflow = 'auto';
        return;
    }
    
    // Pastikan progress 100%
    if (progressBar) progressBar.style.width = '100%';
    
    // Tunggu sedikit lalu hide loader
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.add('loaded');
        document.body.style.overflow = 'auto';
        
        // Remove loader dari DOM setelah transition
        setTimeout(() => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 600);
    }, 400);
}

// ============================================
// 🛡️ AUTH CHECK ANTI-FLICKER
// ============================================
function checkAuthStatus(options = {}) {
    const { 
        redirectIfNotAuth = null,      // URL redirect jika tidak auth
        redirectIfAuth = null,         // URL redirect jika sudah auth
        delay = 500,                   // Delay sebelum check (tunggu loader)
        onAuth = null,                 // Callback jika auth
        onNotAuth = null               // Callback jika tidak auth
    } = options;
    
    setTimeout(() => {
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        let user = null;
        
        if (userData) {
            try {
                user = JSON.parse(userData);
            } catch (e) {
                user = null;
            }
        }
        
        // Cek Firebase auth juga
        const checkFirebase = () => {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().onAuthStateChanged((fbUser) => {
                    if (fbUser) {
                        // Sync ke localStorage
                        const userDataObj = {
                            uid: fbUser.uid,
                            email: fbUser.email,
                            displayName: fbUser.displayName || 'User',
                            name: fbUser.displayName || 'User'
                        };
                        localStorage.setItem('userData', JSON.stringify(userDataObj));
                        
                        if (redirectIfAuth) {
                            window.location.replace(redirectIfAuth); // replace untuk no history flicker
                        }
                        if (onAuth) onAuth(fbUser);
                    } else {
                        if (!user) {
                            if (redirectIfNotAuth) {
                                window.location.replace(redirectIfNotAuth);
                            }
                            if (onNotAuth) onNotAuth();
                        }
                    }
                });
            } else {
                // No Firebase, pakai localStorage saja
                if (user) {
                    if (redirectIfAuth) {
                        window.location.replace(redirectIfAuth);
                    }
                    if (onAuth) onAuth(user);
                } else {
                    if (redirectIfNotAuth) {
                        window.location.replace(redirectIfNotAuth);
                    }
                    if (onNotAuth) onNotAuth();
                }
            }
        };
        
        checkFirebase();
    }, delay);
}

// ============================================
// EXPOSE TO GLOBAL
// ============================================
window.showToast = showToast;
window.validateEmail = validateEmail;
window.togglePasswordVisibility = togglePasswordVisibility;
window.closeForgotModal = closeForgotModal;
window.openForgotModal = openForgotModal;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.truncateText = truncateText;
window.hideLoaderSmooth = hideLoaderSmooth;
window.checkAuthStatus = checkAuthStatus;
window.initToastStyles = initToastStyles;

console.log('✅ Utils loaded! Anti-flicker active.');