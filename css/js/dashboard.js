// ============================================
// DASHBOARD LOGIC
// ============================================

let donationChart = null;

document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => loader.classList.add('hidden'), 800);
    }
    
    // Check if user is logged in
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
    loadRecentDonations();
    loadNotifications();
    loadFavoritePrograms();
    loadDonationChart();
});

async function loadDashboardData() {
    try {
        // Update user info
        const nameEl = document.getElementById('dashboardUserName');
        if (nameEl && currentUserData) {
            nameEl.textContent = currentUserData.name || 'User';
        }
        
        // Get user donations
        const donationsSnapshot = await db.collection('donations')
            .where('userId', '==', currentUser.uid)
            .where('status', '==', 'completed')
            .get();
        
        let totalDonasi = 0;
        let programIds = new Set();
        donationsSnapshot.forEach(doc => {
            const data = doc.data();
            totalDonasi += data.amount || 0;
            if (data.programId) programIds.add(data.programId);
        });
        
        // Get total transactions
        const allDonations = await db.collection('donations')
            .where('userId', '==', currentUser.uid)
            .get();
        
        // Get quiz scores
        const quizResults = await db.collection('quizResults')
            .where('userId', '==', currentUser.uid)
            .orderBy('score', 'desc')
            .limit(1)
            .get();
        
        let bestScore = 0;
        quizResults.forEach(doc => {
            bestScore = doc.data().score || 0;
        });
        
        // Update stats
        document.getElementById('totalDonasiUser').textContent = formatCurrency(totalDonasi);
        document.getElementById('totalProgramUser').textContent = programIds.size;
        document.getElementById('totalTransaksiUser').textContent = allDonations.size;
        document.getElementById('quizScoreUser').textContent = bestScore;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Gagal memuat data dashboard', 'error');
    }
}

async function loadRecentDonations() {
    const container = document.getElementById('recentDonations');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('donations')
            .where('userId', '==', currentUser.uid)
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
        
        let html = '';
        snapshot.forEach(doc => {
            const donation = { id: doc.id, ...doc.data() };
            const statusColors = {
                pending: '#F9A825',
                completed: '#4CAF50',
                failed: '#F44336'
            };
            
            html += `
                <div class="recent-item">
                    <div class="info">
                        <div class="name">${donation.programName || 'Program Donasi'}</div>
                        <div class="detail">${formatDate(donation.createdAt)}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="amount">${formatCurrency(donation.amount || 0)}</div>
                        <span class="status-badge" style="background:${statusColors[donation.status] || '#999'}; color:white; font-size:10px; padding:2px 8px; border-radius:12px;">
                            ${donation.status || 'Pending'}
                        </span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading recent donations:', error);
    }
}

async function loadNotifications() {
    const container = document.getElementById('notifications');
    const badge = document.getElementById('notificationBadge');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
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
        
        let html = '';
        snapshot.forEach(doc => {
            const notif = { id: doc.id, ...doc.data() };
            html += `
                <div class="recent-item" onclick="markNotificationRead('${notif.id}')">
                    <div class="info">
                        <div class="name">${notif.title || 'Notifikasi'}</div>
                        <div class="detail">${truncateText(notif.message || '', 60)}</div>
                    </div>
                    <span style="font-size:11px; color:var(--gray-500);">${formatTime(notif.createdAt)}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
        if (badge) badge.textContent = snapshot.size;
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function loadFavoritePrograms() {
    const container = document.getElementById('favoritePrograms');
    if (!container) return;
    
    try {
        // Get programs user has donated to
        const donations = await db.collection('donations')
            .where('userId', '==', currentUser.uid)
            .where('status', '==', 'completed')
            .get();
        
        const programCounts = {};
        donations.forEach(doc => {
            const data = doc.data();
            if (data.programId) {
                programCounts[data.programId] = (programCounts[data.programId] || 0) + 1;
            }
        });
        
        // Sort by count and get top 3
        const sorted = Object.entries(programCounts)
            .sort((a, b) => b[1] - a[1])
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
        
        let html = '';
        for (const [programId, count] of sorted) {
            const result = await FirestoreService.get('programs', programId);
            if (result.success) {
                const program = result.data;
                html += `
                    <div class="recent-item">
                        <img src="${program.image || 'assets/program-default.jpg'}" alt="${program.title}">
                        <div class="info">
                            <div class="name">${program.title}</div>
                            <div class="detail">${count}x donasi</div>
                        </div>
                        <span style="font-weight:600; color:var(--gold);">❤️</span>
                    </div>
                `;
            }
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading favorite programs:', error);
    }
}

async function loadDonationChart() {
    const canvas = document.getElementById('donationChart');
    if (!canvas) return;
    
    try {
        // Get last 6 months donations
        const months = [];
        const amounts = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleString('id-ID', { month: 'short' });
            months.push(monthName);
            
            // Get donations for this month
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            
            const snapshot = await db.collection('donations')
                .where('userId', '==', currentUser.uid)
                .where('status', '==', 'completed')
                .where('createdAt', '>=', start)
                .where('createdAt', '<', end)
                .get();
            
            let total = 0;
            snapshot.forEach(doc => {
                total += doc.data().amount || 0;
            });
            amounts.push(total);
        }
        
        // Create chart
        const ctx = canvas.getContext('2d');
        if (donationChart) donationChart.destroy();
        
        donationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Donasi (Rp)',
                    data: amounts,
                    backgroundColor: 'rgba(46, 125, 50, 0.7)',
                    borderColor: '#2E7D32',
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading donation chart:', error);
    }
}

async function markNotificationRead(notifId) {
    try {
        await db.collection('notifications').doc(notifId).update({
            read: true
        });
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Export for global use
window.markNotificationRead = markNotificationRead;