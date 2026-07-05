// ============================================
// DETAIL-PROGRAM.JS - FILANTROPI DIGITAL
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================
var currentProgram = null;
var currentProgramId = null;
var donationTimeout = null;

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

function formatDateTime(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// GET URL PARAMETERS
// ============================================
function getUrlParams() {
    var params = {};
    var query = window.location.search.substring(1);
    var pairs = query.split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair.length === 2) {
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
    }
    return params;
}

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Detail Program page loaded');

    // Init toast styles
    initToastStyles();

    // Get program ID from URL
    var params = getUrlParams();
    currentProgramId = params.id;

    if (!currentProgramId) {
        showToast('Program tidak ditemukan', 'error');
        setTimeout(function() {
            window.location.href = 'program.html';
        }, 2000);
        return;
    }

    // Check authentication
    var userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
        try {
            window.currentUserData = JSON.parse(userData);
            console.log('✅ User data loaded from localStorage');
        } catch (e) {
            console.log('❌ Invalid user data');
        }
    }

    // Check Firebase auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser) {
                window.currentUser = firebaseUser;
                console.log('✅ Firebase user authenticated:', firebaseUser.email);
                
                // Update user data
                var userDataObj = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || 'User',
                    name: firebaseUser.displayName || 'User'
                };
                
                if (!window.currentUserData) {
                    window.currentUserData = userDataObj;
                    localStorage.setItem('userData', JSON.stringify(userDataObj));
                }
            } else {
                console.log('⏳ No user logged in');
            }
        });
    }

    // Load program detail
    loadProgramDetail();

    // Setup donation form
    setupDonationForm();

    // Setup amount presets
    setupAmountPresets();

    // Close modal on outside click
    document.addEventListener('click', function(e) {
        var modal = document.getElementById('donationModal');
        if (modal && modal.classList.contains('active') && e.target === modal) {
            closeDonationModal();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDonationModal();
        }
    });
});

// ============================================
// LOAD PROGRAM DETAIL
// ============================================
async function loadProgramDetail() {
    try {
        console.log('📡 Loading program detail for ID:', currentProgramId);

        if (typeof db === 'undefined') {
            // Fallback: use sample data
            loadSampleProgramDetail();
            return;
        }

        var programDoc = await db.collection('programs').doc(currentProgramId).get();

        if (!programDoc.exists) {
            showToast('Program tidak ditemukan', 'error');
            setTimeout(function() {
                window.location.href = 'program.html';
            }, 2000);
            return;
        }

        currentProgram = { id: programDoc.id, ...programDoc.data() };
        renderProgramDetail();
        loadRecentDonors();

        console.log('✅ Program detail loaded:', currentProgram.title);

    } catch (error) {
        console.error('Error loading program:', error);
        
        if (error.code === 'permission-denied') {
            showToast('Izin ditolak. Silakan login ulang.', 'error');
        } else {
            // Fallback: use sample data
            loadSampleProgramDetail();
        }
    }
}

// ============================================
// LOAD SAMPLE PROGRAM DETAIL (Fallback)
// ============================================
function loadSampleProgramDetail() {
    var samplePrograms = {
        '1': {
            title: 'Program Zakat Fitrah 2026',
            category: 'zakat',
            description: 'Salurkan zakat fitrah Anda untuk membantu saudara-saudara kita yang membutuhkan. Program ini bertujuan untuk memberikan kebahagiaan di hari raya bagi mereka yang kurang mampu.',
            image: 'assets/program-default.jpg',
            collected: 7500000,
            target: 10000000,
            donors: 120,
            createdAt: new Date('2026-07-01')
        },
        '2': {
            title: 'Infak Pembangunan Masjid',
            category: 'infak',
            description: 'Infak untuk pembangunan dan renovasi masjid di daerah terpencil. Masjid adalah rumah Allah yang menjadi pusat kegiatan ibadah dan dakwah.',
            image: 'assets/program-default.jpg',
            collected: 4500000,
            target: 8000000,
            donors: 85,
            createdAt: new Date('2026-06-28')
        },
        '3': {
            title: 'Sedekah Buku untuk Anak',
            category: 'sedekah',
            description: 'Sedekah buku dan alat tulis untuk anak-anak di daerah terpencil. Pendidikan adalah kunci masa depan yang lebih baik.',
            image: 'assets/program-default.jpg',
            collected: 2300000,
            target: 5000000,
            donors: 45,
            createdAt: new Date('2026-06-25')
        },
        '4': {
            title: 'Qurban 2026',
            category: 'qurban',
            description: 'Salurkan qurban Anda untuk dinikmati oleh saudara-saudara kita yang membutuhkan. Ibadah qurban adalah bentuk ketaatan kepada Allah.',
            image: 'assets/program-default.jpg',
            collected: 12000000,
            target: 20000000,
            donors: 200,
            createdAt: new Date('2026-06-20')
        }
    };

    var sample = samplePrograms[currentProgramId];
    if (!sample) {
        showToast('Program tidak ditemukan', 'error');
        setTimeout(function() {
            window.location.href = 'program.html';
        }, 2000);
        return;
    }

    currentProgram = { id: currentProgramId, ...sample };
    renderProgramDetail();
    loadSampleRecentDonors();
    console.log('📦 Sample program loaded:', currentProgram.title);
}

// ============================================
// RENDER PROGRAM DETAIL
// ============================================
function renderProgramDetail() {
    var program = currentProgram;
    if (!program) return;

    var progress = ((program.collected || 0) / (program.target || 1)) * 100;
    var categoryLabels = {
        zakat: 'Zakat',
        infak: 'Infak',
        sedekah: 'Sedekah',
        qurban: 'Qurban'
    };
    var categoryLabel = categoryLabels[program.category] || program.category || 'Umum';

    // Image
    var imageEl = document.getElementById('detailImage');
    if (imageEl) {
        var imageSrc = program.image || 'assets/program-default.jpg';
        imageEl.innerHTML = `<img src="${imageSrc}" alt="${program.title}" loading="lazy">`;
    }

    // Category
    var categoryEl = document.getElementById('detailCategory');
    if (categoryEl) categoryEl.textContent = categoryLabel;

    // Title
    var titleEl = document.getElementById('detailTitle');
    if (titleEl) titleEl.textContent = program.title || 'Program Donasi';

    // Date
    var dateEl = document.getElementById('detailDate');
    if (dateEl) dateEl.textContent = formatDate(program.createdAt);

    // Donors
    var donorsEl = document.getElementById('detailDonors');
    if (donorsEl) donorsEl.textContent = program.donors || 0;

    // Description
    var descEl = document.getElementById('detailDescription');
    if (descEl) {
        descEl.innerHTML = `<p>${program.description || 'Deskripsi tidak tersedia'}</p>`;
    }

    // Progress bar
    var progressFill = document.getElementById('detailProgressFill');
    if (progressFill) {
        progressFill.style.width = Math.min(progress, 100) + '%';
    }

    // Collected
    var collectedEl = document.getElementById('detailCollected');
    if (collectedEl) collectedEl.textContent = formatCurrency(program.collected || 0);

    // Target
    var targetEl = document.getElementById('detailTarget');
    if (targetEl) targetEl.textContent = formatCurrency(program.target || 0);

    // Percent
    var percentEl = document.getElementById('detailPercent');
    if (percentEl) percentEl.textContent = Math.min(Math.round(progress), 100) + '%';

    // Fill user data in form
    if (window.currentUserData) {
        var nameInput = document.getElementById('donationName');
        var emailInput = document.getElementById('donationEmail');
        var phoneInput = document.getElementById('donationPhone');

        if (nameInput) nameInput.value = window.currentUserData.name || window.currentUserData.displayName || '';
        if (emailInput) emailInput.value = window.currentUserData.email || '';
        if (phoneInput) phoneInput.value = window.currentUserData.phone || '';
    }

    console.log('✅ Program rendered successfully');
}

// ============================================
// LOAD RECENT DONORS
// ============================================
async function loadRecentDonors() {
    var container = document.getElementById('recentDonors');
    if (!container) return;

    try {
        if (typeof db === 'undefined') {
            loadSampleRecentDonors();
            return;
        }

        var snapshot = await db.collection('donations')
            .where('programId', '==', currentProgramId)
            .where('status', '==', 'completed')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            container.innerHTML = '<p class="text-muted">Belum ada donatur</p>';
            return;
        }

        var html = '';
        snapshot.forEach(function(doc) {
            var donation = doc.data();
            var name = donation.donorName || 'Anonim';
            var amount = donation.amount || 0;
            html += `
                <div class="donor-item">
                    <div class="donor-avatar">${name.charAt(0).toUpperCase()}</div>
                    <div class="donor-info">
                        <div class="donor-name">${name}</div>
                        <div class="donor-detail">${formatTime(donation.createdAt)}</div>
                    </div>
                    <div class="donor-amount">${formatCurrency(amount)}</div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading recent donors:', error);
        loadSampleRecentDonors();
    }
}

// ============================================
// LOAD SAMPLE RECENT DONORS (Fallback)
// ============================================
function loadSampleRecentDonors() {
    var container = document.getElementById('recentDonors');
    if (!container) return;

    var donors = [
        { name: 'Ahmad Fauzi', amount: 150000, time: '2 jam lalu' },
        { name: 'Siti Rahmah', amount: 75000, time: '4 jam lalu' },
        { name: 'Muhammad Rizki', amount: 200000, time: '6 jam lalu' },
        { name: 'Dewi Anggraini', amount: 100000, time: '8 jam lalu' },
        { name: 'Fajar Ramadhan', amount: 50000, time: '10 jam lalu' }
    ];

    container.innerHTML = donors.map(function(d) {
        var initial = d.name.charAt(0);
        return `
            <div class="donor-item">
                <div class="donor-avatar">${initial}</div>
                <div class="donor-info">
                    <div class="donor-name">${d.name}</div>
                    <div class="donor-detail">${d.time}</div>
                </div>
                <div class="donor-amount">${formatCurrency(d.amount)}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// FORMAT TIME
// ============================================
function formatTime(timestamp) {
    if (!timestamp) return '-';
    var date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ============================================
// SETUP DONATION FORM
// ============================================
function setupDonationForm() {
    var form = document.getElementById('donationForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check login
        if (!window.currentUser) {
            showToast('Silakan login terlebih dahulu', 'warning');
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        var amount = parseInt(document.getElementById('donationAmount').value);
        var name = document.getElementById('donationName').value.trim();
        var email = document.getElementById('donationEmail').value.trim();
        var phone = document.getElementById('donationPhone').value.trim();
        var message = document.getElementById('donationMessage').value.trim();

        // Validasi
        if (!amount || amount < 10000) {
            showToast('Nominal donasi minimal Rp 10.000', 'error');
            document.getElementById('donationAmount').focus();
            return;
        }

        if (!name || name.length < 2) {
            showToast('Nama donatur minimal 2 karakter', 'error');
            document.getElementById('donationName').focus();
            return;
        }

        if (!email || !validateEmail(email)) {
            showToast('Email tidak valid', 'error');
            document.getElementById('donationEmail').focus();
            return;
        }

        // Disable submit button
        var submitBtn = form.querySelector('button[type="submit"]');
        var originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

        try {
            if (typeof db === 'undefined' || typeof firebase === 'undefined') {
                // Fallback: simulasi donasi
                setTimeout(function() {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    showDonationSuccess(name, amount);
                    form.reset();
                    // Reset user data in form
                    if (window.currentUserData) {
                        document.getElementById('donationName').value = window.currentUserData.name || '';
                        document.getElementById('donationEmail').value = window.currentUserData.email || '';
                        document.getElementById('donationPhone').value = window.currentUserData.phone || '';
                    }
                    loadProgramDetail();
                }, 1500);
                return;
            }

            // Create donation
            var donationData = {
                programId: currentProgramId,
                programName: currentProgram.title,
                programCategory: currentProgram.category,
                userId: window.currentUser.uid,
                donorName: name,
                donorEmail: email,
                donorPhone: phone || '',
                amount: amount,
                message: message || '',
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            var docRef = await db.collection('donations').add(donationData);

            // Update program stats
            var newCollected = (currentProgram.collected || 0) + amount;
            await db.collection('programs').doc(currentProgramId).update({
                collected: newCollected,
                donors: firebase.firestore.FieldValue.increment(1)
            });

            // Update donation status to completed
            await db.collection('donations').doc(docRef.id).update({
                status: 'completed'
            });

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            showDonationSuccess(name, amount);
            form.reset();

            // Reset user data in form
            if (window.currentUserData) {
                document.getElementById('donationName').value = window.currentUserData.name || '';
                document.getElementById('donationEmail').value = window.currentUserData.email || '';
                document.getElementById('donationPhone').value = window.currentUserData.phone || '';
            }

            // Reload program detail
            loadProgramDetail();

        } catch (error) {
            console.error('Donation error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            showToast('Gagal memproses donasi: ' + error.message, 'error');
        }
    });
}

// ============================================
// SETUP AMOUNT PRESETS
// ============================================
function setupAmountPresets() {
    var presets = document.querySelectorAll('.amount-preset');
    var input = document.getElementById('donationAmount');

    if (!presets.length || !input) return;

    presets.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var amount = parseInt(this.dataset.amount);
            input.value = amount;
            presets.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            
            // Trigger input event
            var event = new Event('input');
            input.dispatchEvent(event);
        });
    });

    input.addEventListener('input', function() {
        presets.forEach(function(b) { b.classList.remove('active'); });
    });
}

// ============================================
// SHOW DONATION SUCCESS
// ============================================
function showDonationSuccess(name, amount) {
    var modal = document.getElementById('donationModal');
    if (!modal) return;

    // Set receipt data
    var programEl = document.getElementById('receiptProgram');
    var amountEl = document.getElementById('receiptAmount');
    var nameEl = document.getElementById('receiptName');
    var dateEl = document.getElementById('receiptDate');

    if (programEl) programEl.textContent = currentProgram?.title || '-';
    if (amountEl) amountEl.textContent = formatCurrency(amount);
    if (nameEl) nameEl.textContent = name;
    if (dateEl) dateEl.textContent = formatDateTime(new Date());

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Auto close after 8 seconds
    clearTimeout(donationTimeout);
    donationTimeout = setTimeout(function() {
        closeDonationModal();
    }, 8000);
}

// ============================================
// CLOSE DONATION MODAL
// ============================================
function closeDonationModal() {
    var modal = document.getElementById('donationModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    clearTimeout(donationTimeout);
}

// ============================================
// COPY LINK
// ============================================
function copyLink() {
    var url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function() {
            showToast('Link program berhasil disalin! 📋', 'success');
        }).catch(function() {
            fallbackCopy(url);
        });
    } else {
        fallbackCopy(url);
    }
}

function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Link program berhasil disalin! 📋', 'success');
    } catch (err) {
        showToast('Gagal menyalin link', 'error');
    }
    document.body.removeChild(textarea);
}

// Make functions globally accessible
window.closeDonationModal = closeDonationModal;
window.copyLink = copyLink;

console.log('🌙 Filantropi Digital - Detail Program Loaded Successfully!');
console.log('🤲 "Barangsiapa memberi, maka ia akan mendapatkan balasan"');