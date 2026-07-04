// ============================================
// APP.JS - TANPA orderBy (SEMENTARA)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌙 Filantropi Digital - App loaded!');
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            const icon = this.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }
    
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            navbar.classList.toggle('scrolled', window.scrollY > 100);
        });
    }
    
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            backToTop.classList.toggle('visible', window.scrollY > 300);
        });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (typeof db !== 'undefined') {
        console.log('📡 Firestore connected, loading data...');
        loadPrograms();
        loadTestimonials();
        loadArticles();
        loadFAQs();
        loadHeroStats();
    } else {
        console.warn('⚠️ Firestore not initialized');
    }
});

// ============================================
// LOAD PROGRAMS - TANPA orderBy
// ============================================
async function loadPrograms() {
    const grid = document.getElementById('programGrid');
    if (!grid) return;
    try {
        // 🔥 TANPA orderBy - TIDAK MEMBUTUHKAN INDEX
        const snapshot = await db.collection('programs')
            .where('status', '==', 'active')
            .limit(6)
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada program donasi</p></div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(function(doc) {
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
        console.log('✅ Programs loaded successfully!');
    } catch (error) {
        console.error('Error loading programs:', error);
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Gagal memuat program. Error: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// LOAD TESTIMONIALS - TANPA orderBy
// ============================================
async function loadTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if (!grid) return;
    try {
        // 🔥 TANPA orderBy - TIDAK MEMBUTUHKAN INDEX
        const snapshot = await db.collection('testimonials')
            .where('status', '==', 'published')
            .limit(3)
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-comment"></i><p>Belum ada testimoni</p></div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(function(doc) {
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
        console.log('✅ Testimonials loaded successfully!');
    } catch (error) {
        console.error('Error loading testimonials:', error);
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Gagal memuat testimoni. Error: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// LOAD ARTICLES - TANPA orderBy
// ============================================
async function loadArticles() {
    const grid = document.getElementById('articleGrid');
    if (!grid) return;
    try {
        // 🔥 TANPA orderBy - TIDAK MEMBUTUHKAN INDEX
        const snapshot = await db.collection('articles')
            .where('status', '==', 'published')
            .limit(3)
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>Belum ada artikel</p></div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(function(doc) {
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
        console.log('✅ Articles loaded successfully!');
    } catch (error) {
        console.error('Error loading articles:', error);
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Gagal memuat artikel. Error: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// LOAD FAQS - TANPA orderBy
// ============================================
async function loadFAQs() {
    const grid = document.getElementById('faqGrid');
    if (!grid) return;
    try {
        // 🔥 TANPA orderBy - TIDAK MEMBUTUHKAN INDEX
        const snapshot = await db.collection('faq')
            .where('status', '==', 'active')
            .get();
        
        if (snapshot.empty) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-question"></i><p>Belum ada FAQ</p></div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(function(doc, index) {
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
        document.querySelectorAll('.faq-item').forEach(function(item) {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', function() {
                    const isActive = item.classList.contains('active');
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
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Gagal memuat FAQ. Error: ${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// LOAD HERO STATS
// ============================================
async function loadHeroStats() {
    try {
        const donationsSnapshot = await db.collection('donations')
            .where('status', '==', 'completed')
            .get();
        
        let totalDonasi = 0;
        const uniqueDonors = new Set();
        donationsSnapshot.forEach(function(doc) {
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
        
        console.log('✅ Hero stats loaded successfully!');
    } catch (error) {
        console.error('Error loading hero stats:', error);
    }
}

// ============================================
// TOAST STYLES
// ============================================
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
    .toast i { font-size: 20px; }
    .toast-success i { color: #4CAF50; }
    .toast-error i { color: #dc3545; }
    .toast-info i { color: #2196F3; }
    [data-theme="dark"] .toast {
        background: var(--gray-800);
        color: var(--white);
    }
    .loading-spinner {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px 20px;
        color: var(--gray-500);
    }
    .loading-spinner i {
        font-size: 32px;
        margin-bottom: 12px;
        display: block;
    }
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px 20px;
        color: var(--gray-500);
    }
    .empty-state i {
        font-size: 48px;
        margin-bottom: 12px;
        display: block;
    }
`;
document.head.appendChild(toastStyles);