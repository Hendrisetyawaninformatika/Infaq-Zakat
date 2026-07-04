// ============================================
// AUTHENTICATION HANDLING
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth.js loaded');

    // ============================================
    // REGISTER FORM
    // ============================================
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var name = document.getElementById('registerName').value.trim();
            var email = document.getElementById('registerEmail').value.trim();
            var phone = document.getElementById('registerPhone').value.trim();
            var password = document.getElementById('registerPassword').value;
            var confirmPassword = document.getElementById('registerConfirmPassword').value;
            var terms = document.getElementById('termsCheckbox').checked;
            
            console.log('📝 Register form submitted for:', email);
            
            // Validasi
            if (!name) {
                showToast('❌ Nama lengkap harus diisi', 'error');
                return;
            }
            
            if (!email || !validateEmail(email)) {
                showToast('❌ Email tidak valid', 'error');
                return;
            }
            
            if (phone.length < 10) {
                showToast('❌ Nomor HP tidak valid', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('❌ Password minimal 6 karakter', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('❌ Password tidak cocok', 'error');
                return;
            }
            
            if (!terms) {
                showToast('❌ Harap setujui Syarat & Ketentuan', 'error');
                return;
            }
            
            // Show loading
            var submitBtn = registerForm.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            submitBtn.disabled = true;
            
            // Register
            window.registerUser(email, password, name, phone)
                .then(function(result) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    if (result.success) {
                        showToast('✅ Pendaftaran berhasil! Selamat datang! 🎉', 'success');
                        // Redirect tanpa kedip
                        setTimeout(function() {
                            window.location.replace('dashboard.html');
                        }, 1200);
                    } else {
                        showToast('❌ ' + result.error, 'error');
                    }
                })
                .catch(function(error) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    showToast('❌ Terjadi kesalahan: ' + error.message, 'error');
                });
        });
    }

    // ============================================
    // GOOGLE REGISTER
    // ============================================
    var googleRegisterBtn = document.getElementById('googleRegisterBtn');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', function() {
            googleRegisterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            googleRegisterBtn.disabled = true;
            
            window.loginWithGoogle()
                .then(function(result) {
                    googleRegisterBtn.innerHTML = '<i class="fab fa-google"></i> Daftar dengan Google';
                    googleRegisterBtn.disabled = false;
                    
                    if (result.success) {
                        showToast('✅ Pendaftaran berhasil! Selamat datang! 🎉', 'success');
                        setTimeout(function() {
                            window.location.replace('dashboard.html');
                        }, 1200);
                    } else {
                        showToast('❌ ' + result.error, 'error');
                    }
                });
        });
    }

    // ============================================
    // LOGIN FORM
    // ============================================
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var email = document.getElementById('loginEmail').value.trim();
            var password = document.getElementById('loginPassword').value;
            
            if (!email || !validateEmail(email)) {
                showToast('❌ Email tidak valid', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('❌ Password minimal 6 karakter', 'error');
                return;
            }
            
            var submitBtn = loginForm.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            submitBtn.disabled = true;
            
            window.loginUser(email, password)
                .then(function(result) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    if (result.success) {
                        showToast('✅ Login berhasil! Selamat datang! 🎉', 'success');
                        window.location.replace('dashboard.html');
                    } else {
                        showToast('❌ ' + result.error, 'error');
                    }
                });
        });
    }

    // ============================================
    // GOOGLE LOGIN
    // ============================================
    var googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            googleLoginBtn.disabled = true;
            
            window.loginWithGoogle()
                .then(function(result) {
                    googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Masuk dengan Google';
                    googleLoginBtn.disabled = false;
                    
                    if (result.success) {
                        showToast('✅ Login berhasil! Selamat datang! 🎉', 'success');
                        window.location.replace('dashboard.html');
                    } else {
                        showToast('❌ ' + result.error, 'error');
                    }
                });
        });
    }

    // ============================================
    // FORGOT PASSWORD
    // ============================================
    var forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            openForgotModal();
        });
    }

    var forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var email = document.getElementById('resetEmail').value.trim();
            
            if (!email || !validateEmail(email)) {
                showToast('❌ Email tidak valid', 'error');
                return;
            }
            
            var submitBtn = forgotForm.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;
            
            window.resetPassword(email)
                .then(function(result) {
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
        });
    }

    // ============================================
    // REMEMBER ME
    // ============================================
    var rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
        var savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            document.getElementById('loginEmail').value = savedEmail;
            rememberMe.checked = true;
        }
        
        rememberMe.addEventListener('change', function() {
            var emailInput = document.getElementById('loginEmail');
            if (rememberMe.checked && emailInput.value) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        });
    }

    // ============================================
    // CLOSE MODAL
    // ============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeForgotModal();
        }
    });
    
    document.addEventListener('click', function(e) {
        var modal = document.getElementById('forgotModal');
        if (modal && modal.classList.contains('active')) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        }
    });

    console.log('✅ Auth.js ready');
});