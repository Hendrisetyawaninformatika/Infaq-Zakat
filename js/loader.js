// ============================================
// LOADER - HIDE SMOOTHLY (TANPA KEDIP)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    var loader = document.getElementById('loader');
    var progressBar = document.getElementById('loaderProgress');
    var mainContent = document.querySelector('.main-content');
    
    // Jika tidak ada .main-content, cari container utama
    if (!mainContent) {
        mainContent = document.querySelector('.auth-container') || 
                      document.querySelector('.container') || 
                      document.querySelector('.hero') ||
                      document.querySelector('.dashboard-section') ||
                      document.querySelector('.chat-wrapper') ||
                      document.querySelector('.programs-page') ||
                      document.querySelector('.quiz-section') ||
                      document.querySelector('.page-header');
    }
    
    if (loader && progressBar) {
        var progress = 0;
        var interval = setInterval(function() {
            progress += Math.random() * 10 + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // 🔥 TUNGGU 500ms, LALU HIDE LOADER
                setTimeout(function() {
                    loader.classList.add('hidden');
                    
                    // 🔥 TAMPILKAN KONTEN
                    if (mainContent) {
                        mainContent.classList.add('loaded');
                    }
                    
                    document.body.style.overflow = 'auto';
                }, 500);
            }
            progressBar.style.width = Math.min(progress, 100) + '%';
        }, 150);
    } else {
        // 🔥 FALLBACK: hide loader after 2 seconds
        setTimeout(function() {
            if (loader) {
                loader.classList.add('hidden');
                if (mainContent) {
                    mainContent.classList.add('loaded');
                }
                document.body.style.overflow = 'auto';
            }
        }, 2000);
    }
});

console.log('✅ Loader.js loaded successfully!');