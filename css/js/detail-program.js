// ============================================
// DETAIL PROGRAM LOGIC
// ============================================

let currentProgram = null;
let currentProgramId = null;

document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => loader.classList.add('hidden'), 800);
    }
    
    // Get program ID from URL
    const params = getUrlParams();
    currentProgramId = params.id;
    
    if (!currentProgramId) {
        showToast('Program tidak ditemukan', 'error');
        setTimeout(() => window.location.href = 'program.html', 2000);
        return;
    }
    
    loadProgramDetail();
    setupDonationForm();
    setupAmountPresets();
    setupShareButtons();
});

async function loadProgramDetail() {
    try {
        const result = await FirestoreService.get('programs', currentProgramId);
        
        if (!result.success) {
            showToast('Program tidak ditemukan', 'error');
            setTimeout(() => window.location.href = 'program.html', 2000);
            return;
        }
        
        currentProgram = result.data;
        renderProgramDetail();
        loadRecentDonors();
        
    } catch (error) {
        console.error('Error loading program:', error);
        showToast('Gagal memuat detail program', 'error');
    }
}

function renderProgramDetail() {
    const program = currentProgram;
    if (!program) return;
    
    const progress = ((program.collected || 0) / (program.target || 1)) * 100;
    
    // Image
    const imageEl = document.getElementById('detailImage');
    if (imageEl) {
        imageEl.innerHTML = `<img src="${program.image || 'assets/program-default.jpg'}" alt="${program.title}">`;
    }
    
    // Category
    document.getElementById('detailCategory').textContent = program.category.toUpperCase();
    document.getElementById('detailTitle').textContent = program.title;
    document.getElementById('detailDate').textContent = formatDate(program.createdAt);
    document.getElementById('detailDonors').textContent = program.donors || 0;
    document.getElementById('detailDescription').innerHTML = `<p>${program.description || 'Deskripsi tidak tersedia'}</p>`;
    
    // Progress
    document.getElementById('detailProgressFill').style.width = Math.min(progress, 100) + '%';
    document.getElementById('detailCollected').textContent = formatCurrency(program.collected || 0);
    document.getElementById('detailTarget').textContent = formatCurrency(program.target);
    document.getElementById('detailPercent').textContent = Math.min(Math.round(progress), 100) + '%';
    
    // If user is logged in, pre-fill form
    if (currentUserData) {
        document.getElementById('donationName').value = currentUserData.name || '';
        document.getElementById('donationEmail').value = currentUserData.email || '';
        document.getElementById('donationPhone').value = currentUserData.phone || '';
    }
}

async function loadRecentDonors() {
    const container = document.getElementById('recentDonors');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('donations')
            .where('programId', '==', currentProgramId)
            .where('status', '==', 'completed')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="text-muted">Belum ada donatur</p>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const donation = doc.data();
            html += `
                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--gray-200);">
                    <span>${donation.donorName || 'Anonim'}</span>
                    <span style="font-weight:600; color:var(--primary);">${formatCurrency(donation.amount || 0)}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading recent donors:', error);
    }
}

function setupDonationForm() {
    const form = document.getElementById('donationForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            showToast('Silakan login terlebih dahulu', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }
        
        const amount = parseInt(document.getElementById('donationAmount').value);
        const name = document.getElementById('donationName').value.trim();
        const email = document.getElementById('donationEmail').value.trim();
        const phone = document.getElementById('donationPhone').value.trim();
        const message = document.getElementById('donationMessage').value.trim();
        
        if (!amount || amount < 10000) {
            showToast('Nominal donasi minimal Rp 10.000', 'error');
            return;
        }
        
        if (!name) {
            showToast('Nama donatur harus diisi', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Email tidak valid', 'error');
            return;
        }
        
        // Process donation
        try {
            const donationData = {
                programId: currentProgramId,
                programName: currentProgram.title,
                programCategory: currentProgram.category,
                userId: currentUser.uid,
                donorName: name,
                donorEmail: email,
                donorPhone: phone,
                amount: amount,
                message: message,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const result = await FirestoreService.create('donations', donationData);
            
            if (result.success) {
                // Update program collected amount
                const newCollected = (currentProgram.collected || 0) + amount;
                await db.collection('programs').doc(currentProgramId).update({
                    collected: newCollected,
                    donors: firebase.firestore.FieldValue.increment(1)
                });
                
                // Update donation status to completed
                await db.collection('donations').doc(result.id).update({
                    status: 'completed'
                });
                
                // Show success modal
                showDonationSuccess(name, amount);
                
                // Reload data
                loadProgramDetail();
                form.reset();
                
                if (currentUserData) {
                    document.getElementById('donationName').value = currentUserData.name || '';
                    document.getElementById('donationEmail').value = currentUserData.email || '';
                    document.getElementById('donationPhone').value = currentUserData.phone || '';
                }
                
            } else {
                showToast('Gagal memproses donasi', 'error');
            }
            
        } catch (error) {
            console.error('Donation error:', error);
            showToast('Gagal memproses donasi', 'error');
        }
    });
}

function setupAmountPresets() {
    const presets = document.querySelectorAll('.amount-preset');
    const input = document.getElementById('donationAmount');
    
    if (!presets.length || !input) return;
    
    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            input.value = amount;
            presets.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    input.addEventListener('input', () => {
        presets.forEach(b => b.classList.remove('active'));
    });
}

function setupShareButtons() {
    const url = window.location.href;
    const title = currentProgram?.title || 'Program Donasi';
    
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.classList.contains('facebook') ? 'facebook' :
                            btn.classList.contains('twitter') ? 'twitter' :
                            btn.classList.contains('whatsapp') ? 'whatsapp' :
                            btn.classList.contains('telegram') ? 'telegram' : null;
            
            if (platform) {
                shareOnPlatform(platform, url, title);
            }
        });
    });
}

function shareOnPlatform(platform, url, title) {
    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    };
    
    const shareUrl = shareUrls[platform];
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyLink() {
    copyToClipboard(window.location.href);
}

function showDonationSuccess(name, amount) {
    const modal = document.getElementById('donationModal');
    if (!modal) return;
    
    document.getElementById('receiptProgram').textContent = currentProgram?.title || '-';
    document.getElementById('receiptAmount').textContent = formatCurrency(amount);
    document.getElementById('receiptName').textContent = name;
    document.getElementById('receiptDate').textContent = formatDateTime(new Date());
    
    modal.classList.add('active');
    
    // Auto close after 8 seconds
    setTimeout(() => {
        closeDonationModal();
    }, 8000);
}

function closeDonationModal() {
    const modal = document.getElementById('donationModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('donationModal');
    if (modal && modal.classList.contains('active')) {
        if (e.target === modal) {
            closeDonationModal();
        }
    }
});

// Export for global use
window.closeDonationModal = closeDonationModal;
window.copyLink = copyLink;