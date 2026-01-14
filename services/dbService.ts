
import { doc, getDoc, setDoc, Firestore, collection, query, orderBy, limit, getDocs, addDoc, where, onSnapshot, updateDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db, app } from './firebase';
import { UserProgress, LeaderboardEntry, Challenge } from '../types';
import { networkService } from './networkService';

// Fallback bots if offline or empty DB
const BOTS: LeaderboardEntry[] = [
    { userId: 'bot1', displayName: 'GuidoV', xp: 5000, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guido', isPublicProfile: true },
    { userId: 'bot2', displayName: 'AdaLove', xp: 4200, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ada', isPublicProfile: true },
    { userId: 'bot3', displayName: 'PyMaster', xp: 3500, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Py', isPublicProfile: true },
    { userId: 'bot4', displayName: 'SnakeCharmer', xp: 1200, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Snake', isPublicProfile: true },
    { userId: 'bot5', displayName: 'NewbieCoder', xp: 150, photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=New', isPublicProfile: true }
];

const isRealDb = (): boolean => {
    return app.name !== '[MOCK]';
};

// --- OFFLINE STORE HELPERS ---
const getLocalProgress = (userId: string): UserProgress | null => {
    try {
        const data = localStorage.getItem(`offline_progress_${userId}`);
        return data ? JSON.parse(data) : null;
    } catch { return null; }
};

const setLocalProgress = (userId: string, data: UserProgress) => {
    try {
        localStorage.setItem(`offline_progress_${userId}`, JSON.stringify(data));
        localStorage.setItem(`offline_needs_sync_${userId}`, 'true'); // Mark dirty
    } catch (e) { console.error("Local save failed", e); }
};

export const dbService = {
    // --- SYNC ENGINE ---
    // Called by App.tsx when network comes online
    async syncProgress(userId: string) {
        if (userId === 'offline-guest' || !isRealDb()) return;
        
        const needsSync = localStorage.getItem(`offline_needs_sync_${userId}`);
        if (needsSync === 'true') {
            console.log("🔄 Syncing offline progress to cloud...");
            const local = getLocalProgress(userId);
            if (local) {
                try {
                    // Pull cloud first to merge
                    const cloud = await this.loadCloudProgress(userId);
                    
                    // Simple Merge Strategy: Take max XP and combine completed lessons
                    const merged = { ...local };
                    if (cloud) {
                        merged.xp = Math.max(local.xp, cloud.xp);
                        merged.streak = Math.max(local.streak, cloud.streak);
                        // Merge arrays unique
                        merged.completedLessons = [...new Set([...local.completedLessons, ...cloud.completedLessons])];
                        merged.redeemedSecrets = [...new Set([...(local.redeemedSecrets || []), ...(cloud.redeemedSecrets || [])])];
                    }

                    // Save merged back to cloud
                    const userRef = doc(db, 'users', userId);
                    await setDoc(userRef, merged, { merge: true });
                    
                    // Clear dirty flag
                    localStorage.removeItem(`offline_needs_sync_${userId}`);
                    console.log("✅ Sync complete.");
                    return merged;
                } catch (e) {
                    console.error("Sync failed:", e);
                }
            }
        }
    },

    async saveUserProfile(userId: string, data: any): Promise<void> {
        if (!isRealDb() || !networkService.isOnline) return; // Skip profile updates if offline (not critical)
        try {
            const cleanData = JSON.parse(JSON.stringify(data));
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, cleanData, { merge: true });
        } catch (error) { console.error(error); }
    },

    async saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
        // ALWAYS save to local storage first (Single Source of Truth for UI)
        setLocalProgress(userId, progress);

        // If Offline or Guest, stop here
        if (!isRealDb() || !networkService.isOnline || userId === 'offline-guest') {
            return;
        }

        try {
            const userRef = doc(db, 'users', userId);
            // We save the critical progression stats
            await setDoc(userRef, { 
                xp: progress.xp,
                streak: progress.streak,
                completedLessons: progress.completedLessons,
                redeemedSecrets: progress.redeemedSecrets,
                hiddenUnitUnlocked: progress.hiddenUnitUnlocked,
                mentorModeUnlocked: progress.mentorModeUnlocked,
                openedChests: progress.openedChests,
                hearts: progress.hearts
            }, { merge: true });
            
            // If write succeeds, clear dirty flag
            localStorage.removeItem(`offline_needs_sync_${userId}`);
        } catch (error) { 
            console.warn("Cloud save failed, data is safe locally."); 
        }
    },

    // Internal helper for explicit cloud fetch
    async loadCloudProgress(userId: string): Promise<UserProgress | null> {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() as UserProgress : null;
    },

    async loadUserProgress(userId: string): Promise<UserProgress | null> {
        // 1. Try Local First (Fastest + Offline support)
        const local = getLocalProgress(userId);
        
        // 2. If online and not guest, try to fetch cloud to ensure we aren't stale
        // (e.g. played on another device)
        if (isRealDb() && networkService.isOnline && userId !== 'offline-guest') {
            try {
                const cloud = await this.loadCloudProgress(userId);
                if (cloud) {
                    // If we have local data, we might need a sync logic here too
                    // But usually App.tsx calls syncProgress on mount.
                    // Here we just return cloud if it's "better" (more XP), else keep local
                    if (!local || cloud.xp > local.xp) {
                        setLocalProgress(userId, cloud); // Update local cache
                        return cloud;
                    }
                }
            } catch (e) {
                console.warn("Could not load from cloud, using local.");
            }
        }
        
        return local;
    },

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        // If Offline, return bots immediately
        if (!isRealDb() || !networkService.isOnline) {
            return BOTS;
        }

        let realUsers: LeaderboardEntry[] = [];
        try {
            const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                const data = doc.data() as any;
                if (data.isPublicProfile === false) return; 
                if (data.email || data.displayName) { 
                    realUsers.push({
                        userId: doc.id,
                        displayName: data.displayName || (data.email ? data.email.split('@')[0] : 'User'),
                        photoURL: data.photoURL,
                        xp: data.xp || 0,
                        isPublicProfile: data.isPublicProfile !== false
                    });
                }
            });
        } catch (e) {
            console.warn("Leaderboard fetch failed:", e);
            return BOTS; // Fallback to bots on error
        }
        
        if (realUsers.length < 5) {
            const combined = [...realUsers, ...BOTS];
            combined.sort((a, b) => b.xp - a.xp);
            return combined.slice(0, 50);
        }
        return realUsers.slice(0, 50);
    },

    async sendChallenge(challengerId: string, challengerEmail: string, targetEmail: string): Promise<{success: boolean, message: string}> {
        if (!isRealDb() || !networkService.isOnline) return { success: false, message: "Offline mode. Connect to send challenges." };

        try {
            const q = query(collection(db, 'users'), where('email', '==', targetEmail));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return { success: false, message: "User not found." };

            await addDoc(collection(db, 'challenges'), {
                challengerId,
                challengerEmail,
                targetEmail,
                status: 'pending',
                createdAt: Date.now()
            });
            return { success: true, message: "Challenge sent!" };
        } catch (e) {
            return { success: false, message: "Failed to send challenge." };
        }
    },

    subscribeToChallenges(userEmail: string, userId: string, callback: (challenges: Challenge[]) => void) {
        if (!isRealDb() || !networkService.isOnline) return () => {};
        
        if (!userEmail || userEmail === 'Guest User' || !userEmail.includes('@')) {
            return () => {};
        }

        const q = query(collection(db, 'challenges'), where('targetEmail', '==', userEmail));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const list: Challenge[] = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Challenge));
            list.sort((a,b) => b.createdAt - a.createdAt);
            callback(list);
        }, () => callback([]));
    },

    subscribeToSentChallenges(userId: string, callback: (challenges: Challenge[]) => void) {
        if (!isRealDb() || !networkService.isOnline) return () => {};
        const q = query(collection(db, 'challenges'), where('challengerId', '==', userId));
        return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
             const list: Challenge[] = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Challenge));
            callback(list);
        }, () => callback([]));
    },

    async updateChallengeStatus(challengeId: string, status: 'accepted' | 'declined'): Promise<void> {
        if (!isRealDb() || !networkService.isOnline) return;
        try {
            const ref = doc(db, 'challenges', challengeId);
            const updates: any = { status };
            if (status === 'accepted') updates.sessionId = Math.random().toString(36).substring(2, 9);
            await updateDoc(ref, updates);
        } catch (e) {
            console.warn("Update challenge status failed:", e);
        }
    }
};
