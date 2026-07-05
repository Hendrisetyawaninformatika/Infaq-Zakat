// ============================================
// APP.JS - FILANTROPI DIGITAL
// ============================================

// ============================================
// GLOBAL FUNCTIONS & UTILITIES
// ============================================

// Format Currency
function formatCurrency(amount) {
    if (!amount) return 'Rp 0';
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Format Date
function formatDate(timestamp) {
    if (!timestamp) return '-';
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }
    return new Date(timestamp).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Format Date with Time
function formatDateTime(timestamp) {
    if (!timestamp) return '-';
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    return new Date(timestamp).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Truncate Text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Show Toast Notification
function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<i class="fas fa-check-circle"></i><span id="toastMessage">Pesan</span>';
        document.body.appendChild(toast);
    }

    var toastMessage = document.getElementById('toastMessage') || toast.querySelector('span');
    var icon = toast.querySelector('i');

    toast.className = 'toast toast-' + (type || 'success');
    icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 
                     type === 'info' ? 'fas fa-info-circle' : 'fas fa-check-circle';
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 4000);
}

// ============================================
// LOADER PROGRESS
// ============================================
function initLoader() {
    var loader = document.getElementById('loader');
    var progressBar = document.getElementById('loaderProgress');
    var percentText = document.getElementById('loaderPercent');

    if (!loader || !progressBar) return;

    var progress = 0;
    var interval = setInterval(function() {
        progress += Math.random() * 10 + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(function() {
                loader.classList.add('hidden');
                document.body.style.overflow = 'auto';
                
                // Trigger content fade in
                var mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.classList.add('loaded');
                }
            }, 500);
        }
        progressBar.style.width = Math.min(progress, 100) + '%';
        if (percentText) {
            percentText.textContent = Math.min(Math.round(progress), 100) + '%';
        }
    }, 150);
}

// ============================================
// TOAST STYLES (Dynamic)
// ============================================
function initToastStyles() {
    var toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast {
            position: fixed;
            top: 80px;
            right: 24px;
            padding: 16px 24px;
            background: var(--card);
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            z-index: 9999;
            transform: translateX(120%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 400px;
            border-left: 4px solid var(--primary);
            font-size: 14px;
            color: var(--text);
        }
        .toast.show { transform: translateX(0); }
        .toast-success { border-left-color: #4CAF50; }
        .toast-error { border-left-color: #dc3545; }
        .toast-info { border-left-color: #2196F3; }
        .toast i { font-size: 20px; }
        .toast-success i { color: #4CAF50; }
        .toast-error i { color: #dc3545; }
        .toast-info i { color: #2196F3; }
        [data-theme="dark"] .toast {
            background: var(--card);
            color: var(--text);
        }
        @media (max-width: 768px) {
            .toast {
                top: 70px;
                right: 12px;
                left: 12px;
                max-width: 100%;
                padding: 12px 16px;
                font-size: 13px;
            }
        }
        @media (max-width: 480px) {
            .toast {
                top: 64px;
                padding: 10px 14px;
                font-size: 12px;
                border-radius: var(--radius-sm);
            }
        }
    `;
    document.head.appendChild(toastStyles);
}

// ============================================
// DOM READY - INIT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌙 Filantropi Digital - App loaded!');

    // Init loader
    initLoader();

    // Init toast styles
    initToastStyles();

    // Theme Toggle
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        var currentTheme = localStorage.getItem('theme') || 'light';
        
        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            var icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        setTheme(currentTheme);

        themeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // Navbar Scroll Effect
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    // Back to Top
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Load Firebase Data
    if (typeof db !== 'undefined') {
        console.log('📡 Firestore connected, loading data...');
        loadPrograms();
        loadTestimonials();
        loadArticles();
        loadFAQs();
        loadHeroStats();
        loadUserMenu();
    } else {
        console.warn('⚠️ Firestore not initialized, using sample data...');
        loadSamplePrograms();
        loadSampleTestimonials();
        loadSampleArticles();
        loadSampleFAQs();
        loadSampleHeroStats();
    }

    // Category Filter
    setupCategoryFilter();
});

// ============================================
// SETUP CATEGORY FILTER
// ============================================
function setupCategoryFilter() {
    var categoryBtns = document.querySelectorAll('.category-btn');
    if (!categoryBtns.length) return;

    categoryBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');

            var category = this.dataset.category;
            var cards = document.querySelectorAll('.program-card');

            cards.forEach(function(card) {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    setTimeout(function() {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(function() { card.style.display = 'none'; }, 300);
                }
            });
        });
    });
}

// ============================================
// LOAD USER MENU (Login Status)
// ============================================
async function loadUserMenu() {
    var userMenu = document.getElementById('userMenu');
    if (!userMenu) return;

    // Check Firebase Auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                userMenu.innerHTML = `
                    <a href="dashboard.html" class="btn btn-outline btn-sm" style="display:flex;align-items:center;gap:4px;">
                        <i class="fas fa-user-circle"></i> ${user.displayName || user.email || 'User'}
                    </a>
                    <button onclick="logoutUser()" class="btn btn-danger btn-sm">
                        <i class="fas fa-sign-out-alt"></i> Keluar
                    </button>
                `;
            } else {
                userMenu.innerHTML = `
                    <a href="login.html" class="btn btn-outline btn-sm">Masuk</a>
                    <a href="register.html" class="btn btn-primary btn-sm">Daftar</a>
                `;
            }
        });
    } else {
        // Fallback: check localStorage
        var userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (userData) {
            try {
                var user = JSON.parse(userData);
                userMenu.innerHTML = `
                    <a href="dashboard.html" class="btn btn-outline btn-sm" style="display:flex;align-items:center;gap:4px;">
                        <i class="fas fa-user-circle"></i> ${user.displayName || user.email || 'User'}
                    </a>
                    <button onclick="logoutUser()" class="btn btn-danger btn-sm">
                        <i class="fas fa-sign-out-alt"></i> Keluar
                    </button>
                `;
            } catch (e) {
                userMenu.innerHTML = `
                    <a href="login.html" class="btn btn-outline btn-sm">Masuk</a>
                    <a href="register.html" class="btn btn-primary btn-sm">Daftar</a>
                `;
            }
        }
    }
}

// ============================================
// LOGOUT FUNCTION
// ============================================
function logoutUser() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(function() {
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            window.location.href = 'index.html';
        }).catch(function(error) {
            console.error('Logout error:', error);
            showToast('Gagal logout: ' + error.message, 'error');
        });
    } else {
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        window.location.reload();
    }
}

// ============================================
// LOAD PROGRAMS - TANPA orderBy
// ============================================
async function loadPrograms() {
    var grid = document.getElementById('programGrid');
    if (!grid) return;

    try {
        // 🔥 TANPA orderBy - TIDAK MEMBUTUHKAN INDEX
        var snapshot = await db.collection('programs')
            .where('status', '==', 'active')
            .limit(6)
            .get();

        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada program donasi</p></div>';
            return;
        }

        var html = '';
        snapshot.forEach(function(doc) {
            var program = { id: doc.id, ...doc.data() };
            var progress = ((program.collected || 0) / (program.target || 1)) * 100;
            var categoryLabel = program.category ? program.category.charAt(0).toUpperCase() + program.category.slice(1) : 'Umum';

            html += `
                <div class="program-card" data-category="${program.category || 'umum'}">
                    <div class="program-image">
                        ${program.icon || '🤲'}
                    </div>
                    <div class="program-body">
                        <span class="program-category">${categoryLabel}</span>
                        <h3>${program.title || 'Program Donasi'}</h3>
                        <p class="program-desc">${truncateText(program.description || '', 100)}</p>
                        <div class="program-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                            </div>
                            <div class="progress-info">
                                <span>Terkumpul: ${formatCurrency(program.collected || 0)}</span>
                                <span>Target: ${formatCurrency(program.target || 0)}</span>
                            </div>
                        </div>
                        <div class="program-footer">
                            <span class="program-donors">
                                <i class="fas fa-users"></i> ${program.donors || 0} Donatur
                            </span>
                            <a href="detail-program.html?id=${program.id}" class="btn-donasi">Donasi</a>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
        console.log('✅ Programs loaded successfully!');
    } catch (error) {
        console.error('Error loading programs:', error);
        // Load sample data as fallback
        loadSamplePrograms();
    }
}

// ============================================
// LOAD SAMPLE PROGRAMS (Fallback)
// ============================================
function loadSamplePrograms() {
    var grid = document.getElementById('programGrid');
    if (!grid) return;

    var programs = [
        { id: 1, title: 'Program Zakat Fitrah 2026', category: 'zakat', description: 'Salurkan zakat fitrah Anda untuk membantu saudara-saudara kita yang membutuhkan.', icon: '🍚', collected: 7500000, target: 10000000, donors: 120 },
        { id: 2, title: 'Infak Pembangunan Masjid', category: 'infak', description: 'Infak untuk pembangunan dan renovasi masjid di daerah terpencil.', icon: '🕌', collected: 4500000, target: 8000000, donors: 85 },
        { id: 3, title: 'Sedekah Buku untuk Anak', category: 'sedekah', description: 'Sedekah buku dan alat tulis untuk anak-anak di daerah terpencil.', icon: '📚', collected: 2300000, target: 5000000, donors: 45 },
        { id: 4, title: 'Qurban 2026', category: 'qurban', description: 'Salurkan qurban Anda untuk dinikmati oleh saudara-saudara kita yang membutuhkan.', icon: '🐐', collected: 12000000, target: 20000000, donors: 200 }
    ];

    var html = '';
    programs.forEach(function(p) {
        var progress = ((p.collected || 0) / (p.target || 1)) * 100;
        var categoryLabel = p.category.charAt(0).toUpperCase() + p.category.slice(1);

        html += `
            <div class="program-card" data-category="${p.category}">
                <div class="program-image">${p.icon}</div>
                <div class="program-body">
                    <span class="program-category">${categoryLabel}</span>
                    <h3>${p.title}</h3>
                    <p class="program-desc">${p.description}</p>
                    <div class="program-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>Terkumpul: ${formatCurrency(p.collected || 0)}</span>
                            <span>Target: ${formatCurrency(p.target || 0)}</span>
                        </div>
                    </div>
                    <div class="program-footer">
                        <span class="program-donors">
                            <i class="fas fa-users"></i> ${p.donors || 0} Donatur
                        </span>
                        <a href="detail-program.html?id=${p.id}" class="btn-donasi">Donasi</a>
                    </div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
    console.log('📦 Sample programs loaded!');
}

// ============================================
// LOAD TESTIMONIALS - TANPA orderBy
// ============================================
async function loadTestimonials() {
    var grid = document.getElementById('testimonialGrid');
    if (!grid) return;

    try {
        var snapshot = await db.collection('testimonials')
            .where('status', '==', 'published')
            .limit(3)
            .get();

        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-comment"></i><p>Belum ada testimoni</p></div>';
            return;
        }

        var html = '';
        snapshot.forEach(function(doc) {
            var testimonial = { id: doc.id, ...doc.data() };
            var stars = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5));
            var initial = (testimonial.name || 'U').charAt(0);

            html += `
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <div class="testimonial-avatar">${initial}</div>
                        <div>
                            <div class="testimonial-name">${testimonial.name || 'Donatur'}</div>
                            <div class="testimonial-role">${testimonial.role || 'Donatur'}</div>
                        </div>
                    </div>
                    <p class="testimonial-text">"${testimonial.content || testimonial.text || 'Testimoni'}"</p>
                    <div class="testimonial-stars">${stars}</div>
                </div>
            `;
        });

        grid.innerHTML = html;
        console.log('✅ Testimonials loaded successfully!');
    } catch (error) {
        console.error('Error loading testimonials:', error);
        loadSampleTestimonials();
    }
}

// ============================================
// LOAD SAMPLE TESTIMONIALS (Fallback)
// ============================================
function loadSampleTestimonials() {
    var grid = document.getElementById('testimonialGrid');
    if (!grid) return;

    var testimonials = [
        { name: 'Ahmad Fauzi', role: 'Donatur Zakat', content: 'Alhamdulillah, sangat mudah dan transparan. Saya bisa melihat langsung bagaimana donasi saya disalurkan.', rating: 5 },
        { name: 'Siti Rahmah', role: 'Donatur Infak', content: 'Platform yang sangat membantu. Saya jadi lebih semangat berbagi karena prosesnya yang mudah.', rating: 5 },
        { name: 'Muhammad Rizki', role: 'Donatur Qurban', content: 'Sangat puas dengan pelayanan Filantropi Digital. Qurban saya tersalurkan dengan baik.', rating: 5 }
    ];

    var html = '';
    testimonials.forEach(function(t) {
        var stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
        var initial = t.name.charAt(0);

        html += `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <div class="testimonial-avatar">${initial}</div>
                    <div>
                        <div class="testimonial-name">${t.name}</div>
                        <div class="testimonial-role">${t.role}</div>
                    </div>
                </div>
                <p class="testimonial-text">"${t.content}"</p>
                <div class="testimonial-stars">${stars}</div>
            </div>
        `;
    });

    grid.innerHTML = html;
    console.log('📦 Sample testimonials loaded!');
}

// ============================================
// LOAD ARTICLES - TANPA orderBy
// ============================================
async function loadArticles() {
    var grid = document.getElementById('articleGrid');
    if (!grid) return;

    try {
        var snapshot = await db.collection('articles')
            .where('status', '==', 'published')
            .limit(3)
            .get();

        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>Belum ada artikel</p></div>';
            return;
        }

        var html = '';
        snapshot.forEach(function(doc) {
            var article = { id: doc.id, ...doc.data() };

            html += `
                <div class="article-card">
                    <div class="program-image" style="font-size:40px;color:var(--primary);">
                        ${article.icon || '📰'}
                    </div>
                    <div class="article-body">
                        <div class="article-meta">
                            <span><i class="fas fa-tag"></i> ${article.category || 'Umum'}</span>
                            <span><i class="fas fa-calendar-alt"></i> ${formatDate(article.createdAt)}</span>
                        </div>
                        <h3>${article.title}</h3>
                        <p class="article-desc">${truncateText(article.excerpt || article.content || '', 120)}</p>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
        console.log('✅ Articles loaded successfully!');
    } catch (error) {
        console.error('Error loading articles:', error);
        loadSampleArticles();
    }
}

// ============================================
// LOAD SAMPLE ARTICLES (Fallback)
// ============================================
function loadSampleArticles() {
    var grid = document.getElementById('articleGrid');
    if (!grid) return;

    var articles = [
        { title: 'Keutamaan Zakat Fitrah di Bulan Ramadhan', category: 'Edukasi', excerpt: 'Zakat fitrah memiliki banyak keutamaan dan manfaat bagi yang menunaikannya.', icon: '📖', date: '2 Juli 2026' },
        { title: 'Cara Mudah Menghitung Zakat Mal', category: 'Panduan', excerpt: 'Panduan praktis untuk menghitung zakat mal secara tepat dan akurat.', icon: '📊', date: '1 Juli 2026' },
        { title: 'Keistimewaan Bersedekah di Waktu Subuh', category: 'Edukasi', excerpt: 'Sedekah di waktu subuh memiliki keistimewaan dan pahala yang berlipat ganda.', icon: '🌅', date: '30 Juni 2026' }
    ];

    var html = '';
    articles.forEach(function(a) {
        html += `
            <div class="article-card">
                <div class="program-image" style="font-size:40px;color:var(--primary);">${a.icon}</div>
                <div class="article-body">
                    <div class="article-meta">
                        <span><i class="fas fa-tag"></i> ${a.category}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${a.date}</span>
                    </div>
                    <h3>${a.title}</h3>
                    <p class="article-desc">${a.excerpt}</p>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
    console.log('📦 Sample articles loaded!');
}

// ============================================
// LOAD FAQS - TANPA orderBy
// ============================================
async function loadFAQs() {
    var grid = document.getElementById('faqGrid');
    if (!grid) return;

    try {
        var snapshot = await db.collection('faq')
            .where('status', '==', 'active')
            .get();

        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-question"></i><p>Belum ada FAQ</p></div>';
            return;
        }

        var html = '';
        var index = 0;
        snapshot.forEach(function(doc) {
            var faq = { id: doc.id, ...doc.data() };
            var isActive = index === 0 ? 'active' : '';

            html += `
                <div class="faq-item ${isActive}">
                    <div class="faq-question">
                        <span>${faq.question}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `;
            index++;
        });

        grid.innerHTML = html;

        // Re-initialize FAQ click handlers
        document.querySelectorAll('.faq-item').forEach(function(item) {
            var question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', function() {
                    var isActive = item.classList.contains('active');
                    document.querySelectorAll('.faq-item').forEach(function(i) {
                        i.classList.remove('active');
                    });
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
        });

        console.log('✅ FAQs loaded successfully!');
    } catch (error) {
        console.error('Error loading FAQs:', error);
        loadSampleFAQs();
    }
}

// ============================================
// LOAD SAMPLE FAQS (Fallback)
// ============================================
function loadSampleFAQs() {
    var grid = document.getElementById('faqGrid');
    if (!grid) return;

    var faqs = [
        { question: 'Apa itu Filantropi Digital?', answer: 'Filantropi Digital adalah platform digital yang memfasilitasi donasi zakat, infak, sedekah, dan qurban dengan sistem yang transparan dan amanah.' },
        { question: 'Bagaimana cara berdonasi?', answer: 'Anda dapat mendaftar akun, memilih program donasi, menentukan nominal, dan menyelesaikan pembayaran melalui metode yang tersedia.' },
        { question: 'Apakah donasi saya aman?', answer: 'Ya, semua donasi dikelola dengan sistem yang aman dan terpercaya. Kami juga bekerja sama dengan lembaga keuangan terpercaya.' },
        { question: 'Bagaimana cara mendapatkan sertifikat donasi?', answer: 'Setelah donasi berhasil, Anda akan otomatis menerima sertifikat digital melalui email dan dapat diunduh di dashboard Anda.' }
    ];

    var html = '';
    faqs.forEach(function(f, index) {
        var isActive = index === 0 ? 'active' : '';

        html += `
            <div class="faq-item ${isActive}">
                <div class="faq-question">
                    <span>${f.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <p>${f.answer}</p>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;

    // Re-initialize FAQ click handlers
    document.querySelectorAll('.faq-item').forEach(function(item) {
        var question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                var isActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(function(i) {
                    i.classList.remove('active');
                });
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    console.log('📦 Sample FAQs loaded!');
}

// ============================================
// LOAD HERO STATS
// ============================================
async function loadHeroStats() {
    try {
        var totalDonasi = 0;
        var uniqueDonors = new Set();

        if (typeof db !== 'undefined') {
            var donationsSnapshot = await db.collection('donations')
                .where('status', '==', 'completed')
                .get();

            donationsSnapshot.forEach(function(doc) {
                var data = doc.data();
                totalDonasi += data.amount || 0;
                if (data.userId) uniqueDonors.add(data.userId);
            });

            var programsSnapshot = await db.collection('programs')
                .where('status', '==', 'active')
                .get();

            var totalDonasiEl = document.getElementById('totalDonasi');
            var totalDonaturEl = document.getElementById('totalDonatur');
            var totalProgramEl = document.getElementById('totalProgram');

            if (totalDonasiEl) totalDonasiEl.textContent = formatCurrency(totalDonasi);
            if (totalDonaturEl) totalDonaturEl.textContent = uniqueDonors.size || '1.2K';
            if (totalProgramEl) totalProgramEl.textContent = programsSnapshot.size || '12';

            console.log('✅ Hero stats loaded successfully!');
        } else {
            loadSampleHeroStats();
        }
    } catch (error) {
        console.error('Error loading hero stats:', error);
        loadSampleHeroStats();
    }
}

// ============================================
// LOAD SAMPLE HERO STATS (Fallback)
// ============================================
function loadSampleHeroStats() {
    var totalDonasiEl = document.getElementById('totalDonasi');
    var totalDonaturEl = document.getElementById('totalDonatur');
    var totalProgramEl = document.getElementById('totalProgram');

    if (totalDonasiEl) totalDonasiEl.textContent = 'Rp 875.000.000';
    if (totalDonaturEl) totalDonaturEl.textContent = '1.250';
    if (totalProgramEl) totalProgramEl.textContent = '12';

    console.log('📦 Sample hero stats loaded!');
}

console.log('🌙 Filantropi Digital - App.js Loaded Successfully!');
console.log('🤲 "Barangsiapa memberi, maka ia akan mendapatkan balasan"');