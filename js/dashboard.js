// ============================================
// DASHBOARD.JS - FILANTROPI DIGITAL
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================
var dashboardLoaded = false;

// ============================================
// TOAST FUNCTION
// ============================================
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
                     type === 'warning' ? 'fas fa-exclamation-triangle' : 
                     type === 'info' ? 'fas fa-info-circle' : 'fas fa-check-circle';
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 4000);
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
        .toast-warning { border-left-color: #FF9800; }
        .toast-info { border-left-color: #2196F3; }
        .toast i { font-size: 20px; }
        .toast-success i { color: #4CAF50; }
        .toast-error i { color: #dc3545; }
        .toast-warning i { color: #FF9800; }
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
// FORMAT FUNCTIONS
// ============================================
function formatCurrency(amount) {
    if (!amount) return 'Rp 0';
    return 'Rp ' + amount.toLocaleString('id-ID');
}

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

function formatTime(timestamp) {
    if (!timestamp) return '-';
    var date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard page loaded');

    // Init toast styles
    initToastStyles();

    // Check authentication
    var userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    var user = null;

    if (userData) {
        try {
            user = JSON.parse(userData);
            console.log('✅ User found from localStorage:', user.email);
        } catch (e) {
            console.log('❌ Invalid user data');
        }
    }

    // Check Firebase auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser) {
                console.log('✅ Firebase user authenticated:', firebaseUser.email);
                window.currentUser = firebaseUser;
                
                // Update user data
                var userDataObj = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || 'User',
                    name: firebaseUser.displayName || 'User'
                };
                
                if (!userData) {
                    localStorage.setItem('userData', JSON.stringify(userDataObj));
                }
                
                if (!dashboardLoaded) {
                    initDashboard();
                }
            } else {
                console.log('⏳ No user logged in');
                showToast('Silakan login terlebih dahulu', 'warning');
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 1500);
            }
        });
    } else if (user) {
        // Fallback: use localStorage user
        window.currentUser = {
            uid: user.uid || 'user_' + Date.now(),
            email: user.email,
            displayName: user.displayName || user.name || 'User',
            name: user.name || 'User'
        };
        window.currentUserData = user;
        if (!dashboardLoaded) {
            initDashboard();
        }
    } else {
        showToast('Silakan login terlebih dahulu', 'warning');
        setTimeout(function() {
            window.location.href = 'login.html';
        }, 1500);
    }
});

// ============================================
// INIT DASHBOARD
// ============================================
function initDashboard() {
    console.log('✅ Initializing dashboard for user:', window.currentUser.email);
    dashboardLoaded = true;
    
    // Load user name
    var userName = window.currentUser.displayName || window.currentUser.name || 'User';
    var nameEl = document.getElementById('dashboardUserName');
    if (nameEl) {
        nameEl.textContent = userName;
    }

    // Load all data
    loadDashboardData();
    loadRecentDonations();
    loadNotifications();
    loadFavoritePrograms();
    loadDashboardCharts();
}

// ============================================
// LOAD DASHBOARD DATA
// ============================================
async function loadDashboardData() {
    try {
        var totalDonasi = 0;
        var programIds = new Set();
        var allDonations = [];

        // Get user's donations
        if (typeof db !== 'undefined') {
            var donationsSnapshot = await db.collection('donations')
                .where('userId', '==', window.currentUser.uid)
                .where('status', '==', 'completed')
                .get();

            donationsSnapshot.forEach(function(doc) {
                var data = doc.data();
                totalDonasi += data.amount || 0;
                if (data.programId) programIds.add(data.programId);
            });

            var allDonationsSnapshot = await db.collection('donations')
                .where('userId', '==', window.currentUser.uid)
                .get();

            allDonationsSnapshot.forEach(function(doc) {
                allDonations.push({ id: doc.id, ...doc.data() });
            });

            // Get best quiz score
            var bestScore = 0;
            try {
                var quizResults = await db.collection('quizResults')
                    .where('userId', '==', window.currentUser.uid)
                    .orderBy('score', 'desc')
                    .limit(1)
                    .get();

                quizResults.forEach(function(doc) {
                    bestScore = doc.data().score || 0;
                });
            } catch (quizError) {
                console.log('Quiz results not available:', quizError);
            }

            // Update UI
            var totalDonasiEl = document.getElementById('totalDonasiUser');
            var totalProgramEl = document.getElementById('totalProgramUser');
            var totalTransaksiEl = document.getElementById('totalTransaksiUser');
            var quizScoreEl = document.getElementById('quizScoreUser');

            if (totalDonasiEl) totalDonasiEl.textContent = formatCurrency(totalDonasi);
            if (totalProgramEl) totalProgramEl.textContent = programIds.size || '0';
            if (totalTransaksiEl) totalTransaksiEl.textContent = allDonations.length || '0';
            if (quizScoreEl) quizScoreEl.textContent = bestScore || '0';

            console.log('✅ Dashboard data loaded successfully!');
        } else {
            // Fallback: sample data
            var totalDonasiEl = document.getElementById('totalDonasiUser');
            var totalProgramEl = document.getElementById('totalProgramUser');
            var totalTransaksiEl = document.getElementById('totalTransaksiUser');
            var quizScoreEl = document.getElementById('quizScoreUser');

            if (totalDonasiEl) totalDonasiEl.textContent = 'Rp 1.250.000';
            if (totalProgramEl) totalProgramEl.textContent = '3';
            if (totalTransaksiEl) totalTransaksiEl.textContent = '5';
            if (quizScoreEl) quizScoreEl.textContent = '85';
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Gagal memuat data dashboard', 'error');
    }
}

// ============================================
// LOAD RECENT DONATIONS
// ============================================
async function loadRecentDonations() {
    var container = document.getElementById('recentDonations');
    if (!container) return;

    try {
        if (typeof db === 'undefined') {
            // Fallback: sample data
            container.innerHTML = getSampleDonationsHTML();
            return;
        }

        var snapshot = await db.collection('donations')
            .where('userId', '==', window.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada riwayat donasi</p>
                </div>
            `;
            return;
        }

        var html = '';
        var statusColors = {
            pending: '#F9A825',
            completed: '#4CAF50',
            failed: '#F44336'
        };
        var statusLabels = {
            pending: 'Pending',
            completed: 'Selesai',
            failed: 'Gagal'
        };

        snapshot.forEach(function(doc) {
            var donation = { id: doc.id, ...doc.data() };
            var status = donation.status || 'pending';
            var color = statusColors[status] || '#999';
            var label = statusLabels[status] || status;

            html += `
                <div class="recent-item">
                    <div class="info">
                        <div class="name">${donation.programName || 'Program Donasi'}</div>
                        <div class="detail">${formatDate(donation.createdAt)}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="amount">${formatCurrency(donation.amount || 0)}</div>
                        <span class="status-badge" style="background:${color}; color:white; font-size:10px; padding:2px 8px; border-radius:12px;">${label}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading recent donations:', error);
        // Fallback: sample data
        container.innerHTML = getSampleDonationsHTML();
    }
}

// ============================================
// SAMPLE DONATIONS HTML (Fallback)
// ============================================
function getSampleDonationsHTML() {
    var donations = [
        { program: 'Program Zakat Fitrah 2026', amount: 150000, date: '2 Juli 2026', status: 'completed' },
        { program: 'Infak Pembangunan Masjid', amount: 75000, date: '1 Juli 2026', status: 'completed' },
        { program: 'Qurban 2026', amount: 200000, date: '30 Juni 2026', status: 'pending' },
        { program: 'Sedekah Buku untuk Anak', amount: 50000, date: '29 Juni 2026', status: 'completed' }
    ];

    var statusColors = {
        completed: '#4CAF50',
        pending: '#F9A825',
        failed: '#F44336'
    };
    var statusLabels = {
        completed: 'Selesai',
        pending: 'Pending',
        failed: 'Gagal'
    };

    return donations.map(function(d) {
        var color = statusColors[d.status] || '#999';
        var label = statusLabels[d.status] || d.status;
        return `
            <div class="recent-item">
                <div class="info">
                    <div class="name">${d.program}</div>
                    <div class="detail">${d.date}</div>
                </div>
                <div style="text-align:right;">
                    <div class="amount">Rp ${d.amount.toLocaleString('id-ID')}</div>
                    <span class="status-badge" style="background:${color}; color:white; font-size:10px; padding:2px 8px; border-radius:12px;">${label}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// LOAD NOTIFICATIONS
// ============================================
async function loadNotifications() {
    var container = document.getElementById('notifications');
    var badge = document.getElementById('notificationBadge');
    if (!container) return;

    try {
        if (typeof db === 'undefined') {
            // Fallback: sample notifications
            container.innerHTML = getSampleNotificationsHTML();
            if (badge) badge.textContent = '3';
            return;
        }

        var snapshot = await db.collection('notifications')
            .where('userId', '==', window.currentUser.uid)
            .where('read', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>Tidak ada notifikasi</p>
                </div>
            `;
            if (badge) badge.textContent = '0';
            return;
        }

        var html = '';
        snapshot.forEach(function(doc) {
            var notif = { id: doc.id, ...doc.data() };
            html += `
                <div class="recent-item" onclick="markNotificationRead('${notif.id}')" style="cursor:pointer;">
                    <div class="info">
                        <div class="name">${notif.title || 'Notifikasi'}</div>
                        <div class="detail">${truncateText(notif.message || '', 60)}</div>
                    </div>
                    <span style="font-size:11px; color:var(--text-light);">${formatTime(notif.createdAt)}</span>
                </div>
            `;
        });

        container.innerHTML = html;
        if (badge) badge.textContent = snapshot.size;

    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = getSampleNotificationsHTML();
        if (badge) badge.textContent = '3';
    }
}

// ============================================
// SAMPLE NOTIFICATIONS HTML (Fallback)
// ============================================
function getSampleNotificationsHTML() {
    var notifications = [
        { title: 'Donasi Berhasil', message: 'Donasi Anda untuk Program Zakat Fitrah telah diterima.', time: '2 jam lalu' },
        { title: 'Program Baru', message: 'Program Qurban 2026 telah tersedia.', time: '5 jam lalu' },
        { title: 'Sertifikat Tersedia', message: 'Sertifikat donasi Anda telah tersedia.', time: '1 hari lalu' }
    ];

    return notifications.map(function(n) {
        return `
            <div class="recent-item">
                <div class="info">
                    <div class="name">${n.title}</div>
                    <div class="detail">${n.message}</div>
                </div>
                <span style="font-size:11px; color:var(--text-light);">${n.time}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// LOAD FAVORITE PROGRAMS
// ============================================
async function loadFavoritePrograms() {
    var container = document.getElementById('favoritePrograms');
    if (!container) return;

    try {
        if (typeof db === 'undefined') {
            // Fallback: sample favorites
            container.innerHTML = getSampleFavoritesHTML();
            return;
        }

        var donations = await db.collection('donations')
            .where('userId', '==', window.currentUser.uid)
            .where('status', '==', 'completed')
            .get();

        var programCounts = {};
        donations.forEach(function(doc) {
            var data = doc.data();
            if (data.programId) {
                programCounts[data.programId] = (programCounts[data.programId] || 0) + 1;
            }
        });

        var sorted = Object.entries(programCounts)
            .sort(function(a, b) { return b[1] - a[1]; })
            .slice(0, 3);

        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <p>Belum ada program favorit</p>
                </div>
            `;
            return;
        }

        var html = '';
        for (var i = 0; i < sorted.length; i++) {
            var programId = sorted[i][0];
            var count = sorted[i][1];
            
            try {
                var programDoc = await db.collection('programs').doc(programId).get();
                if (programDoc.exists) {
                    var program = programDoc.data();
                    html += `
                        <div class="recent-item">
                            <div class="info">
                                <div class="name">${program.title || 'Program'}</div>
                                <div class="detail">${count}x donasi</div>
                            </div>
                            <span style="font-weight:600; color:var(--gold); font-size:18px;">❤️</span>
                        </div>
                    `;
                }
            } catch (err) {
                console.log('Could not load program:', programId);
            }
        }

        container.innerHTML = html || `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <p>Belum ada program favorit</p>
            </div>
        `;

    } catch (error) {
        console.error('Error loading favorite programs:', error);
        container.innerHTML = getSampleFavoritesHTML();
    }
}

// ============================================
// SAMPLE FAVORITES HTML (Fallback)
// ============================================
function getSampleFavoritesHTML() {
    var favorites = [
        { name: 'Program Zakat Fitrah 2026', count: 3 },
        { name: 'Qurban 2026', count: 2 },
        { name: 'Infak Pembangunan Masjid', count: 1 }
    ];

    return favorites.map(function(f) {
        return `
            <div class="recent-item">
                <div class="info">
                    <div class="name">${f.name}</div>
                    <div class="detail">${f.count}x donasi</div>
                </div>
                <span style="font-weight:600; color:var(--gold); font-size:18px;">❤️</span>
            </div>
        `;
    }).join('');
}

// ============================================
// LOAD DASHBOARD CHARTS
// ============================================
function loadDashboardCharts() {
    // Donation Chart (Bar)
    var ctx1 = document.getElementById('donationChart');
    if (ctx1 && typeof Chart !== 'undefined') {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                datasets: [{
                    label: 'Donasi Anda',
                    data: [5, 8, 3, 12, 7, 15, 10, 20, 14, 18, 25, 30],
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
}

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
async function markNotificationRead(notifId) {
    try {
        if (typeof db !== 'undefined') {
            await db.collection('notifications').doc(notifId).update({ read: true });
        }
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Make function globally accessible
window.markNotificationRead = markNotificationRead;

console.log('🌙 Filantropi Digital - Dashboard.js Loaded Successfully!');
console.log('🤲 "Barangsiapa memberi, maka ia akan mendapatkan balasan'");