// ============================================
// PROGRAM.JS - VERSI FINAL
// ============================================

let currentPage = 1;
const pageSize = 9;
let allPrograms = [];
let filteredPrograms = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Program page loaded');
    loadAllPrograms();
    setupProgramFilters();
    setupProgramSearch();
});

async function loadAllPrograms() {
    const grid = document.getElementById('programGrid');
    if (!grid) return;
    
    try {
        const snapshot = await db.collection('programs')
            .where('status', '==', 'active')
            .get();
        
        allPrograms = [];
        snapshot.forEach(doc => {
            allPrograms.push({ id: doc.id, ...doc.data() });
        });
        
        filteredPrograms = [...allPrograms];
        renderPrograms();
        console.log('✅ Programs loaded:', allPrograms.length);
        
    } catch (error) {
        console.error('Error loading programs:', error);
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1; padding:60px 20px; text-align:center;">
                <i class="fas fa-exclamation-circle" style="font-size:48px; color:#F44336;"></i>
                <p style="margin-top:12px; color:var(--gray-500);">Gagal memuat program. Silakan refresh halaman.</p>
            </div>
        `;
        showToast('Gagal memuat program', 'error');
    }
}

function renderPrograms() {
    const grid = document.getElementById('programGrid');
    if (!grid) return;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filteredPrograms.slice(start, end);
    
    if (pageItems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1; padding:60px 20px; text-align:center;">
                <i class="fas fa-inbox" style="font-size:48px; color:var(--gray-400);"></i>
                <p style="margin-top:12px; color:var(--gray-500);">Tidak ada program yang ditemukan</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    pageItems.forEach(program => {
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
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(filteredPrograms.length / pageSize);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    html += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredPrograms.length / pageSize);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPrograms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupProgramFilters() {
    const btns = document.querySelectorAll('.category-btn');
    if (!btns.length) return;
    
    btns.forEach(btn => {
        btn.addEventListener('click', function() {
            btns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            if (category === 'all') {
                filteredPrograms = [...allPrograms];
            } else {
                filteredPrograms = allPrograms.filter(p => p.category === category);
            }
            
            currentPage = 1;
            renderPrograms();
        });
    });
}

function setupProgramSearch() {
    const searchInput = document.getElementById('programSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            filteredPrograms = [...allPrograms];
        } else {
            filteredPrograms = allPrograms.filter(function(p) {
                return p.title.toLowerCase().includes(query) ||
                       (p.description && p.description.toLowerCase().includes(query)) ||
                       p.category.toLowerCase().includes(query);
            });
        }
        
        currentPage = 1;
        renderPrograms();
    });
}

window.changePage = changePage;

console.log('✅ Program.js loaded successfully!');