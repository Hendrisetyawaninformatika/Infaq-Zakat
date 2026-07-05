// ============================================
// LIVE CHAT SYSTEM - FILANTROPI DIGITAL
// ============================================

// ============================================
// GLOBAL VARIABLES
// ============================================
var chatRoomId = null;
var messagesListener = null;
var currentChatUser = null;
var chatInitialized = false;

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
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('💬 Chat page loaded');

    // Init toast styles
    initToastStyles();

    // Check authentication
    var userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    var user = null;

    if (userData) {
        try {
            user = JSON.parse(userData);
            currentChatUser = user;
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
                // Update currentUser global
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
                
                if (!chatInitialized) {
                    initChat();
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
            displayName: user.displayName || user.name || 'User'
        };
        if (!chatInitialized) {
            initChat();
        }
    } else {
        showToast('Silakan login terlebih dahulu', 'warning');
        setTimeout(function() {
            window.location.href = 'login.html';
        }, 1500);
    }
});

// ============================================
// INIT CHAT
// ============================================
function initChat() {
    console.log('✅ Initializing chat for user:', window.currentUser.email);
    chatInitialized = true;
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
        
        // Auto focus on mobile
        input.addEventListener('focus', function() {
            setTimeout(function() {
                var messages = document.getElementById('chatMessages');
                if (messages) {
                    messages.scrollTop = messages.scrollHeight;
                }
            }, 300);
        });
    }

    // Set user name in header
    var userName = window.currentUser.displayName || window.currentUser.name || 'User';
    var userNameEl = document.querySelector('.chat-header .user-name');
    if (userNameEl) {
        userNameEl.textContent = userName;
    }
}

// ============================================
// LOAD CHAT ROOMS
// ============================================
async function loadChatRooms() {
    try {
        var container = document.getElementById('chatMessages');
        if (container) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat percakapan...</p>
                </div>
            `;
        }

        // Cari room dengan participants user
        var snapshot = await db.collection('chatRooms')
            .where('participants', 'array-contains', window.currentUser.uid)
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
            return id !== window.currentUser.uid;
        });

        if (otherUserId && otherUserId !== 'admin') {
            try {
                var userDoc = await db.collection('users').doc(otherUserId).get();
                if (userDoc.exists) {
                    var userData = userDoc.data();
                    currentChatUser = userData;
                    var header = document.querySelector('.chat-header h3');
                    if (header) {
                        header.innerHTML = '<i class="fas fa-comment-dots"></i> Chat dengan ' + (userData.name || 'User');
                    }
                }
            } catch (err) {
                console.log('Could not load user info:', err);
            }
        } else {
            var header = document.querySelector('.chat-header h3');
            if (header) {
                header.innerHTML = '<i class="fas fa-comment-dots"></i> Chat dengan Admin';
            }
        }

        console.log('✅ Chat room loaded:', chatRoomId);

    } catch (error) {
        console.error('Error loading chat rooms:', error);
        if (error.code === 'permission-denied') {
            showToast('Izin ditolak. Silakan login ulang.', 'error');
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 2000);
        } else if (error.code === 'failed-precondition' || error.message.includes('index')) {
            // Jika error index, buat room baru
            showToast('Membuat room chat baru...', 'info');
            await createChatRoom();
        } else {
            showToast('Gagal memuat chat: ' + error.message, 'error');
        }
    }
}

// ============================================
// CREATE CHAT ROOM
// ============================================
async function createChatRoom() {
    try {
        var userName = window.currentUser.displayName || window.currentUser.name || 'User';
        var userPhoto = window.currentUser.photoURL || '';

        var roomData = {
            participants: [window.currentUser.uid, 'admin'],
            participantName: userName,
            participantAvatar: userPhoto,
            lastMessage: 'Mulai percakapan',
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: window.currentUser.uid
        };

        var docRef = await db.collection('chatRooms').add(roomData);
        chatRoomId = docRef.id;
        
        console.log('✅ Chat room created:', chatRoomId);
        loadMessages(chatRoomId);
        
        var header = document.querySelector('.chat-header h3');
        if (header) {
            header.innerHTML = '<i class="fas fa-comment-dots"></i> Chat dengan Admin';
        }
        
        showToast('Room chat berhasil dibuat!', 'success');
        
    } catch (error) {
        console.error('Error creating chat room:', error);
        showToast('Gagal membuat room chat: ' + error.message, 'error');
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

    // Show loading
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Memuat pesan...</p>
        </div>
    `;

    // Listen for new messages
    try {
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
                var firstMessage = true;
                snapshot.forEach(function(doc) {
                    var msg = { id: doc.id, ...doc.data() };
                    var isOwn = msg.senderId === window.currentUser.uid;
                    var time = msg.createdAt ? msg.createdAt.toDate().toLocaleTimeString('id-ID', {
                        hour: '2-digit', minute: '2-digit'
                    }) : '';
                    var senderName = msg.senderName || (isOwn ? 'Anda' : 'Admin');

                    // Add date divider
                    if (firstMessage) {
                        var date = msg.createdAt ? msg.createdAt.toDate().toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'long', year: 'numeric'
                        }) : '';
                        if (date) {
                            html += `
                                <div class="date-divider">
                                    <span>${date}</span>
                                </div>
                            `;
                        }
                        firstMessage = false;
                    }

                    html += `
                        <div class="message ${isOwn ? 'sent' : 'received'}">
                            ${!isOwn ? '<span class="msg-name">' + senderName + '</span>' : ''}
                            <span class="msg-text">${msg.text}</span>
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
                if (error.code === 'permission-denied') {
                    showToast('Izin ditolak. Silakan login ulang.', 'error');
                }
            });
    } catch (error) {
        console.error('Error setting up listener:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Gagal memuat pesan. Silakan refresh halaman.</p>
            </div>
        `;
    }
}

// ============================================
// SEND MESSAGE
// ============================================
async function sendMessage() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();

    if (!text) {
        return;
    }

    if (!chatRoomId) {
        showToast('Room chat belum siap, membuat room baru...', 'info');
        await createChatRoom();
        if (!chatRoomId) {
            showToast('Gagal membuat room chat', 'error');
            return;
        }
    }

    var sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        var senderName = window.currentUser.displayName || window.currentUser.name || 'User';

        // Send message
        await db.collection('messages').add({
            roomId: chatRoomId,
            senderId: window.currentUser.uid,
            senderName: senderName,
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
        showToast('Gagal mengirim pesan: ' + error.message, 'error');
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
            .where('senderId', '!=', window.currentUser.uid)
            .where('read', '==', false)
            .get();

        if (snapshot.empty) return;

        var batch = db.batch();
        snapshot.forEach(function(doc) {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();

        console.log('✅ Messages marked as read');

    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

// ============================================
// ADD CHAT STYLES (Dynamic)
// ============================================
function initChatStyles() {
    var chatStyles = document.createElement('style');
    chatStyles.textContent = `
        .date-divider {
            text-align: center;
            padding: 12px 0 8px;
            font-size: 12px;
            color: var(--text-light);
        }
        .date-divider span {
            background: var(--bg);
            padding: 4px 16px;
            border-radius: 9999px;
            font-size: 12px;
            color: var(--text-light);
        }
        .message .msg-text {
            display: block;
            word-wrap: break-word;
        }
        .loading-spinner {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-light);
        }
        .loading-spinner i {
            font-size: 32px;
            display: block;
            margin-bottom: 12px;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-light);
        }
        .empty-state i {
            font-size: 48px;
            display: block;
            margin-bottom: 12px;
            opacity: 0.4;
        }
        .chat-empty {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-light);
        }
        .chat-empty i {
            font-size: 56px;
            display: block;
            margin-bottom: 16px;
            opacity: 0.3;
        }
        .chat-empty p {
            font-size: 15px;
        }
        @media (max-width: 480px) {
            .chat-empty i {
                font-size: 40px;
            }
            .chat-empty p {
                font-size: 13px;
            }
            .date-divider span {
                font-size: 10px;
                padding: 2px 12px;
            }
        }
    `;
    document.head.appendChild(chatStyles);
}

// Call after DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initChatStyles();
});

console.log('🌙 Filantropi Digital - Chat.js Loaded Successfully!');
console.log('🤲 "Barangsiapa memberi, maka ia akan mendapatkan balasan"');