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
    
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
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
        loadPrograms();
        loadTestimonials();
        loadArticles();
        loadFAQs();
        loadHeroStats();
    }
});

async function loadPrograms() {
    const grid = document.getElementById('programGrid');
    if (!grid) return;
    try {
        const snapshot = await db.collection('programs').where('status', '==', 'active').orderBy('createdAt', 'desc').limit(6).get();
        if (snapshot.empty) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada program</p></div>'; return; }
        let html = '';
        snapshot.forEach(doc => {
            const p = { id: doc.id, ...doc.data() };
            const progress = ((p.collected || 0) / (p.target || 1)) * 100;
            html += `
                <div class="program-card" data-category="${p.category}">
                    <img src="${p.image || 'assets/program-default.jpg'}" alt="${p.title}" loading="lazy">
                    <div class="program-body">
                        <span class="program-category">${p.category.toUpperCase()}</span>
                        <h3>${p.title}</h3>
                        <p>${truncateText(p.description || '', 80)}</p>
                        <div class="program-progress">
                            <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(progress,100)}%"></div></div>
                            <div class="progress-info"><span>Terkumpul: ${formatCurrency(p.collected||0)}</span><span>Target: ${formatCurrency(p.target)}</span></div>
                        </div>
                        <div class="program-footer">
                            <span class="program-donors"><i class="fas fa-user"></i> ${p.donors||0} Donatur</span>
                            <a href="detail-program.html?id=${p.id}" class="btn btn-primary btn-sm">Donasi</a>
                        </div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    } catch(e) { console.error('Error loading programs:', e); }
}

async function loadTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if (!grid) return;
    try {
        const snapshot = await db.collection('testimonials').where('status','==','published').orderBy('createdAt','desc').limit(3).get();
        if (snapshot.empty) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-comment"></i><p>Belum ada testimoni</p></div>'; return; }
        let html = '';
        snapshot.forEach(doc => {
            const t = { id: doc.id, ...doc.data() };
            const stars = '★'.repeat(t.rating||5) + '☆'.repeat(5-(t.rating||5));
            html += `
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="${t.avatar||'assets/default-avatar.png'}" alt="${t.name}" class="testimonial-avatar">
                        <div><div class="testimonial-name">${t.name}</div><div class="testimonial-role">${t.role||'Donatur'}</div></div>
                    </div>
                    <div class="testimonial-text">"${t.content}"</div>
                    <div class="testimonial-stars">${stars}</div>
                </div>
            `;
        });
        grid.innerHTML = html;
    } catch(e) { console.error('Error loading testimonials:', e); }
}

async function loadArticles() {
    const grid = document.getElementById('articleGrid');
    if (!grid) return;
    try {
        const snapshot = await db.collection('articles').where('status','==','published').orderBy('createdAt','desc').limit(3).get();
        if (snapshot.empty) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>Belum ada artikel</p></div>'; return; }
        let html = '';
        snapshot.forEach(doc => {
            const a = { id: doc.id, ...doc.data() };
            html += `
                <div class="article-card">
                    <img src="${a.image||'assets/article-default.jpg'}" alt="${a.title}" loading="lazy">
                    <div class="article-body">
                        <div class="article-meta"><span><i class="fas fa-tag"></i> ${a.category||'Umum'}</span><span><i class="fas fa-calendar"></i> ${formatDate(a.createdAt)}</span></div>
                        <h3>${a.title}</h3>
                        <p>${truncateText(a.excerpt||a.content||'',100)}</p>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    } catch(e) { console.error('Error loading articles:', e); }
}

async function loadFAQs() {
    const grid = document.getElementById('faqGrid');
    if (!grid) return;
    try {
        const snapshot = await db.collection('faq').where('status','==','active').orderBy('order','asc').get();
        if (snapshot.empty) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-question"></i><p>Belum ada FAQ</p></div>'; return; }
        let html = '';
        snapshot.forEach((doc, i) => {
            const f = { id: doc.id, ...doc.data() };
            const active = i === 0 ? 'active' : '';
            html += `
                <div class="faq-item ${active}">
                    <div class="faq-question"><span>${f.question}</span><i class="fas fa-chevron-down"></i></div>
                    <div class="faq-answer"><p>${f.answer}</p></div>
                </div>
            `;
        });
        grid.innerHTML = html;
        document.querySelectorAll('.faq-item').forEach(item => {
            const q = item.querySelector('.faq-question');
            if (q) q.addEventListener('click', function() {
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                item.classList.toggle('active');
            });
        });
    } catch(e) { console.error('Error loading FAQs:', e); }
}

async function loadHeroStats() {
    try {
        const donations = await db.collection('donations').where('status','==','completed').get();
        let total = 0; const donors = new Set();
        donations.forEach(d => { total += d.data().amount||0; if(d.data().userId) donors.add(d.data().userId); });
        const programs = await db.collection('programs').where('status','==','active').get();
        const el1 = document.getElementById('totalDonasi'); if(el1) el1.textContent = formatCurrency(total);
        const el2 = document.getElementById('totalDonatur'); if(el2) el2.textContent = donors.size;
        const el3 = document.getElementById('totalProgram'); if(el3) el3.textContent = programs.size;
    } catch(e) { console.error('Error loading hero stats:', e); }
}