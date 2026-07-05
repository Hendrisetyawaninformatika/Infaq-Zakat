// ============================================
// UTILS.JS - FILANTROPI DIGITAL (ANTI-FLICKER)
// ============================================

// ============================================
// 🛡️ TOAST NOTIFICATION (Tanpa Flicker)
// ============================================
function showToast(message, type = 'success') {
    // Hapus toast lama
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    // Force reflow
    toast.offsetHeight;
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// VALIDASI
// ============================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
// MODAL
// ============================================
function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function openForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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
// 🚀 ANTI-FLICKER: Sembunyikan Loader & Tampilkan Body
// ============================================
function hideLoaderAndShowBody() {
    const loader = document.getElementById('loader');
    if (loader) {
        // Pastikan progress 100%
        const progressBar = document.getElementById('loaderProgress');
        if (progressBar) progressBar.style.width = '100%';

        // Tunggu 300ms lalu sembunyikan loader
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.add('loaded');
            document.body.style.overflow = 'auto';
            // Hapus loader dari DOM setelah transisi
            setTimeout(() => {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 600);
        }, 300);
    } else {
        // Jika tidak ada loader, langsung tampilkan body
        document.body.classList.add('loaded');
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// 🔥 CEK AUTENTIKASI (ANTI-FLICKER)
// ============================================
function checkAuthAndRedirect(options = {}) {
    const {
        redirectIfAuth = null,    // URL jika sudah login (misal 'dashboard.html')
        redirectIfNotAuth = null, // URL jika belum login (misal 'login.html')
        delay = 600,              // Tunggu loader selesai
        onAuth = null,
        onNotAuth = null
    } = options;

    setTimeout(() => {
        // Cek dari localStorage
        let userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        let user = null;
        if (userData) {
            try { user = JSON.parse(userData); } catch (e) {}
        }

        // Jika ada user, kita anggap login
        if (user && user.email) {
            if (redirectIfAuth) {
                window.location.replace(redirectIfAuth); // replace = tidak ada history back → lebih halus
            }
            if (onAuth) onAuth(user);
            return;
        }

        // Cek Firebase (jika ada)
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(function(fbUser) {
                if (fbUser) {
                    // Sync ke localStorage
                    const data = {
                        uid: fbUser.uid,
                        email: fbUser.email,
                        displayName: fbUser.displayName || 'User',
                        name: fbUser.displayName || 'User'
                    };
                    localStorage.setItem('userData', JSON.stringify(data));

                    if (redirectIfAuth) {
                        window.location.replace(redirectIfAuth);
                    }
                    if (onAuth) onAuth(fbUser);
                } else {
                    if (redirectIfNotAuth) {
                        window.location.replace(redirectIfNotAuth);
                    }
                    if (onNotAuth) onNotAuth();
                }
            });
        } else {
            // Tidak ada Firebase, hanya localStorage
            if (!user) {
                if (redirectIfNotAuth) {
                    window.location.replace(redirectIfNotAuth);
                }
                if (onNotAuth) onNotAuth();
            }
        }
    }, delay);
}

// ============================================
// EXPOSE KE GLOBAL
// ============================================
window.showToast = showToast;
window.validateEmail = validateEmail;
window.togglePasswordVisibility = togglePasswordVisibility;
window.closeForgotModal = closeForgotModal;
window.openForgotModal = openForgotModal;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.truncateText = truncateText;
window.hideLoaderAndShowBody = hideLoaderAndShowBody;
window.checkAuthAndRedirect = checkAuthAndRedirect;

console.log('✅ Utils loaded! Anti-flicker active.');