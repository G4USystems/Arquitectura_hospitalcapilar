import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

// Create user document in Firestore
async function createUserDocument(user, additionalData = {}) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || null,
      plan: 'free',
      quizLimit: 3,
      leadsLimit: 100,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return userRef;
}

// Register with email/password
export async function registerWithEmail(email, password, displayName) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateProfile(user, { displayName });
  }

  await createUserDocument(user, { displayName });
  return user;
}

// Login with email/password
export async function loginWithEmail(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

// Login with Google
export async function loginWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  await createUserDocument(user);
  return user;
}

// Logout
export async function logout() {
  await signOut(auth);
}

// Password reset
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// Get current user data from Firestore
export async function getUserData(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
}

// Subscribe to auth state changes
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
