// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyD65Br_UKSoQBvmXOzokQpSaLRzCUiFbXU",
  authDomain: "web-infaqzakat.firebaseapp.com",
  databaseURL: "https://web-infaqzakat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-infaqzakat",
  storageBucket: "web-infaqzakat.firebasestorage.app",
  messagingSenderId: "1088791063373",
  appId: "1:1088791063373:web:91e322e0450aaa03ae2504",
  measurementId: "G-Q15306PRL9"
};




// 🔥 PAKAI COMPAT VERSION (BUKAN IMPORT!)
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
    .catch(err => console.warn('Firestore persistence error:', err));

// ============================================
// AUTH STATE MANAGEMENT
// ============================================

let currentUser = null;
let currentUserData = null;

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadUserData(user.uid);
        console.log('✅ User logged in:', user.email);
    } else {
        currentUser = null;
        currentUserData = null;
        console.log('👋 User logged out');
    }
});

// ============================================
// LOAD USER DATA
// ============================================

function loadUserData(uid) {
    db.collection('users').doc(uid).get()
        .then((doc) => {
            if (doc.exists) {
                currentUserData = { id: doc.id, ...doc.data() };
                console.log('📁 User data loaded:', currentUserData.name);
            } else {
                const userData = {
                    name: currentUser.displayName || 'User',
                    email: currentUser.email,
                    phone: '',
                    photoURL: currentUser.photoURL || '',
                    role: 'user',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                db.collection('users').doc(uid).set(userData)
                    .then(() => {
                        currentUserData = { id: uid, ...userData };
                        console.log('📁 User data created');
                    })
                    .catch((error) => {
                        console.error('Error creating user data:', error);
                    });
            }
        })
        .catch((error) => {
            console.error('Error loading user data:', error);
        });
}

// ============================================
// REGISTER USER
// ============================================

function registerUser(email, password, name, phone) {
    console.log('📝 Attempting registration for:', email);
    
    return auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('✅ User created:', user.uid);
            
            return user.updateProfile({ displayName: name })
                .then(() => {
                    console.log('✅ Profile updated');
                    return db.collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        phone: phone,
                        photoURL: '',
                        role: 'user',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .then(() => {
                    console.log('✅ User data saved to Firestore');
                    return { success: true, user: user };
                });
        })
        .catch((error) => {
            console.error('❌ Registration error:', error.code, error.message);
            let message = 'Registrasi gagal';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email sudah terdaftar. Silakan login.';
                    break;
                case 'auth/weak-password':
                    message = 'Password terlalu lemah. Minimal 6 karakter.';
                    break;
                case 'auth/invalid-email':
                    message = 'Email tidak valid.';
                    break;
                default:
                    message = error.message;
            }
            return { success: false, error: message };
        });
}

// ============================================
// LOGIN USER
// ============================================

function loginUser(email, password) {
    console.log('🔑 Attempting login for:', email);
    
    return auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('✅ Login successful!');
            return { success: true, user: userCredential.user };
        })
        .catch((error) => {
            console.error('❌ Login error:', error.code, error.message);
            let message = 'Login gagal';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'Email tidak ditemukan. Silakan daftar.';
                    break;
                case 'auth/wrong-password':
                    message = 'Password salah. Coba lagi atau reset password.';
                    break;
                case 'auth/invalid-email':
                    message = 'Email tidak valid.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Terlalu banyak percobaan. Coba lagi nanti.';
                    break;
                default:
                    message = error.message;
            }
            return { success: false, error: message };
        });
}

// ============================================
// LOGIN WITH GOOGLE
// ============================================

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    return auth.signInWithPopup(provider)
        .then((userCredential) => {
            console.log('✅ Google login successful!');
            return { success: true, user: userCredential.user };
        })
        .catch((error) => {
            console.error('❌ Google login error:', error.code);
            let message = 'Login dengan Google gagal';
            if (error.code === 'auth/popup-closed-by-user') {
                message = 'Popup ditutup, silakan coba lagi.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                message = 'Email sudah terdaftar dengan metode lain.';
            }
            return { success: false, error: message };
        });
}

// ============================================
// RESET PASSWORD
// ============================================

function resetPassword(email) {
    console.log('📝 Password reset requested for:', email);
    
    return auth.sendPasswordResetEmail(email)
        .then(() => {
            console.log('✅ Password reset email sent');
            return { success: true };
        })
        .catch((error) => {
            console.error('❌ Password reset error:', error.code);
            let message = 'Gagal mengirim reset password';
            if (error.code === 'auth/user-not-found') {
                message = 'Email tidak ditemukan.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Email tidak valid.';
            }
            return { success: false, error: message };
        });
}

// ============================================
// LOGOUT
// ============================================

function handleLogout() {
    return auth.signOut()
        .then(() => {
            console.log('👋 Logout successful');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('❌ Logout error:', error);
            showToast('Gagal logout', 'error');
        });
}

// ============================================
// FIRESTORE SERVICE
// ============================================

const FirestoreService = {
    get: function(collection, id) {
        return db.collection(collection).doc(id).get()
            .then((doc) => {
                if (doc.exists) {
                    return { success: true, data: { id: doc.id, ...doc.data() } };
                }
                return { success: false, error: 'Document not found' };
            })
            .catch((error) => {
                return { success: false, error: error.message };
            });
    },
    create: function(collection, data) {
        return db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then((docRef) => {
                return { success: true, id: docRef.id };
            })
            .catch((error) => {
                return { success: false, error: error.message };
            });
    },
    update: function(collection, id, data) {
        return db.collection(collection).doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                return { success: true };
            })
            .catch((error) => {
                return { success: false, error: error.message };
            });
    },
    delete: function(collection, id) {
        return db.collection(collection).doc(id).delete()
            .then(() => {
                return { success: true };
            })
            .catch((error) => {
                return { success: false, error: error.message };
            });
    }
};

// ============================================
// 🔥 EXPOSE KE GLOBAL - WAJIB ADA!
// ============================================

window.auth = auth;
window.db = db;
window.storage = storage;
window.currentUser = currentUser;
window.currentUserData = currentUserData;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.loginWithGoogle = loginWithGoogle;
window.resetPassword = resetPassword;
window.handleLogout = handleLogout;
window.FirestoreService = FirestoreService;

console.log('🔥 Firebase initialized successfully!');
console.log('📁 Project ID:', firebaseConfig.projectId);