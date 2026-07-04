const firebaseConfig = {
  apiKey: "AIzaSyD65Br_UKSoQBvmXOzokQpSaLRzCUiFbXU",
  authDomain: "web-infaqzakat.firebaseapp.com",
  projectId: "web-infaqzakat",
  storageBucket: "web-infaqzakat.firebasestorage.app",
  messagingSenderId: "1088791063373",
  appId: "1:1088791063373:web:91e322e0450aaa03ae2504",
  measurementId: "G-Q15306PRL9"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

db.enablePersistence({ synchronizeTabs: true }).catch(err => console.warn(err));

let currentUser = null;
let currentUserData = null;

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        await loadUserData(user.uid);
        console.log('✅ User logged in:', user.email);
    } else {
        currentUser = null;
        currentUserData = null;
        console.log('👋 User logged out');
    }
});

async function loadUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            currentUserData = { id: doc.id, ...doc.data() };
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
            await db.collection('users').doc(uid).set(userData);
            currentUserData = { id: uid, ...userData };
        }
        return currentUserData;
    } catch (error) {
        console.error('Error loading user data:', error);
        return null;
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        let message = 'Login gagal';
        switch (error.code) {
            case 'auth/user-not-found': message = 'Email tidak ditemukan'; break;
            case 'auth/wrong-password': message = 'Password salah'; break;
            case 'auth/invalid-email': message = 'Email tidak valid'; break;
            case 'auth/too-many-requests': message = 'Terlalu banyak percobaan'; break;
            default: message = error.message;
        }
        return { success: false, error: message };
    }
}

async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const userCredential = await auth.signInWithPopup(provider);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: 'Login dengan Google gagal' };
    }
}

async function registerUser(email, password, name, phone) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        await user.updateProfile({ displayName: name });
        await db.collection('users').doc(user.uid).set({
            name, email, phone, photoURL: '', role: 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, user };
    } catch (error) {
        let message = 'Registrasi gagal';
        if (error.code === 'auth/email-already-in-use') message = 'Email sudah terdaftar';
        if (error.code === 'auth/weak-password') message = 'Password minimal 6 karakter';
        return { success: false, error: message };
    }
}

async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Gagal mengirim reset password' };
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

window.auth = auth;
window.db = db;
window.storage = storage;
window.currentUser = currentUser;
window.currentUserData = currentUserData;
window.loginUser = loginUser;
window.loginWithGoogle = loginWithGoogle;
window.registerUser = registerUser;
window.resetPassword = resetPassword;
window.handleLogout = handleLogout;

console.log('🔥 Firebase initialized!');