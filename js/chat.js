let chatRoomId = null;
let messagesListener = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) { showToast('Silakan login untuk menggunakan chat', 'warning'); setTimeout(() => window.location.href = 'login.html', 1500); return; }
    loadChatRooms();
    setupChatUI();
});

async function loadChatRooms() {
    const container = document.getElementById('chatList');
    if (!container) return;
    try {
        const snapshot = await db.collection('chatRooms').where('participants', 'array-contains', currentUser.uid).orderBy('lastMessageTime', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = `<div class="empty-state" style="padding:20px; text-align:center;">
                <i class="fas fa-comment-slash" style="font-size:32px; color:var(--gray-400);"></i>
                <p style="font-size:14px; color:var(--gray-500);">Belum ada percakapan</p></div>`;
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const room = { id: doc.id, ...doc.data() };
            const otherUserId = room.participants.find(id => id !== currentUser.uid);
            html += `
                <div class="chat-room-item" onclick="openChatRoom('${room.id}')">
                    <img src="${room.participantAvatar || 'assets/default-avatar.png'}" alt="User" class="room-avatar">
                    <div class="room-info"><div class="room-name">${room.participantName || 'User'}</div>
                    <div class="room-last">${room.lastMessage || 'Mulai percakapan'}</div></div>
                    <span class="room-time">${formatTime(room.lastMessageTime)}</span>
                </div>
            `;
        });
        container.innerHTML = html;
        if (snapshot.docs.length > 0) { openChatRoom(snapshot.docs[0].id); }
    } catch (error) { console.error('Error loading chat rooms:', error); }
}

async function openChatRoom(roomId) {
    chatRoomId = roomId;
    const result = await FirestoreService.get('chatRooms', roomId);
    if (!result.success) { showToast('Gagal membuka percakapan', 'error'); return; }
    const room = result.data;
    const otherUserId = room.participants.find(id => id !== currentUser.uid);
    if (otherUserId && otherUserId !== 'admin') {
        const userResult = await FirestoreService.get('users', otherUserId);
        if (userResult.success) { currentChatUser = userResult.data; }
    } else { currentChatUser = { name: 'Admin', photoURL: 'assets/admin-avatar.png' }; }
    document.getElementById('chatUserAvatar').src = currentChatUser?.photoURL || 'assets/default-avatar.png';
    document.getElementById('chatUserName').textContent = currentChatUser?.name || 'User';
    document.getElementById('chatUserStatus').textContent = 'Online';
    document.getElementById('chatUserStatus').style.color = '#4CAF50';
    loadMessages(roomId);
    document.querySelectorAll('.chat-room-item').forEach(el => { el.classList.toggle('active', el.dataset.roomId === roomId); });
}

function loadMessages(roomId) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    if (messagesListener) { messagesListener(); messagesListener = null; }
    messagesListener = db.collection('messages').where('roomId', '==', roomId).orderBy('createdAt', 'asc')
        .onSnapshot((snapshot) => {
            if (snapshot.empty && !container.querySelector('.chat-welcome')) {
                container.innerHTML = `<div class="chat-welcome"><i class="fas fa-handshake"></i>
                    <h3>Mulai Percakapan</h3><p>Kirim pesan untuk memulai percakapan</p></div>`;
                return;
            }
            let html = '';
            snapshot.forEach(doc => {
                const msg = { id: doc.id, ...doc.data() };
                const isOwn = msg.senderId === currentUser.uid;
                html += `
                    <div class="chat-message ${isOwn ? 'user' : 'admin'}">
                        <div class="message-bubble">${msg.text}</div>
                        <div class="message-time">${formatTime(msg.createdAt)}</div>
                    </div>
                `;
            });
            container.innerHTML = html;
            container.scrollTop = container.scrollHeight;
            markMessagesRead(roomId);
        }, (error) => { console.error('Error loading messages:', error); });
}

function setupChatUI() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) { sendBtn.addEventListener('click', sendMessage); }
    if (input) {
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    }
    document.getElementById('clearChatBtn')?.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua pesan?')) { clearChat(); }
    });
    document.getElementById('closeChatBtn')?.addEventListener('click', () => {
        if (confirm('Tutup percakapan?')) {
            if (messagesListener) { messagesListener(); messagesListener = null; }
            document.getElementById('chatMessages').innerHTML = `<div class="chat-welcome"><i class="fas fa-handshake"></i>
                <h3>Pilih Percakapan</h3><p>Pilih percakapan dari daftar di sebelah kiri</p></div>`;
            chatRoomId = null;
        }
    });
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !chatRoomId) return;
    try {
        await db.collection('messages').add({
            roomId: chatRoomId, senderId: currentUser.uid,
            senderName: currentUserData?.name || 'User', text: text, read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('chatRooms').doc(chatRoomId).update({
            lastMessage: text, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        input.value = '';
    } catch (error) { console.error('Error sending message:', error); showToast('Gagal mengirim pesan', 'error'); }
}

async function markMessagesRead(roomId) {
    try {
        const snapshot = await db.collection('messages').where('roomId', '==', roomId).where('senderId', '!=', currentUser.uid).where('read', '==', false).get();
        const batch = db.batch();
        snapshot.forEach(doc => { batch.update(doc.ref, { read: true }); });
        await batch.commit();
    } catch (error) { console.error('Error marking messages as read:', error); }
}

async function clearChat() {
    if (!chatRoomId) return;
    try {
        const snapshot = await db.collection('messages').where('roomId', '==', chatRoomId).get();
        const batch = db.batch();
        snapshot.forEach(doc => { batch.delete(doc.ref); });
        await batch.commit();
        await db.collection('chatRooms').doc(chatRoomId).update({
            lastMessage: 'Percakapan telah dihapus', lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Percakapan telah dihapus', 'success');
    } catch (error) { console.error('Error clearing chat:', error); showToast('Gagal menghapus percakapan', 'error'); }
}

function formatTime(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

window.openChatRoom = openChatRoom;