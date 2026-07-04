document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) { window.location.href = 'login.html'; return; }
    checkAdmin();
});

async function checkAdmin() {
    const result = await FirestoreService.get('users', currentUser.uid);
    if (result.success && result.data.role === 'admin') { initAdminPanel(); } 
    else { showToast('Akses ditolak. Anda bukan admin.', 'error'); setTimeout(() => window.location.href = 'dashboard.html', 1500); }
}

function initAdminPanel() {
    setupAdminNavigation();
    setupAdminTheme();
    loadAdminPage('dashboard');
    setupSidebarToggle();
    document.getElementById('adminLogout')?.addEventListener('click', handleLogout);
}

function setupAdminNavigation() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            loadAdminPage(page);
            const sidebar = document.getElementById('adminSidebar');
            if (sidebar && window.innerWidth <= 768) { sidebar.classList.remove('open'); }
        });
    });
}

function loadAdminPage(page) {
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');
    switch(page) {
        case 'dashboard': loadDashboardStats(); loadDashboardCharts(); loadRecentDonations(); loadRecentUsers(); break;
        case 'users': loadUsers(); break;
        case 'programs': loadProgramsAdmin(); break;
        case 'donations': loadDonationsAdmin(); break;
        case 'articles': loadArticlesAdmin(); break;
        case 'faq': loadFaqAdmin(); break;
        case 'testimonials': loadTestimonialsAdmin(); break;
        case 'quiz': loadQuizAdmin(); break;
        case 'chat': loadChatAdmin(); break;
        case 'gallery': loadGalleryAdmin(); break;
        case 'settings': loadSettings(); break;
    }
}

async function loadDashboardStats() {
    try {
        const users = await db.collection('users').get();
        const donations = await db.collection('donations').where('status','==','completed').get();
        let total = 0; donations.forEach(d => { total += d.data().amount||0; });
        const programs = await db.collection('programs').get();
        const articles = await db.collection('articles').where('status','==','published').get();
        document.getElementById('adminTotalUsers').textContent = users.size;
        document.getElementById('adminTotalDonations').textContent = formatCurrency(total);
        document.getElementById('adminTotalPrograms').textContent = programs.size;
        document.getElementById('adminTotalArticles').textContent = articles.size;
    } catch(e) { console.error('Error loading dashboard stats:', e); }
}

function setupSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => { sidebar.classList.toggle('open'); });
    }
}

function setupAdminTheme() {
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
}

// Placeholder functions for admin CRUD
window.editUser = function(id) { showToast('Fitur edit user akan segera tersedia', 'info'); };
window.deleteUser = async function(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try { await db.collection('users').doc(id).delete(); showToast('User berhasil dihapus', 'success'); loadUsers(); } 
    catch(e) { showToast('Gagal menghapus user', 'error'); }
};
window.openProgramModal = function(id) { showToast('Fitur tambah program akan segera tersedia', 'info'); };
window.closeModal = function(id) { document.getElementById(id).classList.remove('active'); };
window.exportUsers = function() { showToast('Export user akan segera tersedia', 'info'); };
window.exportDonations = function() { showToast('Export donasi akan segera tersedia', 'info'); };
window.generateReport = function(type) { showToast(`Laporan ${type} akan segera tersedia`, 'info'); };