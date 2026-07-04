// ============================================
// AUTHENTICATION HANDLING
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth.js loaded');

    // ============================================
    // LOGIN FORM
    // ============================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !validateEmail(email)) {
                showToast('❌ Email tidak valid', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('❌ Password minimal 6 karakter', 'error');
                return;
            }
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            submitBtn.disabled = true;
            
            const result = await loginUser(email, password);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            if (result.success) {
                showToast('✅ Login berhasil! Selamat datang! 🎉', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast('❌ ' + result.error, 'error');
            }
        });
    }

    // ============================================
    // GOOGLE LOGIN
    // ============================================
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            googleBtn.disabled = true;
            
            const result = await loginWithGoogle();
            
            googleBtn.innerHTML = '<i class="fab fa-google"></i> Masuk dengan Google';
            googleBtn.disabled = false;
            
            if (result.success) {
                showToast('✅ Login berhasil! Selamat datang! 🎉', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast('❌ ' + result.error, 'error');
            }
        });
    }

    // ============================================
    // FORGOT PASSWORD
    // ============================================
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            openForgotModal();
        });
    }

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value.trim();
            
            if (!email || !validateEmail(email)) {
                showToast('❌ Email tidak valid', 'error');
                return;
            }
            
            const submitBtn = forgotForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;
            
            const result = await resetPassword(email);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            if (result.success) {
                showToast('✅ Link reset password telah dikirim ke email Anda 📧', 'success');
                closeForgotModal();
                forgotForm.reset();
            } else {
                showToast('❌ ' + result.error, 'error');
            }
        });
    }

    // ============================================
    // REMEMBER ME
    // ============================================
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            document.getElementById('loginEmail').value = savedEmail;
            rememberMe.checked = true;
        }
        
        rememberMe.addEventListener('change', () => {
            const emailInput = document.getElementById('loginEmail');
            if (rememberMe.checked && emailInput.value) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        });
        
        document.getElementById('loginEmail').addEventListener('input', function() {
            if (rememberMe.checked && this.value) {
                localStorage.setItem('rememberedEmail', this.value);
            }
        });
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeForgotModal();
        }
    });
});