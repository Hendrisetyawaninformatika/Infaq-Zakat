document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth.js loaded');

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const phone = document.getElementById('registerPhone').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const terms = document.getElementById('termsCheckbox').checked;
            
            if (!name) { showToast('❌ Nama lengkap harus diisi', 'error'); return; }
            if (!email || !validateEmail(email)) { showToast('❌ Email tidak valid', 'error'); return; }
            if (phone.length < 10) { showToast('❌ Nomor HP tidak valid', 'error'); return; }
            if (password.length < 6) { showToast('❌ Password minimal 6 karakter', 'error'); return; }
            if (password !== confirmPassword) { showToast('❌ Password tidak cocok', 'error'); return; }
            if (!terms) { showToast('❌ Harap setujui Syarat & Ketentuan', 'error'); return; }
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            submitBtn.disabled = true;
            
            const result = await registerUser(email, password, name, phone);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            if (result.success) {
                showToast('✅ Pendaftaran berhasil! Selamat datang! 🎉', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
            } else {
                showToast('❌ ' + result.error, 'error');
            }
        });
    }

    // Google Register
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', async () => {
            googleRegisterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            googleRegisterBtn.disabled = true;
            const result = await loginWithGoogle();
            googleRegisterBtn.innerHTML = '<i class="fab fa-google"></i> Daftar dengan Google';
            googleRegisterBtn.disabled = false;
            if (result.success) {
                showToast('✅ Pendaftaran berhasil! Selamat datang! 🎉', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
            } else {
                showToast('❌ ' + result.error, 'error');
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !validateEmail(email)) { showToast('❌ Email tidak valid', 'error'); return; }
            if (password.length < 6) { showToast('❌ Password minimal 6 karakter', 'error'); return; }
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            submitBtn.disabled = true;
            
            const result = await loginUser(email, password);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            if (result.success) {
                showToast('✅ Login berhasil! Selamat datang! 🎉', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            } else {
                showToast('❌ ' + result.error, 'error');
            }
        });
    }

    // Google Login
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            googleLoginBtn.disabled = true;
            const result = await loginWithGoogle();
            googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Masuk dengan Google';
            googleLoginBtn.disabled = false;
            if (result.success) {
                showToast('✅ Login berhasil! Selamat datang! 🎉', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            } else {
                showToast('❌ ' + result.error, 'error');
            }
        });
    }

    // Forgot Password
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
            if (!email || !validateEmail(email)) { showToast('❌ Email tidak valid', 'error'); return; }
            
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

    // Remember Me
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
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { closeForgotModal(); }
    });
});