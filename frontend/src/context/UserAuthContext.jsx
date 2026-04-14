import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore, googleProvider } from '../services/firebase';

const UserAuthContext = createContext(null);
const FIRESTORE_PROFILE_WRITE_TIMEOUT_MS = 20000;
const FIRESTORE_PROFILE_READ_TIMEOUT_MS = 12000;
const FIRESTORE_PROFILE_WRITE_MAX_ATTEMPTS = 3;

function splitDisplayName(name = '') {
  const clean = String(name).trim();
  if (!clean) {
    return { firstName: '', lastName: '' };
  }
  const [firstName, ...rest] = clean.split(/\s+/);
  return {
    firstName: firstName || '',
    lastName: rest.join(' ')
  };
}

function buildDisplayName(firstName = '', lastName = '', displayName = '', email = '') {
  const explicitName = String(displayName || '').trim();
  if (explicitName) return explicitName;

  const combinedName = `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
  if (combinedName) return combinedName;

  return String(email || '').split('@')[0] || 'User';
}

function resolveAvatarUrl(primaryAvatarUrl = '', fallbackAvatarUrl = '') {
  const primary = String(primaryAvatarUrl || '').trim();
  if (primary) return primary;
  return String(fallbackAvatarUrl || '').trim();
}

function formatFirestoreError(error, fallbackMessage) {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  if (code.includes('permission-denied')) {
    return 'Firestore permission denied. Check users/{uid} security rules and confirm you are logged in.';
  }
  if (code.includes('unauthenticated')) {
    return 'Your session is not authenticated. Please login again.';
  }
  if (code.includes('unavailable') || code.includes('deadline-exceeded') || message.includes('timed out')) {
    return 'Firestore is taking too long to respond. Please check your internet and try again.';
  }
  return error?.message || fallbackMessage;
}

async function withTimeout(promise, timeoutMs, label) {
  let timerId;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms.`)), timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timerId);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableFirestoreWriteError(error) {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  return (
    code.includes('unavailable') ||
    code.includes('deadline-exceeded') ||
    code.includes('aborted') ||
    code.includes('network-request-failed') ||
    message.includes('timed out') ||
    message.includes('network error') ||
    message.includes('offline')
  );
}

async function persistProfileWithRetry(profileRef, nextProfile) {
  let lastError = null;

  for (let attempt = 1; attempt <= FIRESTORE_PROFILE_WRITE_MAX_ATTEMPTS; attempt += 1) {
    try {
      await withTimeout(
        setDoc(profileRef, nextProfile, { merge: true }),
        FIRESTORE_PROFILE_WRITE_TIMEOUT_MS,
        `Firestore profile write (attempt ${attempt})`
      );
      return;
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < FIRESTORE_PROFILE_WRITE_MAX_ATTEMPTS && isRetryableFirestoreWriteError(error);
      if (!shouldRetry) {
        throw error;
      }

      const retryDelayMs = 600 * attempt;
      console.warn('[Profile] Firestore write timed out, retrying.', {
        attempt,
        retryDelayMs,
        code: error?.code,
        message: error?.message
      });
      await sleep(retryDelayMs);
    }
  }

  throw lastError || new Error('Unable to save profile to Firestore.');
}

async function readProfile(uid) {
  const profileRef = doc(firestore, 'users', uid);
  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? snapshot.data() : null;
}

function normalizeProfile(profile, fallbackEmail = '', fallbackAvatarUrl = '') {
  if (!profile) return null;
  return {
    uid: profile.uid || '',
    email: profile.email || fallbackEmail || '',
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    displayName: profile.displayName || '',
    phoneNumber: profile.phoneNumber || '',
    address: profile.address || '',
    city: profile.city || '',
    avatarUrl: resolveAvatarUrl(profile.avatarUrl, fallbackAvatarUrl),
    createdAt: profile.createdAt || '',
    updatedAt: profile.updatedAt || ''
  };
}

export function UserAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      try {
        const existingProfile = await readProfile(user.uid);
        if (existingProfile) {
          const resolvedProfile = normalizeProfile(existingProfile, user.email || '', user.photoURL || '');
          setProfile(resolvedProfile);
          if (!existingProfile.avatarUrl && user.photoURL) {
            await setDoc(
              doc(firestore, 'users', user.uid),
              {
                avatarUrl: user.photoURL,
                updatedAt: new Date().toISOString()
              },
              { merge: true }
            );
          }
        } else {
          const nameParts = splitDisplayName(user.displayName || '');
          const newProfile = {
            uid: user.uid,
            email: user.email || '',
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
            displayName: buildDisplayName(nameParts.firstName, nameParts.lastName, user.displayName, user.email),
            phoneNumber: '',
            address: '',
            city: '',
            avatarUrl: user.photoURL || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(firestore, 'users', user.uid), newProfile, { merge: true });
          setProfile(normalizeProfile(newProfile, user.email || '', user.photoURL || ''));
        }
      } catch (error) {
        console.error('[UserAuth] Failed to load profile from Firestore.', {
          uid: user.uid,
          code: error?.code,
          message: error?.message
        });
        setProfile({
          uid: user.uid,
          email: user.email || '',
          firstName: '',
          lastName: '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          phoneNumber: '',
          address: '',
          city: '',
          avatarUrl: user.photoURL || '',
          createdAt: '',
          updatedAt: ''
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const registerWithEmail = async ({ email, password, firstName, lastName, displayName }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    const resolvedDisplayName = buildDisplayName(firstName, lastName, displayName, email);

    await updateProfile(user, { displayName: resolvedDisplayName });

    const nextProfile = {
      uid: user.uid,
      email: user.email || email,
      firstName: String(firstName || '').trim(),
      lastName: String(lastName || '').trim(),
      displayName: resolvedDisplayName,
      phoneNumber: '',
      address: '',
      city: '',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(firestore, 'users', user.uid), nextProfile, { merge: true });
    setProfile(normalizeProfile(nextProfile, user.email || email, user.photoURL || ''));
    return credential;
  };

  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const nameParts = splitDisplayName(user.displayName || '');

    const nextProfile = {
      uid: user.uid,
      email: user.email || '',
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      displayName: buildDisplayName(nameParts.firstName, nameParts.lastName, user.displayName, user.email),
      avatarUrl: user.photoURL || '',
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(firestore, 'users', user.uid), nextProfile, { merge: true });
    const mergedProfile = await readProfile(user.uid);
    setProfile(normalizeProfile(mergedProfile, user.email || '', user.photoURL || ''));
    return result;
  };

  const saveProfile = async (payload) => {
    if (loading) {
      throw new Error('Auth is still initializing. Please wait a moment and try again.');
    }

    const user = auth.currentUser || currentUser;
    if (!user) {
      throw new Error('You must be logged in to update profile.');
    }
    if (!user.uid) {
      throw new Error('Missing user uid. Please login again and retry.');
    }

    const firstName = String(payload.firstName || '').trim();
    const lastName = String(payload.lastName || '').trim();
    const displayName = buildDisplayName(firstName, lastName, payload.displayName, user.email);
    const avatarUrl = resolveAvatarUrl(payload.avatarUrl, profile?.avatarUrl || user.photoURL || '');

    const nextProfile = {
      uid: user.uid,
      email: user.email || '',
      firstName,
      lastName,
      displayName,
      phoneNumber: String(payload.phoneNumber || '').trim(),
      address: String(payload.address || '').trim(),
      city: String(payload.city || '').trim(),
      avatarUrl,
      updatedAt: new Date().toISOString()
    };

    console.log('[Profile] saveProfile uid:', user.uid);
    console.log('[Profile] saveProfile payload:', nextProfile);

    const optimisticProfile = normalizeProfile(
      {
        ...(profile || {}),
        ...nextProfile,
        createdAt: profile?.createdAt || ''
      },
      user.email || '',
      user.photoURL || ''
    );
    setProfile(optimisticProfile);

    const profileRef = doc(firestore, 'users', user.uid);
    try {
      await persistProfileWithRetry(profileRef, nextProfile);
      console.log('[Profile] Firestore write success for uid:', user.uid);
    } catch (error) {
      console.error('[Profile] Firestore write failed.', {
        uid: user.uid,
        code: error?.code,
        message: error?.message
      });
      throw new Error(formatFirestoreError(error, 'Unable to save profile to Firestore.'));
    }

    updateProfile(user, {
      displayName,
      photoURL: resolveAvatarUrl(avatarUrl, user.photoURL || '') || null
    })
      .then(() => {
        console.log('[Profile] Firebase Auth profile update success for uid:', user.uid);
      })
      .catch((authError) => {
        // Do not block persisted Firestore profile on auth metadata sync issues.
        console.warn('Profile metadata update failed, Firestore save already succeeded.', authError);
      });

    try {
      const mergedProfile = await withTimeout(
        readProfile(user.uid),
        FIRESTORE_PROFILE_READ_TIMEOUT_MS,
        'Firestore profile read after write'
      );
      if (mergedProfile) {
        const normalizedProfile = normalizeProfile(mergedProfile, user.email || '', user.photoURL || '');
        setProfile(normalizedProfile);
        console.log('[Profile] Firestore read-after-write success for uid:', user.uid);
        return mergedProfile;
      }
      console.warn('[Profile] Profile read after save returned empty document.', {
        uid: user.uid
      });
    } catch (error) {
      console.error('[Profile] Firestore read after write failed.', {
        uid: user.uid,
        code: error?.code,
        message: error?.message
      });
      // Firestore write already completed, so keep optimistic profile instead of failing save.
    }

    return nextProfile;
  };

  const logoutUser = () => signOut(auth);

  const deleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(firestore, 'users', user.uid);
    try {
      await deleteDoc(userRef);
    } catch {
      // Allow auth account deletion even if profile doc deletion fails.
    }
    await deleteUser(user);
  };

  const value = {
    currentUser,
    profile,
    loading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    saveProfile,
    logoutUser,
    deleteAccount
  };

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used inside UserAuthProvider');
  }
  return context;
}
