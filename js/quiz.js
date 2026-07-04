// ============================================
// QUIZ.JS - VERSI FINAL (TANPA orderBy)
// ============================================

let allQuizzes = [];
let currentQuiz = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timer = null;
let timeLeft = 0;
let quizStartTime = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 Quiz page loaded');
    loadQuizzes();
    setupQuizCategories();
});

// ============================================
// LOAD QUIZZES - TANPA orderBy
// ============================================
async function loadQuizzes() {
    try {
        const snapshot = await db.collection('quiz')
            .where('status', '==', 'active')
            .get();
        
        allQuizzes = [];
        snapshot.forEach(doc => {
            allQuizzes.push({ id: doc.id, ...doc.data() });
        });
        
        renderQuizList();
        loadLeaderboard();
        console.log('✅ Quizzes loaded:', allQuizzes.length);
        
    } catch (error) {
        console.error('Error loading quizzes:', error);
        const container = document.getElementById('quizList');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle" style="font-size:48px; color:#F44336;"></i>
                    <p>Gagal memuat quiz. Silakan refresh halaman.</p>
                </div>
            `;
        }
        showToast('Gagal memuat quiz', 'error');
    }
}

// ============================================
// RENDER QUIZ LIST
// ============================================
function renderQuizList() {
    const container = document.getElementById('quizList');
    if (!container) return;
    
    if (allQuizzes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-mosque"></i>
                <p>Belum ada quiz yang tersedia</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="quiz-grid">';
    allQuizzes.forEach(quiz => {
        html += `
            <div class="quiz-card" onclick="startQuiz('${quiz.id}')">
                <div class="quiz-card-icon" style="background:rgba(46,125,50,0.1); color:#2E7D32;">
                    <i class="fas fa-mosque"></i>
                </div>
                <h3>${quiz.title}</h3>
                <p>${quiz.description || 'Quiz tentang ' + quiz.category}</p>
                <div class="quiz-card-meta">
                    <span><i class="fas fa-tag"></i> ${quiz.category.toUpperCase()}</span>
                    <span><i class="fas fa-clock"></i> ${quiz.duration || 15} menit</span>
                </div>
                <button class="btn btn-primary btn-sm">Mulai Quiz</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// ============================================
// SETUP QUIZ CATEGORIES
// ============================================
function setupQuizCategories() {
    const btns = document.querySelectorAll('.quiz-cat-btn');
    if (!btns.length) return;
    
    btns.forEach(btn => {
        btn.addEventListener('click', function() {
            btns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            const cards = document.querySelectorAll('.quiz-card');
            
            cards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardCategory = card.querySelector('.quiz-card-meta span:first-child')?.textContent.toLowerCase();
                    card.style.display = cardCategory?.includes(category) ? 'block' : 'none';
                }
            });
        });
    });
}

// ============================================
// START QUIZ
// ============================================
async function startQuiz(quizId) {
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    const existing = await db.collection('quizResults')
        .where('userId', '==', currentUser.uid)
        .where('quizId', '==', quizId)
        .get();
    
    if (!existing.empty) {
        const result = existing.docs[0].data();
        if (result.score >= 70) {
            showToast('Anda sudah lulus quiz ini dengan nilai ' + result.score + '%', 'info');
            return;
        }
    }
    
    const quiz = allQuizzes.find(q => q.id === quizId);
    if (!quiz) {
        showToast('Quiz tidak ditemukan', 'error');
        return;
    }
    
    const questionsSnapshot = await db.collection('quizQuestions')
        .where('quizId', '==', quizId)
        .get();
    
    const questions = [];
    questionsSnapshot.forEach(doc => {
        questions.push({ id: doc.id, ...doc.data() });
    });
    
    if (questions.length < 5) {
        showToast('Quiz ini belum memiliki cukup soal', 'error');
        return;
    }
    
    const shuffled = shuffleArray(questions);
    const selected = shuffled.slice(0, 20);
    
    currentQuiz = quiz;
    currentQuestions = selected;
    currentQuestionIndex = 0;
    userAnswers = selected.map(() => null);
    quizStartTime = Date.now();
    
    timeLeft = (quiz.duration || 15) * 60;
    startTimer();
    
    document.getElementById('quizList').style.display = 'none';
    document.getElementById('quizCategories').style.display = 'none';
    document.getElementById('quizTaking').style.display = 'block';
    document.getElementById('quizResults').style.display = 'none';
    
    document.getElementById('quizTitle').textContent = quiz.title;
    document.getElementById('quizCategory').textContent = quiz.category.toUpperCase();
    
    renderQuestion();
}

// ============================================
// RENDER QUESTION
// ============================================
function renderQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) return;
    
    document.getElementById('questionText').textContent = question.text;
    document.getElementById('quizProgress').textContent = `${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    const optionsContainer = document.getElementById('quizOptions');
    const letters = ['A', 'B', 'C', 'D'];
    const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'];
    
    let html = '';
    optionKeys.forEach((key, index) => {
        const optionText = question[key];
        if (optionText) {
            const isSelected = userAnswers[currentQuestionIndex] === index;
            html += `
                <div class="option ${isSelected ? 'selected' : ''}" 
                     onclick="selectOption(${index})">
                    <span class="option-letter">${letters[index]}</span>
                    <span class="option-text">${optionText}</span>
                    ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                </div>
            `;
        }
    });
    
    optionsContainer.innerHTML = html;
    
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').style.display = currentQuestionIndex < currentQuestions.length - 1 ? 'inline-flex' : 'none';
    document.getElementById('submitBtn').style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'inline-flex' : 'none';
}

// ============================================
// SELECT OPTION
// ============================================
function selectOption(index) {
    userAnswers[currentQuestionIndex] = index;
    renderQuestion();
}

// ============================================
// NEXT / PREV
// ============================================
function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
}

// ============================================
// SUBMIT QUIZ
// ============================================
async function submitQuiz() {
    const unanswered = userAnswers.some(a => a === null);
    if (unanswered) {
        const confirmSubmit = confirm('Masih ada soal yang belum dijawab. Apakah Anda yakin ingin menyelesaikan quiz?');
        if (!confirmSubmit) return;
    }
    
    clearInterval(timer);
    
    let correct = 0;
    const results = [];
    currentQuestions.forEach((question, index) => {
        const answer = userAnswers[index];
        const isCorrect = answer !== null && answer === question.correctAnswer;
        if (isCorrect) correct++;
        results.push({
            question: question.text,
            userAnswer: answer !== null ? ['A', 'B', 'C', 'D'][answer] : '-',
            correctAnswer: ['A', 'B', 'C', 'D'][question.correctAnswer],
            isCorrect: isCorrect,
            explanation: question.explanation || ''
        });
    });
    
    const score = Math.round((correct / currentQuestions.length) * 100);
    const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
    
    try {
        await db.collection('quizResults').add({
            userId: currentUser.uid,
            userName: currentUserData?.name || 'User',
            quizId: currentQuiz.id,
            quizTitle: currentQuiz.title,
            quizCategory: currentQuiz.category,
            score: score,
            correct: correct,
            total: currentQuestions.length,
            timeTaken: timeTaken,
            answers: results,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showResults(score, correct, timeTaken, results);
        
    } catch (error) {
        console.error('Error saving quiz result:', error);
        showToast('Gagal menyimpan hasil quiz', 'error');
    }
}

// ============================================
// SHOW RESULTS
// ============================================
function showResults(score, correct, timeTaken, results) {
    document.getElementById('quizTaking').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';
    
    const passed = score >= 70;
    document.getElementById('resultIcon').innerHTML = `<i class="fas ${passed ? 'fa-trophy' : 'fa-frown'}"></i>`;
    document.getElementById('resultTitle').textContent = passed ? 'Selamat! Anda Lulus!' : 'Belum Berhasil';
    document.getElementById('resultScore').textContent = score;
    document.getElementById('resultPercentage').textContent = score + '%';
    document.getElementById('resultMessage').textContent = passed 
        ? 'Selamat! Anda berhasil menyelesaikan quiz dengan nilai yang memuaskan.' 
        : 'Terus belajar dan jangan menyerah! Coba lagi ya.';
    
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = currentQuestions.length - correct;
    document.getElementById('resultTime').textContent = formatTimeTaken(timeTaken);
    
    window.quizResults = results;
    window.quizScore = score;
    window.quizPassed = passed;
    
    loadLeaderboard();
}

// ============================================
// TIMER
// ============================================
function startTimer() {
    const timerDisplay = document.getElementById('quizTimer');
    timer = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (timeLeft <= 60) {
            timerDisplay.style.color = '#F44336';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showToast('Waktu habis! Quiz akan disubmit otomatis.', 'warning');
            submitQuiz();
        }
    }, 1000);
}

function formatTimeTaken(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============================================
// REVIEW ANSWERS
// ============================================
function reviewAnswers() {
    const container = document.getElementById('reviewSection');
    const list = document.getElementById('reviewList');
    
    if (!container || !list) return;
    
    if (container.style.display === 'block') {
        container.style.display = 'none';
        return;
    }
    
    const results = window.quizResults || [];
    let html = '';
    results.forEach((result, index) => {
        html += `
            <div class="review-item ${result.isCorrect ? 'correct' : 'wrong'}">
                <div class="review-question">
                    <span class="review-number">${index + 1}.</span>
                    <span>${result.question}</span>
                </div>
                <div class="review-answers">
                    <span>Jawaban Anda: <strong>${result.userAnswer}</strong></span>
                    <span>Jawaban Benar: <strong>${result.correctAnswer}</strong></span>
                </div>
                ${result.explanation ? `<div class="review-explanation">${result.explanation}</div>` : ''}
            </div>
        `;
    });
    
    list.innerHTML = html;
    container.style.display = 'block';
}

// ============================================
// RETAKE QUIZ
// ============================================
function retakeQuiz() {
    if (window.quizScore >= 70) {
        const confirmRetake = confirm('Anda sudah lulus quiz ini. Apakah Anda yakin ingin mengulang?');
        if (!confirmRetake) return;
    }
    
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('reviewSection').style.display = 'none';
    document.getElementById('quizList').style.display = 'block';
    document.getElementById('quizCategories').style.display = 'flex';
    
    currentQuiz = null;
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    clearInterval(timer);
}

// ============================================
// GENERATE CERTIFICATE
// ============================================
async function generateCertificate() {
    if (!window.quizPassed) {
        showToast('Anda harus lulus quiz untuk mendapatkan sertifikat', 'warning');
        return;
    }
    
    try {
        showToast('Membuat sertifikat...', 'info');
        
        const certData = {
            name: currentUserData?.name || 'User',
            quizTitle: currentQuiz?.title || 'Quiz Islami',
            score: window.quizScore || 0,
            date: formatDate(new Date()),
            certificateId: 'CERT-' + generateId(8).toUpperCase()
        };
        
        showCertificateModal(certData);
        
    } catch (error) {
        console.error('Error generating certificate:', error);
        showToast('Gagal membuat sertifikat', 'error');
    }
}

function showCertificateModal(data) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal active';
    modal.id = 'certificateModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3><i class="fas fa-certificate" style="color:var(--gold);"></i> Sertifikat Quiz</h3>
                <button class="modal-close" onclick="document.getElementById('certificateModal').remove()">&times;</button>
            </div>
            <div class="modal-body" style="text-align:center;">
                <div style="border:3px solid var(--gold); border-radius:12px; padding:30px; background:linear-gradient(135deg, #fff8e1, #fff3e0);">
                    <i class="fas fa-award" style="font-size:60px; color:var(--gold);"></i>
                    <h2 style="margin:12px 0 4px;">Sertifikat Kelulusan</h2>
                    <p style="color:var(--gray-500);">Diberikan kepada:</p>
                    <h3 style="font-size:24px; color:var(--primary);">${data.name}</h3>
                    <p>Atas keberhasilan menyelesaikan quiz</p>
                    <h4 style="color:var(--gold);">"${data.quizTitle}"</h4>
                    <div style="display:flex; justify-content:center; gap:40px; margin:16px 0;">
                        <div><strong>Nilai</strong><br><span style="font-size:28px; color:var(--primary);">${data.score}%</span></div>
                        <div><strong>Tanggal</strong><br><span>${data.date}</span></div>
                    </div>
                    <div style="border-top:1px dashed var(--gray-300); padding-top:12px; font-size:12px; color:var(--gray-500);">
                        ID: ${data.certificateId}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="printCertificate()" style="margin-top:16px;">
                    <i class="fas fa-print"></i> Cetak Sertifikat
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function printCertificate() {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;
    
    const content = modal.querySelector('.modal-body > div');
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
        <html><head><title>Sertifikat</title>
        <style>
            body { font-family: 'Poppins', sans-serif; display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; background:#f5f5f5; }
            .certificate { border:3px solid #FFD700; border-radius:12px; padding:40px; background:linear-gradient(135deg, #fff8e1, #fff3e0); max-width:500px; text-align:center; }
            .certificate i { font-size:60px; color:#FFD700; }
            .certificate h2 { margin:12px 0 4px; }
            .certificate .name { font-size:24px; color:#2E7D32; }
            .certificate .title { color:#F9A825; }
            .certificate .score { font-size:28px; color:#2E7D32; }
            .certificate .id { border-top:1px dashed #ccc; padding-top:12px; font-size:12px; color:#999; }
        </style>
        </head><body>
        <div class="certificate">
            <i class="fas fa-award"></i>
            <h2>Sertifikat Kelulusan</h2>
            <p style="color:#999;">Diberikan kepada:</p>
            <div class="name">${content.querySelector('h3').textContent}</div>
            <p>Atas keberhasilan menyelesaikan quiz</p>
            <h4 class="title">"${content.querySelector('h4').textContent}"</h4>
            <div style="display:flex; justify-content:center; gap:40px; margin:16px 0;">
                <div><strong>Nilai</strong><br><span class="score">${content.querySelector('.score-number')?.textContent || '0'}%</span></div>
                <div><strong>Tanggal</strong><br><span>${content.querySelector('.modal-body div div:last-child span')?.textContent || ''}</span></div>
            </div>
            <div class="id">ID: ${content.querySelector('.id')?.textContent?.trim() || ''}</div>
        </div>
        </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// ============================================
// LOAD LEADERBOARD - TANPA orderBy
// ============================================
async function loadLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('quizResults')
            .limit(10)
            .get();
        
        const results = [];
        snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        if (results.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center;">Belum ada peserta</p>';
            return;
        }
        
        let html = '<ol style="padding-left:20px;">';
        results.forEach((result, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            html += `
                <li style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--gray-200);">
                    <span>${medal} ${result.userName || 'User'}</span>
                    <span style="font-weight:600; color:var(--primary);">${result.score || 0}%</span>
                </li>
            `;
        });
        html += '</ol>';
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        container.innerHTML = '<p class="text-muted" style="text-align:center;">Gagal memuat leaderboard</p>';
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ============================================
// EXPOSE TO GLOBAL
// ============================================
window.startQuiz = startQuiz;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.prevQuestion = prevQuestion;
window.submitQuiz = submitQuiz;
window.reviewAnswers = reviewAnswers;
window.retakeQuiz = retakeQuiz;
window.generateCertificate = generateCertificate;
window.printCertificate = printCertificate;

console.log('✅ Quiz.js loaded successfully!');