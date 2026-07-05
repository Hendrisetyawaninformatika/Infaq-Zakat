// ============================================
// ADMIN.JS - FILANTROPI DIGITAL
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentAdminUser = null;
let adminDataCache = {};

// ============================================
// DOM READY - AUTH CHECK
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check Firebase auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                currentAdminUser = user;
                checkAdminRole(user);
            } else {
                window.location.href = 'login.html';
            }
        });
    } else {
        // Fallback: check localStorage
        var userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (userData) {
            try {
                var user = JSON.parse(userData);
                currentAdminUser = user;
                if (user.role === 'admin') {
                    initAdminPanel();
                } else {
                    showToast('Akses ditolak. Anda bukan admin.', 'error');
                    setTimeout(function() { window.location.href = 'dashboard.html'; }, 1500);
                }
            } catch (e) {
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    }
});

// ============================================
// CHECK ADMIN ROLE
// ============================================
async function checkAdminRole(user) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            var doc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (doc.exists) {
                var data = doc.data();
                if (data.role === 'admin') {
                    initAdminPanel();
                } else {
                    showToast('Akses ditolak. Anda bukan admin.', 'error');
                    setTimeout(function() { window.location.href = 'dashboard.html'; }, 1500);
                }
            } else {
                showToast('Data user tidak ditemukan.', 'error');
                setTimeout(function() { window.location.href = 'login.html'; }, 1500);
            }
        } else {
            // Fallback: check localStorage
            var userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
            if (userData) {
                var data = JSON.parse(userData);
                if (data.role === 'admin') {
                    initAdminPanel();
                } else {
                    showToast('Akses ditolak. Anda bukan admin.', 'error');
                    setTimeout(function() { window.location.href = 'dashboard.html'; }, 1500);
                }
            }
        }
    } catch (e) {
        console.error('Error checking admin role:', e);
        showToast('Error: ' + e.message, 'error');
    }
}

// ============================================
// INIT ADMIN PANEL
// ============================================
function initAdminPanel() {
    // Set admin name
    var nameEl = document.getElementById('adminName');
    if (nameEl && currentAdminUser) {
        nameEl.textContent = currentAdminUser.displayName || currentAdminUser.email || 'Administrator';
    }

    // Setup navigation
    setupAdminNavigation();

    // Setup theme
    setupAdminTheme();

    // Setup sidebar toggle
    setupSidebarToggle();

    // Setup logout
    var logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Setup user dropdown
    setupUserDropdown();

    // Load default page
    loadAdminPage('dashboard');

    // Show welcome toast
    setTimeout(function() {
        showToast('👋 Selamat datang, Admin!', 'success');
    }, 500);
}

// ============================================
// SETUP ADMIN NAVIGATION
// ============================================
function setupAdminNavigation() {
    var menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            var page = this.dataset.page;

            // Remove active from all
            menuItems.forEach(function(m) { m.classList.remove('active'); });
            this.classList.add('active');

            // Load page
            loadAdminPage(page);

            // Close sidebar on mobile
            var sidebar = document.getElementById('adminSidebar');
            if (sidebar && window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                document.getElementById('sidebarOverlay').classList.remove('show');
            }
        });
    });
}

// ============================================
// LOAD ADMIN PAGE
// ============================================
function loadAdminPage(page) {
    // Hide all pages
    var pages = document.querySelectorAll('.admin-page');
    pages.forEach(function(p) { p.classList.remove('active'); });

    // Show target page
    var target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');

        // Load page data
        switch (page) {
            case 'dashboard':
                loadDashboardStats();
                loadDashboardCharts();
                loadRecentDonations();
                loadRecentUsers();
                break;
            case 'users':
                loadUsers();
                break;
            case 'programs':
                loadProgramsAdmin();
                break;
            case 'donations':
                loadDonationsAdmin();
                break;
            case 'articles':
                loadArticlesAdmin();
                break;
            case 'faq':
                loadFaqAdmin();
                break;
            case 'testimonials':
                loadTestimonialsAdmin();
                break;
            case 'quiz':
                loadQuizAdmin();
                break;
            case 'chat':
                loadChatAdmin();
                break;
            case 'gallery':
                loadGalleryAdmin();
                break;
            case 'reports':
                loadReports();
                break;
            case 'settings':
                loadSettings();
                break;
            default:
                break;
        }
    }
}

// ============================================
// SETUP SIDEBAR TOGGLE
// ============================================
function setupSidebarToggle() {
    var toggle = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('adminSidebar');
    var overlay = document.getElementById('sidebarOverlay');

    if (toggle && sidebar) {
        toggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('show');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    // Close sidebar on window resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        }
    });
}

// ============================================
// SETUP USER DROPDOWN
// ============================================
function setupUserDropdown() {
    var adminUser = document.getElementById('adminUser');
    var dropdown = document.getElementById('adminDropdown');

    if (adminUser && dropdown) {
        adminUser.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
            if (!adminUser.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
}

// ============================================
// SETUP ADMIN THEME
// ============================================
function setupAdminTheme() {
    var themeToggle = document.getElementById('themeToggle');
    var currentTheme = localStorage.getItem('theme') || 'light';

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) {
            var icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    setTheme(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
}

// ============================================
// HANDLE LOGOUT
// ============================================
function handleLogout(e) {
    e.preventDefault();

    // Show confirmation modal
    var modal = document.getElementById('logoutModal');
    if (modal) {
        modal.classList.add('show');
        return;
    }

    // Fallback: direct logout
    performLogout();
}

function performLogout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(function() {
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            window.location.href = 'login.html';
        }).catch(function(error) {
            showToast('Gagal logout: ' + error.message, 'error');
        });
    } else {
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}

// ============================================
// TOAST FUNCTION
// ============================================
function showToast(message, type) {
    var toast = document.getElementById('toast');
    if (!toast) {
        // Create toast if not exists
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<i class="fas fa-check-circle"></i><span id="toastMessage">Pesan</span>';
        document.body.appendChild(toast);
    }

    var toastMessage = document.getElementById('toastMessage') || toast.querySelector('span');
    var icon = toast.querySelector('i');

    toast.className = 'toast toast-' + (type || 'success');
    icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 4000);
}

// ============================================
// LOAD DASHBOARD STATS
// ============================================
async function loadDashboardStats() {
    try {
        // Simulasi data (ganti dengan Firebase)
        var totalUsers = 1250;
        var totalDonations = 875000000;
        var totalPrograms = 12;
        var totalArticles = 8;

        document.getElementById('adminTotalUsers').textContent = totalUsers.toLocaleString('id-ID');
        document.getElementById('adminTotalDonations').textContent = 'Rp ' + totalDonations.toLocaleString('id-ID');
        document.getElementById('adminTotalPrograms').textContent = totalPrograms;
        document.getElementById('adminTotalArticles').textContent = totalArticles;

        // Jika Firebase tersedia, ambil data real
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                var usersSnapshot = await firebase.firestore().collection('users').get();
                var donationsSnapshot = await firebase.firestore().collection('donations').where('status', '==', 'completed').get();
                var programsSnapshot = await firebase.firestore().collection('programs').get();
                var articlesSnapshot = await firebase.firestore().collection('articles').where('status', '==', 'published').get();

                var total = 0;
                donationsSnapshot.forEach(function(doc) {
                    total += doc.data().amount || 0;
                });

                document.getElementById('adminTotalUsers').textContent = usersSnapshot.size.toLocaleString('id-ID');
                document.getElementById('adminTotalDonations').textContent = 'Rp ' + total.toLocaleString('id-ID');
                document.getElementById('adminTotalPrograms').textContent = programsSnapshot.size;
                document.getElementById('adminTotalArticles').textContent = articlesSnapshot.size;
            } catch (firestoreError) {
                console.log('Firestore not available, using sample data');
            }
        }
    } catch (e) {
        console.error('Error loading dashboard stats:', e);
    }
}

// ============================================
// LOAD DASHBOARD CHARTS
// ============================================
function loadDashboardCharts() {
    // Donation Chart (Bar)
    var ctx1 = document.getElementById('donationChartAdmin');
    if (ctx1 && typeof Chart !== 'undefined') {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [{
                    label: 'Donasi (Juta)',
                    data: [25, 30, 22, 35, 40, 28, 45, 50, 38, 42, 55, 60],
                    backgroundColor: 'rgba(46,125,50,0.7)',
                    borderColor: '#2E7D32',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { size: 10 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }

    // User Distribution Chart (Doughnut)
    var ctx2 = document.getElementById('userChartAdmin');
    if (ctx2 && typeof Chart !== 'undefined') {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Zakat', 'Infak', 'Sedekah', 'Qurban'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#2E7D32', '#4CAF50', '#FFD700', '#FF9800'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 },
                            padding: 10,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
}

// ============================================
// LOAD RECENT DONATIONS
// ============================================
function loadRecentDonations() {
    var container = document.getElementById('recentDonationsAdmin');
    if (!container) return;

    var donations = [
        { name: 'Ahmad Fauzi', amount: 500000, time: '2 jam lalu' },
        { name: 'Siti Rahmah', amount: 250000, time: '4 jam lalu' },
        { name: 'Muhammad Rizki', amount: 1000000, time: '6 jam lalu' },
        { name: 'Dewi Anggraini', amount: 75000, time: '8 jam lalu' }
    ];

    container.innerHTML = donations.map(function(d) {
        var initial = d.name.charAt(0);
        return `
            <div class="recent-item">
                <div class="avatar">${initial}</div>
                <div class="info">
                    <div class="name">${d.name}</div>
                    <div class="detail">${d.time}</div>
                </div>
                <div class="amount">Rp ${d.amount.toLocaleString('id-ID')}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// LOAD RECENT USERS
// ============================================
function loadRecentUsers() {
    var container = document.getElementById('recentUsersAdmin');
    if (!container) return;

    var users = [
        { name: 'Budi Santoso', email: 'budi@email.com', time: '1 jam lalu' },
        { name: 'Dewi Anggraini', email: 'dewi@email.com', time: '3 jam lalu' },
        { name: 'Fajar Ramadhan', email: 'fajar@email.com', time: '5 jam lalu' },
        { name: 'Nina Suryani', email: 'nina@email.com', time: '7 jam lalu' }
    ];

    container.innerHTML = users.map(function(u) {
        var initial = u.name.charAt(0);
        return `
            <div class="recent-item">
                <div class="avatar">${initial}</div>
                <div class="info">
                    <div class="name">${u.name}</div>
                    <div class="detail">${u.email} • ${u.time}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// LOAD USERS (Admin Page)
// ============================================
async function loadUsers() {
    var container = document.getElementById('page-users');
    if (!container) return;

    // Sample users
    var users = [
        { id: '1', name: 'Ahmad Fauzi', email: 'ahmad@email.com', role: 'Donatur', status: 'Aktif', joined: '2026-07-01' },
        { id: '2', name: 'Siti Rahmah', email: 'siti@email.com', role: 'Donatur', status: 'Aktif', joined: '2026-06-28' },
        { id: '3', name: 'Muhammad Rizki', email: 'rizki@email.com', role: 'Admin', status: 'Aktif', joined: '2026-06-15' },
        { id: '4', name: 'Dewi Anggraini', email: 'dewi@email.com', role: 'Donatur', status: 'Tidak Aktif', joined: '2026-05-20' }
    ];

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-users"></i> Kelola User</h1>
            <div class="admin-actions">
                <button class="btn btn-primary btn-sm" onclick="exportUsers()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Bergabung</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(function(u) {
                        var statusClass = u.status === 'Aktif' ? 'status-active' : 'status-inactive';
                        return `
                            <tr>
                                <td><strong>${u.name}</strong></td>
                                <td>${u.email}</td>
                                <td><span class="role-badge">${u.role}</span></td>
                                <td><span class="status-badge ${statusClass}">${u.status}</span></td>
                                <td>${u.joined}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editUser('${u.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD PROGRAMS (Admin Page)
// ============================================
async function loadProgramsAdmin() {
    var container = document.getElementById('page-programs');
    if (!container) return;

    var programs = [
        { id: '1', title: 'Program Zakat Fitrah 2026', category: 'Zakat', target: 10000000, raised: 7500000, status: 'Aktif' },
        { id: '2', title: 'Infak Pembangunan Masjid', category: 'Infak', target: 8000000, raised: 4500000, status: 'Aktif' },
        { id: '3', title: 'Sedekah Buku untuk Anak', category: 'Sedekah', target: 5000000, raised: 2300000, status: 'Aktif' },
        { id: '4', title: 'Qurban 2026', category: 'Qurban', target: 20000000, raised: 12000000, status: 'Selesai' }
    ];

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-charity"></i> Kelola Program</h1>
            <button class="btn btn-primary btn-sm" onclick="openProgramModal()">
                <i class="fas fa-plus"></i> Tambah Program
            </button>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Judul</th>
                        <th>Kategori</th>
                        <th>Target</th>
                        <th>Terkumpul</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${programs.map(function(p) {
                        var percent = Math.round((p.raised / p.target) * 100);
                        var statusClass = p.status === 'Aktif' ? 'status-active' : 'status-inactive';
                        return `
                            <tr>
                                <td><strong>${p.title}</strong></td>
                                <td>${p.category}</td>
                                <td>Rp ${p.target.toLocaleString('id-ID')}</td>
                                <td>Rp ${p.raised.toLocaleString('id-ID')} (${percent}%)</td>
                                <td><span class="status-badge ${statusClass}">${p.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editProgram('${p.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteProgram('${p.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD DONATIONS (Admin Page)
// ============================================
async function loadDonationsAdmin() {
    var container = document.getElementById('page-donations');
    if (!container) return;

    var donations = [
        { id: '1', donor: 'Ahmad Fauzi', program: 'Zakat Fitrah', amount: 150000, date: '2026-07-04', status: 'Selesai' },
        { id: '2', donor: 'Siti Rahmah', program: 'Infak Masjid', amount: 75000, date: '2026-07-03', status: 'Selesai' },
        { id: '3', donor: 'Muhammad Rizki', program: 'Qurban 2026', amount: 200000, date: '2026-07-02', status: 'Pending' },
        { id: '4', donor: 'Dewi Anggraini', program: 'Sedekah Buku', amount: 50000, date: '2026-07-01', status: 'Gagal' }
    ];

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-hand-holding-usd"></i> Kelola Donasi</h1>
            <button class="btn btn-primary btn-sm" onclick="exportDonations()">
                <i class="fas fa-download"></i> Export
            </button>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Donatur</th>
                        <th>Program</th>
                        <th>Nominal</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${donations.map(function(d) {
                        var statusClass = d.status === 'Selesai' ? 'status-active' : d.status === 'Pending' ? 'status-pending' : 'status-inactive';
                        return `
                            <tr>
                                <td><strong>${d.donor}</strong></td>
                                <td>${d.program}</td>
                                <td>Rp ${d.amount.toLocaleString('id-ID')}</td>
                                <td>${d.date}</td>
                                <td><span class="status-badge ${statusClass}">${d.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editDonation('${d.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteDonation('${d.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD ARTICLES (Admin Page)
// ============================================
async function loadArticlesAdmin() {
    var container = document.getElementById('page-articles');
    if (!container) return;

    var articles = [
        { id: '1', title: 'Keutamaan Zakat Fitrah', category: 'Edukasi', date: '2026-07-04', status: 'Published' },
        { id: '2', title: 'Cara Menghitung Zakat Mal', category: 'Panduan', date: '2026-07-03', status: 'Published' },
        { id: '3', title: 'Sedekah di Waktu Subuh', category: 'Edukasi', date: '2026-07-01', status: 'Draft' }
    ];

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-newspaper"></i> Kelola Artikel</h1>
            <button class="btn btn-primary btn-sm" onclick="openArticleModal()">
                <i class="fas fa-plus"></i> Tambah Artikel
            </button>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Judul</th>
                        <th>Kategori</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${articles.map(function(a) {
                        var statusClass = a.status === 'Published' ? 'status-active' : 'status-pending';
                        return `
                            <tr>
                                <td><strong>${a.title}</strong></td>
                                <td>${a.category}</td>
                                <td>${a.date}</td>
                                <td><span class="status-badge ${statusClass}">${a.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editArticle('${a.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteArticle('${a.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD FAQ (Admin Page)
// ============================================
async function loadFaqAdmin() {
    var container = document.getElementById('page-faq');
    if (!container) return;

    var faqs = [
        { id: '1', question: 'Apa itu Filantropi Digital?', answer: 'Platform filantropi digital...', status: 'Published' },
        { id: '2', question: 'Bagaimana cara berdonasi?', answer: 'Anda dapat mendaftar akun...', status: 'Published' },
        { id: '3', question: 'Apakah donasi saya aman?', answer: 'Ya, semua donasi dikelola...', status: 'Draft' }
    ];

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-question-circle"></i> Kelola FAQ</h1>
            <button class="btn btn-primary btn-sm" onclick="openFaqModal()">
                <i class="fas fa-plus"></i> Tambah FAQ
            </button>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Pertanyaan</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${faqs.map(function(f) {
                        var statusClass = f.status === 'Published' ? 'status-active' : 'status-pending';
                        return `
                            <tr>
                                <td><strong>${f.question}</strong></td>
                                <td><span class="status-badge ${statusClass}">${f.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editFaq('${f.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteFaq('${f.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD TESTIMONIALS (Admin Page)
// ============================================
async function loadTestimonialsAdmin() {
    var container = document.getElementById('page-testimonials');
    if (!container) return;

    var testimonials = [
        { id: '1', name: 'Ahmad Fauzi', text: 'Alhamdulillah, sangat mudah...', rating: 5, status: 'Published' },
        { id: '2', name: 'Siti Rahmah', text: 'Platform yang sangat membantu...', rating: 5, status: 'Published' }
    ];

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-comment"></i> Kelola Testimoni</h1>
            <button class="btn btn-primary btn-sm" onclick="openTestimonialModal()">
                <i class="fas fa-plus"></i> Tambah Testimoni
            </button>
        </div>
        <div class="table-responsive">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Testimoni</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${testimonials.map(function(t) {
                        var stars = '★'.repeat(t.rating);
                        var statusClass = t.status === 'Published' ? 'status-active' : 'status-pending';
                        return `
                            <tr>
                                <td><strong>${t.name}</strong></td>
                                <td>${t.text.substring(0, 30)}...</td>
                                <td style="color: #FFD700;">${stars}</td>
                                <td><span class="status-badge ${statusClass}">${t.status}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="editTestimonial('${t.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${t.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD QUIZ (Admin Page)
// ============================================
async function loadQuizAdmin() {
    var container = document.getElementById('page-quiz');
    if (!container) return;

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-mosque"></i> Kelola Quiz</h1>
            <button class="btn btn-primary btn-sm" onclick="openQuizModal()">
                <i class="fas fa-plus"></i> Tambah Quiz
            </button>
        </div>
        <div class="card">
            <p style="text-align:center; padding:40px 20px; color:var(--text-light);">
                <i class="fas fa-info-circle" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                Fitur kelola quiz akan segera tersedia
            </p>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD CHAT (Admin Page)
// ============================================
async function loadChatAdmin() {
    var container = document.getElementById('page-chat');
    if (!container) return;

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-comments"></i> Kelola Chat</h1>
        </div>
        <div class="card">
            <p style="text-align:center; padding:40px 20px; color:var(--text-light);">
                <i class="fas fa-info-circle" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                Fitur kelola chat akan segera tersedia
            </p>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD GALLERY (Admin Page)
// ============================================
async function loadGalleryAdmin() {
    var container = document.getElementById('page-gallery');
    if (!container) return;

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-images"></i> Kelola Galeri</h1>
            <button class="btn btn-primary btn-sm" onclick="openGalleryModal()">
                <i class="fas fa-plus"></i> Upload Gambar
            </button>
        </div>
        <div class="card">
            <p style="text-align:center; padding:40px 20px; color:var(--text-light);">
                <i class="fas fa-info-circle" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                Fitur kelola galeri akan segera tersedia
            </p>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD REPORTS (Admin Page)
// ============================================
async function loadReports() {
    var container = document.getElementById('page-reports');
    if (!container) return;

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-file-alt"></i> Laporan</h1>
        </div>
        <div class="card">
            <p style="text-align:center; padding:40px 20px; color:var(--text-light);">
                <i class="fas fa-info-circle" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                Fitur laporan akan segera tersedia
            </p>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// LOAD SETTINGS (Admin Page)
// ============================================
async function loadSettings() {
    var container = document.getElementById('page-settings');
    if (!container) return;

    var html = `
        <div class="admin-page-header">
            <h1><i class="fas fa-cog"></i> Setting Website</h1>
        </div>
        <div class="card">
            <p style="text-align:center; padding:40px 20px; color:var(--text-light);">
                <i class="fas fa-info-circle" style="font-size:32px;display:block;margin-bottom:12px;"></i>
                Fitur setting website akan segera tersedia
            </p>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// CRUD FUNCTIONS (Placeholder)
// ============================================
window.editUser = function(id) {
    showToast('Fitur edit user akan segera tersedia', 'info');
};

window.deleteUser = async function(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            await firebase.firestore().collection('users').doc(id).delete();
        }
        showToast('User berhasil dihapus', 'success');
        loadUsers();
    } catch (e) {
        showToast('Gagal menghapus user: ' + e.message, 'error');
    }
};

window.editProgram = function(id) {
    showToast('Fitur edit program akan segera tersedia', 'info');
};

window.deleteProgram = function(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus program ini?')) return;
    showToast('Program berhasil dihapus', 'success');
    loadProgramsAdmin();
};

window.editDonation = function(id) {
    showToast('Fitur edit donasi akan segera tersedia', 'info');
};

window.deleteDonation = function(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus donasi ini?')) return;
    showToast('Donasi berhasil dihapus', 'success');
    loadDonationsAdmin();
};

window.editArticle = function(id) {
    showToast('Fitur edit artikel akan segera tersedia', 'info');
};

window.deleteArticle = function(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    showToast('Artikel berhasil dihapus', 'success');
    loadArticlesAdmin();
};

window.editFaq = function(id) {
    showToast('Fitur edit FAQ akan segera tersedia', 'info');
};

window.deleteFaq = function(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return;
    showToast('FAQ berhasil dihapus', 'success');
    loadFaqAdmin();
};

window.editTestimonial = function(id) {
    showToast('Fitur edit testimoni akan segera tersedia', 'info');
};

window.deleteTestimonial = function(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;
    showToast('Testimoni berhasil dihapus', 'success');
    loadTestimonialsAdmin();
};

window.openProgramModal = function() {
    showToast('Fitur tambah program akan segera tersedia', 'info');
};

window.openArticleModal = function() {
    showToast('Fitur tambah artikel akan segera tersedia', 'info');
};

window.openFaqModal = function() {
    showToast('Fitur tambah FAQ akan segera tersedia', 'info');
};

window.openTestimonialModal = function() {
    showToast('Fitur tambah testimoni akan segera tersedia', 'info');
};

window.openQuizModal = function() {
    showToast('Fitur tambah quiz akan segera tersedia', 'info');
};

window.openGalleryModal = function() {
    showToast('Fitur upload gambar akan segera tersedia', 'info');
};

window.closeModal = function(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

window.exportUsers = function() {
    showToast('Export user akan segera tersedia', 'info');
};

window.exportDonations = function() {
    showToast('Export donasi akan segera tersedia', 'info');
};

window.generateReport = function(type) {
    showToast('Laporan ' + type + ' akan segera tersedia', 'info');
};

// ============================================
// ADDITIONAL ADMIN STYLES (Dynamic)
// ============================================
function addAdminStyles() {
    var style = document.createElement('style');
    style.textContent = `
        .admin-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        .admin-table th {
            text-align: left;
            padding: 12px 16px;
            background: var(--bg);
            color: var(--text-light);
            font-weight: 600;
            border-bottom: 2px solid rgba(0,0,0,0.04);
        }
        .admin-table td {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(0,0,0,0.03);
            color: var(--text);
        }
        .admin-table tr:hover td {
            background: var(--bg);
        }
        .admin-table .btn-sm {
            padding: 4px 10px;
            font-size: 12px;
            margin: 0 2px;
        }
        .admin-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .status-badge {
            padding: 2px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-active {
            background: #d4edda;
            color: #155724;
        }
        .status-inactive {
            background: #f8d7da;
            color: #721c24;
        }
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        .role-badge {
            padding: 2px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(46,125,50,0.1);
            color: var(--primary);
        }
        .card {
            background: var(--card);
            border-radius: var(--radius);
            padding: 20px;
            box-shadow: var(--shadow);
            border: 1px solid rgba(0,0,0,0.04);
        }
        .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 768px) {
            .admin-table {
                font-size: 12px;
            }
            .admin-table th,
            .admin-table td {
                padding: 8px 10px;
            }
            .admin-table .btn-sm {
                padding: 2px 6px;
                font-size: 10px;
            }
            .admin-actions {
                flex-direction: column;
                align-items: stretch;
            }
            .admin-actions .btn {
                width: 100%;
                justify-content: center;
            }
        }
        @media (max-width: 480px) {
            .admin-table {
                font-size: 11px;
            }
            .admin-table th,
            .admin-table td {
                padding: 6px 8px;
            }
            .status-badge {
                font-size: 10px;
                padding: 1px 8px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Call after DOM ready
document.addEventListener('DOMContentLoaded', function() {
    addAdminStyles();
});

// ============================================
// LOGOUT MODAL CONFIRMATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    var cancelBtn = document.getElementById('cancelLogoutBtn');
    var confirmBtn = document.getElementById('confirmLogoutBtn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            var modal = document.getElementById('logoutModal');
            if (modal) modal.classList.remove('show');
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            var modal = document.getElementById('logoutModal');
            if (modal) modal.classList.remove('show');
            performLogout();
        });
    }

    // Close modal on outside click
    var modal = document.getElementById('logoutModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Close modal on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var modal = document.getElementById('logoutModal');
            if (modal && modal.classList.contains('show')) {
                modal.classList.remove('show');
            }
        }
    });
});

console.log('🌙 Filantropi Digital - Admin Panel Loaded Successfully!');
console.log('🤲 "Barangsiapa memberi, maka ia akan mendapatkan balasan"');