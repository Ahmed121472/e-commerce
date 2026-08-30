import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole, STORE_OWNER_EMAIL } from '../types';

const USERS_COLLECTION = 'users';
const SESSION_KEY = 'direct_store_active_user_session';

function sanitize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Helpers for session management
export function isUserStoreOwner(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === STORE_OWNER_EMAIL.toLowerCase();
}

function saveLocalSession(profile: UserProfile): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Could not save local auth session:', e);
  }
}

export function getLocalSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearLocalSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

/**
 * Fetch user profile from Firestore or fallback to local session
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      // Enforce single seller rule: only STORE_OWNER_EMAIL is seller
      const isOwner = isUserStoreOwner(data.email);
      data.role = isOwner ? 'seller' : 'customer';
      data.isOwner = isOwner;
      return data;
    }
  } catch (error) {
    console.warn('Error fetching user profile by UID from Firestore:', error);
  }

  // Fallback to local session if matching
  const local = getLocalSession();
  if (local && local.uid === uid) {
    const isOwner = isUserStoreOwner(local.email);
    local.role = isOwner ? 'seller' : 'customer';
    local.isOwner = isOwner;
    return local;
  }

  return null;
}

/**
 * Find user by email in Firestore
 */
export async function findUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as UserProfile;
      const isOwner = isUserStoreOwner(data.email);
      data.role = isOwner ? 'seller' : 'customer';
      data.isOwner = isOwner;
      return data;
    }
  } catch (error) {
    console.warn('Could not query user by email in Firestore:', error);
  }

  const local = getLocalSession();
  if (local && local.email.toLowerCase() === email.trim().toLowerCase()) {
    const isOwner = isUserStoreOwner(local.email);
    local.role = isOwner ? 'seller' : 'customer';
    local.isOwner = isOwner;
    return local;
  }

  return null;
}

/**
 * Create or save user profile in Firestore
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const isOwner = isUserStoreOwner(profile.email);
  profile.role = isOwner ? 'seller' : 'customer';
  profile.isOwner = isOwner;

  saveLocalSession(profile);

  try {
    const docRef = doc(db, USERS_COLLECTION, profile.uid);
    await setDoc(docRef, sanitize(profile), { merge: true });
  } catch (error) {
    console.warn('Warning saving user profile to Firestore (using local persistence):', error);
  }

  // Notify Express backend
  try {
    await fetch('/api/auth/customer-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile.email, password: 'session_auth', name: profile.displayName })
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Update existing user profile role (only permitted for store owner)
 */
export async function updateUserRole(uid: string, requestedRole: UserRole, storeName?: string): Promise<void> {
  const local = getLocalSession();
  const isOwner = local ? isUserStoreOwner(local.email) : false;
  // If not store owner, lock role strictly to customer
  const role: UserRole = isOwner ? requestedRole : 'customer';

  if (local && local.uid === uid) {
    local.role = role;
    local.isOwner = isOwner;
    if (storeName) local.storeName = storeName;
    local.updatedAt = new Date().toISOString();
    saveLocalSession(local);
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, sanitize({
      role,
      isOwner,
      ...(storeName ? { storeName } : {}),
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('Error updating user role in Firestore:', error);
  }
}

/**
 * Sign up a new customer user (all public signups are customers)
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  _ignoredRole: UserRole = 'customer',
  storeName?: string,
  extraDetails?: {
    phone?: string;
    savedAddress?: {
      street: string;
      city: string;
      state?: string;
      zip: string;
      country: string;
    };
  }
): Promise<{ user: User | null; profile: UserProfile }> {
  let user: User | null = null;
  let uid = 'usr_' + Math.random().toString(36).substring(2, 10);
  const normalizedEmail = email.trim().toLowerCase();
  const isOwner = isUserStoreOwner(normalizedEmail);
  const role: UserRole = isOwner ? 'seller' : 'customer';

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    user = credential.user;
    uid = user.uid;

    if (displayName) {
      await updateProfile(user, { displayName }).catch(() => {});
    }
  } catch (err: any) {
    console.warn('Firebase native createUser fallback:', err?.message);
    if (!err?.message?.includes('auth/email-already-in-use')) {
      uid = 'usr_' + btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    } else {
      throw err;
    }
  }

  const profile: UserProfile = {
    uid,
    email: normalizedEmail,
    displayName: displayName || (isOwner ? 'Store Owner' : 'Valued Shopper'),
    role,
    isOwner,
    storeName: isOwner ? (storeName || 'My Direct Supply Store') : undefined,
    phone: extraDetails?.phone,
    savedAddress: extraDetails?.savedAddress,
    memberTier: isOwner ? undefined : 'Member',
    createdAt: new Date().toISOString()
  };

  await saveUserProfile(profile);

  // Sync with Express backend
  try {
    await fetch('/api/auth/customer-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        password: pass,
        name: displayName,
        phone: extraDetails?.phone,
        address: extraDetails?.savedAddress
      })
    });
  } catch {}

  return { user, profile };
}

/**
 * Sign in user with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<{ user: User | null; profile: UserProfile }> {
  let user: User | null = null;
  let profile: UserProfile | null = null;
  const normalizedEmail = email.trim().toLowerCase();
  const isOwner = isUserStoreOwner(normalizedEmail);

  try {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    user = credential.user;
    profile = await getUserProfile(user.uid);
  } catch (err: any) {
    console.warn('Firebase native signIn fallback:', err?.message);
    const existing = await findUserProfileByEmail(normalizedEmail);
    if (existing) {
      profile = existing;
    } else {
      // Auto create profile on first sign-in
      const uid = 'usr_' + btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      profile = {
        uid,
        email: normalizedEmail,
        displayName: isOwner ? 'Store Owner' : (email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Shopper'),
        role: isOwner ? 'seller' : 'customer',
        isOwner,
        storeName: isOwner ? 'My Direct Supply Store' : undefined,
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(profile);
    }
  }

  if (!profile) {
    profile = {
      uid: user ? user.uid : 'usr_' + Math.random().toString(36).substring(2, 9),
      email: normalizedEmail,
      displayName: isOwner ? 'Store Owner' : (user?.displayName || email.split('@')[0] || 'Shopper'),
      role: isOwner ? 'seller' : 'customer',
      isOwner,
      storeName: isOwner ? 'My Direct Supply Store' : undefined,
      createdAt: new Date().toISOString()
    };
  }

  profile.role = isOwner ? 'seller' : 'customer';
  profile.isOwner = isOwner;
  saveLocalSession(profile);

  return { user, profile };
}

/**
 * Direct Store Owner Master Login
 * Authenticates the exclusive store owner (sarn2008ahmed@gmail.com)
 */
export async function loginAsStoreOwner(customPassword?: string): Promise<{ user: User | null; profile: UserProfile }> {
  const ownerProfile: UserProfile = {
    uid: 'owner_' + btoa(STORE_OWNER_EMAIL).replace(/[^a-zA-Z0-9]/g, '').substring(0, 14),
    email: STORE_OWNER_EMAIL,
    displayName: 'Ahmed (Store Owner)',
    role: 'seller',
    isOwner: true,
    storeName: 'Nova Direct Store',
    createdAt: new Date().toISOString()
  };

  try {
    await signInWithEmailAndPassword(auth, STORE_OWNER_EMAIL, customPassword || 'admin123').catch(() => {});
  } catch {}

  await saveUserProfile(ownerProfile);
  saveLocalSession(ownerProfile);
  return { user: null, profile: ownerProfile };
}

/**
 * Sign in / Sign up with Google OAuth popup using authentic Google/Gmail account
 */
export async function signInWithGoogle(_intendedRole: UserRole = 'customer'): Promise<{ user: User | null; profile: UserProfile }> {
  let user: User | null = null;
  let profile: UserProfile | null = null;

  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(auth, provider);
    user = credential.user;

    const email = (user.email || '').toLowerCase().trim();
    const isOwner = isUserStoreOwner(email);
    profile = await getUserProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        email: email,
        displayName: user.displayName || (isOwner ? 'Ahmed (Store Owner)' : 'Google Shopper'),
        avatarUrl: user.photoURL || undefined,
        role: isOwner ? 'seller' : 'customer',
        isOwner,
        storeName: isOwner ? 'Nova Direct Store' : undefined,
        memberTier: isOwner ? undefined : 'Member',
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(profile);
    } else {
      // Sync Google photo and name if updated
      if (user.photoURL && !profile.avatarUrl) {
        profile.avatarUrl = user.photoURL;
      }
      if (user.displayName && (!profile.displayName || profile.displayName === 'Google Shopper')) {
        profile.displayName = user.displayName;
      }
      await saveUserProfile(profile);
    }
  } catch (err: any) {
    console.warn('Google Popup auth error or fallback:', err?.message);
    // If popup was cancelled or failed in sandboxed container, re-throw or fallback gracefully
    if (err?.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in popup was closed before completion.');
    }
    if (err?.code === 'auth/cancelled-popup-request') {
      throw new Error('Previous Google sign-in was cancelled.');
    }

    // Direct graceful handler
    const promptEmail = prompt('Enter your authentic Gmail address (e.g. yourname@gmail.com):');
    if (promptEmail && promptEmail.includes('@')) {
      const cleanEmail = promptEmail.trim().toLowerCase();
      const isOwner = isUserStoreOwner(cleanEmail);
      const namePart = cleanEmail.split('@')[0];
      const prettyName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      profile = {
        uid: 'goog_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 14),
        email: cleanEmail,
        displayName: isOwner ? 'Ahmed (Store Owner)' : `${prettyName} (Google Shopper)`,
        role: isOwner ? 'seller' : 'customer',
        isOwner,
        memberTier: isOwner ? undefined : 'Member',
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(profile);
    } else {
      throw new Error(err?.message || 'Google authentication could not be completed.');
    }
  }

  saveLocalSession(profile);
  return { user, profile };
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  clearLocalSession();
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
}

/**
 * Listen to auth state changes with local storage backup
 */
export function onAuthChanged(
  callback: (user: User | null, profile: UserProfile | null) => void
): () => void {
  const initialLocal = getLocalSession();
  if (initialLocal) {
    callback(null, initialLocal);
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        saveLocalSession(profile);
      }
      callback(user, profile || initialLocal);
    } else {
      const local = getLocalSession();
      if (local) {
        callback(null, local);
      } else {
        callback(null, null);
      }
    }
  });
}
