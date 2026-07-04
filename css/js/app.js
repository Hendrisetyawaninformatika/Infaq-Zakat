// ============================================
// MAIN APPLICATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ============================================
    // LOADER
    // ============================================
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 800);
    }
    
    // ============================================
    // NAVBAR
    // ============================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 100);
        });
    }
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
                if (navToggle) {
                    const icon = navToggle.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    });
    
    // ============================================
    // THEME TOGGLE
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    setTheme(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
    
    // ============================================
    // BACK TO TOP
    // ============================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // ============================================
    // STATISTICS COUNTER
    // ============================================
    const statNumbers = document.querySelectorAll('.stats-number[data-count]');
    if (statNumbers.length) {
        const animateStats = () => {
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-count'));
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        stat.textContent = Math.round(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = target.toLocaleString();
                    }
                };
                updateCounter();
            });
        };
        
        const statsSection = document.querySelector('.statistics');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateStats();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(statsSection);
        }
    }
    
    // ============================================
    // FAQ ACCORDION
    // ============================================
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    faqItems.forEach(i => i.classList.remove('active'));
                    if (!isActive) item.classList.add('active');
                });
            }
        });
    }
    
    // ============================================
    // PROGRAM CATEGORY FILTER
    // ============================================
    const categoryBtns = document.querySelectorAll('.category-btn');
    const programGrid = document.getElementById('programGrid');
    
    if (categoryBtns.length && programGrid) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterPrograms(btn.dataset.category);
            });
        });
    }
    
    function filterPrograms(category) {
        const cards = document.querySelectorAll('.program-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // ============================================
    // NEWSLETTER
    // ============================================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            if (!validateEmail(email)) {
                showToast('Email tidak valid', 'error');
                return;
            }
            
            try {
                await db.collection('newsletter').add({
                    email: email,
                    subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast('Terima kasih telah berlangganan!', 'success');
                newsletterForm.reset();
            } catch (error) {
                showToast('Gagal berlangganan. Silakan coba lagi.', 'error');
            }
        });
    }
    
    // ============================================
    // LAZY LOAD IMAGES
    // ============================================
    lazyLoadImages();
    
    // ============================================
    // LOAD DATA FROM FIRESTORE
    // ============================================
    loadPrograms();
    loadTestimonials();
    loadArticles();
    loadFAQs();
    loadHeroStats();
});

// ============================================
// DATA LOADING FUNCTIONS
// ============================================

async function loadPrograms() {
    const grid = document.getElementById('programGrid');
    if (!grid) return;
    
    try {
        const snapshot = await db.collection('programs')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(6)
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada program donasi</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const program = { id: doc.id, ...doc.data() };
            const progress = ((program.collected || 0) / (program.target || 1)) * 100;
            
            html += `
                <div class="program-card" data-category="${program.category}">
                    <img src="${program.image || 'assets/program-default.jpg'}" alt="${program.title}" loading="lazy">
                    <div class="program-body">
                        <span class="program-category">${program.category.toUpperCase()}</span>
                        <h3>${program.title}</h3>
                        <p>${truncateText(program.description || '', 100)}</p>
                        <div class="program-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                            </div>
                            <div class="progress-info">
                                <span>Terkumpul: ${formatCurrency(program.collected || 0)}</span>
                                <span>Target: ${formatCurrency(program.target)}</span>
                            </div>
                        </div>
                        <div class="program-footer">
                            <span class="program-donors">
                                <i class="fas fa-user"></i> ${program.donors || 0} Donatur
                            </span>
                            <a href="detail-program.html?id=${program.id}" class="btn btn-primary btn-sm">
                                Donasi
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    } catch (error) {
        console.error('Error loading programs:', error);
    }
}

async function loadTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if (!grid) return;
    
    try {
        const snapshot = await db.collection('testimonials')
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc')
            .limit(3)
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment"></i>
                    <p>Belum ada testimoni</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const testimonial = { id: doc.id, ...doc.data() };
            const stars = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5));
            
            html += `
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="${testimonial.avatar || 'assets/default-avatar.png'}" 
                             alt="${testimonial.name}" 
                             class="testimonial-avatar">
                        <div>
                            <div class="testimonial-name">${testimonial.name}</div>
                            <div class="testimonial-role">${testimonial.role || 'Donatur'}</div>
                        </div>
                    </div>
                    <div class="testimonial-text">"${testimonial.content}"</div>
                    <div class="testimonial-stars">${stars}</div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

async function loadArticles() {
    const grid = document.getElementById('articleGrid');
    if (!grid) return;
    
    try {
        const snapshot = await db.collection('articles')
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc')
            .limit(3)
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p>Belum ada artikel</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const article = { id: doc.id, ...doc.data() };
            
            html += `
                <div class="article-card">
                    <img src="${article.image || 'assets/article-default.jpg'}" 
                         alt="${article.title}" 
                         loading="lazy">
                    <div class="article-body">
                        <div class="article-meta">
                            <span><i class="fas fa-tag"></i> ${article.category || 'Umum'}</span>
                            <span><i class="fas fa-calendar"></i> ${formatDate(article.createdAt)}</span>
                        </div>
                        <h3>${article.title}</h3>
                        <p>${truncateText(article.excerpt || article.content || '', 120)}</p>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

async function loadFAQs() {
    const grid = document.getElementById('faqGrid');
    if (!grid) return;
    
    try {
        const snapshot = await db.collection('faq')
            .where('status', '==', 'active')
            .orderBy('order', 'asc')
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question"></i>
                    <p>Belum ada FAQ</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        snapshot.forEach((doc, index) => {
            const faq = { id: doc.id, ...doc.data() };
            const isActive = index === 0 ? 'active' : '';
            
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
        });
        
        grid.innerHTML = html;
        
        // Re-initialize FAQ click handlers
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                    if (!isActive) item.classList.add('active');
                });
            }
        });
        
    } catch (error) {
        console.error('Error loading FAQs:', error);
    }
}

async function loadHeroStats() {
    try {
        const donationsSnapshot = await db.collection('donations')
            .where('status', '==', 'completed')
            .get();
        
        let totalDonasi = 0;
        const uniqueDonors = new Set();
        donationsSnapshot.forEach(doc => {
            const data = doc.data();
            totalDonasi += data.amount || 0;
            if (data.userId) uniqueDonors.add(data.userId);
        });
        
        const programsSnapshot = await db.collection('programs')
            .where('status', '==', 'active')
            .get();
        
        const totalDonasiEl = document.getElementById('totalDonasi');
        const totalDonaturEl = document.getElementById('totalDonatur');
        const totalProgramEl = document.getElementById('totalProgram');
        
        if (totalDonasiEl) totalDonasiEl.textContent = formatCurrency(totalDonasi);
        if (totalDonaturEl) totalDonaturEl.textContent = uniqueDonors.size;
        if (totalProgramEl) totalProgramEl.textContent = programsSnapshot.size;
        
    } catch (error) {
        console.error('Error loading hero stats:', error);
    }
}

// Toast styles (inject once)
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        top: 80px;
        right: 24px;
        padding: 16px 24px;
        background: var(--white);
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        border-left: 4px solid var(--primary);
    }
    .toast.show { transform: translateX(0); }
    .toast-success { border-left-color: #4CAF50; }
    .toast-error { border-left-color: #dc3545; }
    .toast-info { border-left-color: #2196F3; }
    .toast-warning { border-left-color: #FF9800; }
    .toast i { font-size: 20px; }
    .toast-success i { color: #4CAF50; }
    .toast-error i { color: #dc3545; }
    .toast-info i { color: #2196F3; }
    .toast-warning i { color: #FF9800; }
    [data-theme="dark"] .toast {
        background: var(--gray-800);
        color: var(--white);
    }
`;
document.head.appendChild(toastStyles);