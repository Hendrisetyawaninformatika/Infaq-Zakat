// ============================================
// LIVE CHAT SYSTEM
// ============================================

var chatRoomId = null;
var messagesListener = null;
var currentChatUser = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('💬 Chat page loaded');
    
    // 🔥 CEK currentUser DENGAN BENAR
    if (typeof currentUser === 'undefined' || !currentUser) {
        console.log('⏳ Waiting for Firebase auth...');
        // Tunggu sebentar lalu cek lagi
        setTimeout(function() {
            if (typeof currentUser !== 'undefined' && currentUser) {
                console.log('✅ User found after waiting:', currentUser.email);
                initChat();
            } else {
                showToast('Silakan login terlebih dahulu', 'warning');
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 1500);
            }
        }, 1000);
        return;
    }
    
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu', 'warning');
        setTimeout(function() {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    initChat();
});

// ============================================
// INIT CHAT
// ============================================
function initChat() {
    console.log('✅ Initializing chat for user:', currentUser.email);
    setupChatUI();
    loadChatRooms();
}

// ============================================
// SETUP CHAT UI
// ============================================
function setupChatUI() {
    var input = document.getElementById('chatInput');
    var sendBtn = document.getElementById('sendBtn');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// ============================================
// LOAD CHAT ROOMS
// ============================================
async function loadChatRooms() {
    try {
        // Cari room dengan participants user
        var snapshot = await db.collection('chatRooms')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('lastMessageTime', 'desc')
            .get();
        
        if (snapshot.empty) {
            // Buat room baru jika belum ada
            await createChatRoom();
            return;
        }
        
        // Buka room pertama
        var firstRoom = snapshot.docs[0];
        chatRoomId = firstRoom.id;
        loadMessages(chatRoomId);
        
        // Update room name
        var roomData = firstRoom.data();
        var otherUserId = roomData.participants.find(function(id) {
            return id !== currentUser.uid;
        });
        
        if (otherUserId && otherUserId !== 'admin') {
            try {
                var userResult = await FirestoreService.get('users', otherUserId);
                if (userResult.success) {
                    currentChatUser = userResult.data;
                    var header = document.querySelector('.chat-header h3');
                    if (header) {
                        header.innerHTML = '<i class="fas fa-comment-dots"></i> Chat dengan ' + (currentChatUser.name || 'User');
                    }
                }
            } catch (err) {
                console.log('Could not load user info:', err);
            }
        }
        
    } catch (error) {
        console.error('Error loading chat rooms:', error);
    }
}

// ============================================
// CREATE CHAT ROOM
// ============================================
async function createChatRoom() {
    try {
        var userName = (currentUserData && currentUserData.name) ? currentUserData.name : 'User';
        var userPhoto = (currentUserData && currentUserData.photoURL) ? currentUserData.photoURL : '';
        
        var roomData = {
            participants: [currentUser.uid, 'admin'],
            participantName: userName,
            participantAvatar: userPhoto,
            lastMessage: 'Mulai percakapan',
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        var result = await FirestoreService.create('chatRooms', roomData);
        if (result.success) {
            chatRoomId = result.id;
            loadMessages(chatRoomId);
            var header = document.querySelector('.chat-header h3');
            if (header) {
                header.innerHTML = '<i class="fas fa-comment-dots"></i> Chat dengan Admin';
            }
        }
    } catch (error) {
        console.error('Error creating chat room:', error);
        showToast('Gagal membuat room chat', 'error');
    }
}

// ============================================
// LOAD MESSAGES (REALTIME)
// ============================================
function loadMessages(roomId) {
    var container = document.getElementById('chatMessages');
    if (!container) return;
    
    // Remove old listener
    if (messagesListener) {
        messagesListener();
        messagesListener = null;
    }
    
    // Listen for new messages
    messagesListener = db.collection('messages')
        .where('roomId', '==', roomId)
        .orderBy('createdAt', 'asc')
        .onSnapshot(function(snapshot) {
            if (snapshot.empty) {
                container.innerHTML = `
                    <div class="chat-empty">
                        <i class="fas fa-comment-slash"></i>
                        <p>Belum ada pesan. Mulai percakapan sekarang!</p>
                    </div>
                `;
                return;
            }
            
            var html = '';
            snapshot.forEach(function(doc) {
                var msg = { id: doc.id, ...doc.data() };
                var isOwn = msg.senderId === currentUser.uid;
                var time = msg.createdAt ? msg.createdAt.toDate().toLocaleTimeString('id-ID', {
                    hour: '2-digit', minute: '2-digit'
                }) : '';
                
                html += `
                    <div class="message ${isOwn ? 'sent' : 'received'}">
                        ${!isOwn ? '<span class="msg-name">' + (msg.senderName || 'Admin') + '</span>' : ''}
                        ${msg.text}
                        <span class="msg-time">${time}</span>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            container.scrollTop = container.scrollHeight;
            
            // Mark messages as read
            markMessagesRead(roomId);
        }, function(error) {
            console.error('Error loading messages:', error);
        });
}

// ============================================
// SEND MESSAGE
// ============================================
async function sendMessage() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();
    
    if (!text || !chatRoomId) {
        if (!chatRoomId) showToast('Room chat belum siap', 'error');
        return;
    }
    
    var sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    try {
        // Send message
        await db.collection('messages').add({
            roomId: chatRoomId,
            senderId: currentUser.uid,
            senderName: (currentUserData && currentUserData.name) ? currentUserData.name : 'User',
            text: text,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update room last message
        await db.collection('chatRooms').doc(chatRoomId).update({
            lastMessage: text,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        input.value = '';
        input.focus();
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Gagal mengirim pesan', 'error');
    }
    
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim';
    }
}

// ============================================
// MARK MESSAGES AS READ
// ============================================
async function markMessagesRead(roomId) {
    try {
        var snapshot = await db.collection('messages')
            .where('roomId', '==', roomId)
            .where('senderId', '!=', currentUser.uid)
            .where('read', '==', false)
            .get();
        
        if (snapshot.empty) return;
        
        var batch = db.batch();
        snapshot.forEach(function(doc) {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();
        
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}