function showToast(message, type = 'success') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const wrapper = input.closest('.password-wrapper');
    const icon = wrapper?.querySelector('.toggle-password i');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'fas fa-eye';
    }
}

function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.classList.remove('active');
}

function openForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.classList.add('active');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function truncateText(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

window.showToast = showToast;
window.validateEmail = validateEmail;
window.togglePasswordVisibility = togglePasswordVisibility;
window.closeForgotModal = closeForgotModal;
window.openForgotModal = openForgotModal;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.truncateText = truncateText;
console.log('✅ Utils loaded!');