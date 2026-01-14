
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithCredential
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
// Removed conflicting import: import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth, app } from './firebase';
import { dbService } from './dbService';
import { User } from '../types';
import { networkService } from './networkService';

export const authService = {
  subscribe(callback: (user: User | null) => void): () => void {
    if (app.name === '[MOCK]') {
        this.checkMockUser(callback);
        return () => {};
    }

    // STRICTLY using onAuthStateChanged. 
    // getRedirectResult is removed to avoid "auth/argument-error" on mobile web / hybrid environments.
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            callback(this.mapUser(firebaseUser));
        } else {
            if (!networkService.isOnline) {
                const cached = localStorage.getItem('pytholingo_last_user');
                if (cached) {
                    callback(JSON.parse(cached));
                    return;
                }
            }
            callback(null);
        }
    });
  },

  async loginWithGoogle(): Promise<void> {
    if (app.name === '[MOCK]') { this.mockLogin('Google User'); return; }

    try {
        if (Capacitor.isNativePlatform()) {
            // --- NATIVE ANDROID/IOS FLOW ---
            console.log("📱 Starting Native Google Sign-In...");
            await GoogleAuth.initialize();
            const googleUser = await GoogleAuth.signIn();
            const idToken = googleUser.authentication.idToken;
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            console.log("✅ Native Google Login Success:", userCredential.user.uid);
            await this.syncUser(userCredential.user);

        } else {
            // --- WEB FLOW ---
            console.log("💻 Starting Web Google Sign-In (Popup)...");
            
            const provider = new GoogleAuthProvider();
            provider.addScope('email');
            provider.setCustomParameters({ prompt: 'select_account' });
            
            const result = await signInWithPopup(auth, provider);
            await this.syncUser(result.user);
        }
    } catch (e: any) {
        console.error("Google Login Error:", e);
        throw new Error(e.message || "Google Sign-In failed.");
    }
  },

  async loginWithApple(): Promise<void> {
    if (app.name === '[MOCK]') { this.mockLogin('Apple User'); return; }

    try {
        const provider = new OAuthProvider('apple.com');
        const result = await signInWithPopup(auth, provider);
        await this.syncUser(result.user);
    } catch (e: any) {
        console.error("Apple Login Error:", e);
        throw new Error(e.message || "Apple Sign-In failed.");
    }
  },

  async loginWithEmail(email: string, pass: string): Promise<User> {
    if (app.name === '[MOCK]') return this.mockLogin(email);
    
    if (!networkService.isOnline) {
        throw new Error("You are offline. Please connect to internet to sign in, or continue as Guest.");
    }

    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        await this.syncUser(result.user);
        return this.mapUser(result.user);
    } catch (e: any) {
        console.error("Login Error:", e);
        let msg = "Login failed.";
        if (e.code === 'auth/invalid-credential') msg = "Incorrect email or password.";
        if (e.code === 'auth/user-not-found') msg = "No account found with this email.";
        if (e.code === 'auth/wrong-password') msg = "Incorrect password.";
        throw new Error(msg);
    }
  },

  async registerWithEmail(email: string, pass: string, birthday?: string): Promise<User> {
    if (app.name === '[MOCK]') return this.mockLogin(email);

    if (!networkService.isOnline) {
        throw new Error("Cannot create account while offline.");
    }

    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        const u = result.user;
        await dbService.saveUserProfile(u.uid, { 
            email: u.email,
            birthday,
            createdAt: new Date().toISOString(),
            displayName: u.email?.split('@')[0],
            xp: 0,
            isPublicProfile: true
        });
        return this.mapUser(u);
    } catch (e: any) {
        console.error("Registration Error:", e);
        let msg = "Registration failed.";
        if (e.code === 'auth/email-already-in-use') msg = "Email already in use. Try logging in.";
        if (e.code === 'auth/weak-password') msg = "Password is too weak.";
        throw new Error(msg);
    }
  },

  async loginAsGuest(): Promise<User> {
    if (app.name === '[MOCK]' || !networkService.isOnline) {
        return this.mockLogin('Guest (Offline)');
    }
    try {
        const result = await signInAnonymously(auth);
        return this.mapUser(result.user);
    } catch (e) {
        return this.mockLogin('Guest (Offline)');
    }
  },

  async logout(): Promise<void> {
    if (app.name === '[MOCK]') {
        try { localStorage.removeItem('pytholingo_mock_user'); window.location.reload(); } catch(e) {}
        return;
    }
    
    localStorage.removeItem('pytholingo_last_user');
    
    if (Capacitor.isNativePlatform()) {
        try {
            await GoogleAuth.signOut();
        } catch (e) { console.warn("Google Native signout error:", e); }
    }
    
    await signOut(auth);
  },

  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    if (app.name === '[MOCK]') return;
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        await this.syncUser(auth.currentUser);
    }
  },

  async syncUser(u: any) {
    const userMap = this.mapUser(u);
    localStorage.setItem('pytholingo_last_user', JSON.stringify(userMap));
    try {
        await dbService.saveUserProfile(u.uid, {
            email: u.email,
            displayName: u.displayName || u.email?.split('@')[0],
            photoURL: u.photoURL,
            lastLogin: new Date().toISOString()
        });
    } catch (e) {
        console.warn("User profile sync failed (likely offline).");
    }
  },

  mapUser(u: any): User {
      return {
          id: u.uid,
          email: u.email || 'Guest User',
          displayName: u.displayName || undefined,
          photoURL: u.photoURL || undefined,
          isAnonymous: u.isAnonymous
      };
  },

  checkMockUser(callback: any) {
      try {
          const stored = localStorage.getItem('pytholingo_mock_user');
          if (stored) callback(JSON.parse(stored));
          else callback(null);
      } catch (e) { callback(null); }
  },

  mockLogin(name: string): User {
      const isGuest = name.includes('Guest');
      const user: User = { 
          id: isGuest ? 'offline-guest' : 'mock-user-123', 
          email: name, 
          displayName: name.split('@')[0],
          isAnonymous: isGuest
      };
      try {
          localStorage.setItem('pytholingo_mock_user', JSON.stringify(user));
          localStorage.setItem('pytholingo_last_user', JSON.stringify(user));
      } catch(e) {}
      return user;
  }
};
