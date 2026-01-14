import { ref, set, onValue, update, push, child, get, onDisconnect, serverTimestamp } from 'firebase/database';
import { rtdb } from './firebase';
import { PairSession, SessionUser } from '../types';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Mock Channel for Offline/Local Sync (Cross-Tab)
const mockChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pyssss_mock_rtdb') : null;

// Helper to get/set mock data
const getMockSession = (id: string): PairSession | null => {
    try {
        const data = localStorage.getItem(`pyssss_mock_${id}`);
        return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
};

const saveMockSession = (id: string, data: PairSession) => {
    localStorage.setItem(`pyssss_mock_${id}`, JSON.stringify(data));
    if (mockChannel) mockChannel.postMessage({ sessionId: id, data });
};

export const presenceService = {
  // --- GLOBAL PRESENCE (ONLINE/OFFLINE) ---
  trackUserPresence(userId: string) {
    // CRITICAL FIX: Do not track presence for offline guests or mock apps
    if (userId === 'offline-guest' || rtdb.app.name === '[MOCK]') return;

    const userStatusDatabaseRef = ref(rtdb, '/status/' + userId);
    const isOfflineForDatabase = {
        state: 'offline',
        last_changed: serverTimestamp(),
    };
    const isOnlineForDatabase = {
        state: 'online',
        last_changed: serverTimestamp(),
    };

    const connectedRef = ref(rtdb, '.info/connected');
    onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === false) {
            return;
        }
        
        // Wrap in catch to prevent app crash if rules deny access
        onDisconnect(userStatusDatabaseRef)
            .set(isOfflineForDatabase)
            .then(() => {
                set(userStatusDatabaseRef, isOnlineForDatabase).catch(err => {
                    // This often happens if auth token is stale or user is not actually authed
                    console.warn("Presence write failed (silenced):", err.message);
                });
            })
            .catch(err => {
                console.warn("onDisconnect failed (silenced):", err.message);
            });
    });
  },

  // Check if a specific user is online
  subscribeToUserStatus(targetUserId: string, callback: (isOnline: boolean) => void) {
      if (rtdb.app.name === '[MOCK]') {
          callback(false); // Assume offline in mock for now
          return () => {};
      }

      const statusRef = ref(rtdb, '/status/' + targetUserId);
      const unsubscribe = onValue(statusRef, (snapshot) => {
          const data = snapshot.val();
          callback(data && data.state === 'online');
      }, (error) => {
          console.warn("Failed to subscribe to user status:", error.message);
          callback(false);
      });
      return unsubscribe;
  },

  // --- PAIR PROGRAMMING SESSION LOGIC ---
  async createSession(hostUser: { id: string; name: string }): Promise<string> {
    if (hostUser.id === 'offline-guest' || rtdb.app.name === '[MOCK]') {
        const sessionId = Math.random().toString(36).substring(2, 9);
        const initialSession: PairSession = {
            id: sessionId,
            code: "# Offline Mock Session\n# (Data synced across tabs)\n\nprint('Hello Pair!')",
            output: "",
            users: {},
            createdAt: Date.now(),
            isRunning: false
        };
        saveMockSession(sessionId, initialSession);
        return sessionId;
    }

    const sessionId = Math.random().toString(36).substring(2, 9);
    const sessionRef = ref(rtdb, `sessions/${sessionId}`);
    
    const initialSession: PairSession = {
      id: sessionId,
      code: "# Welcome to Pair Programming!\n# Start coding together below.\n\nprint('Hello Pair!')",
      output: "",
      users: {},
      createdAt: Date.now()
    };

    await set(sessionRef, initialSession);
    return sessionId;
  },

  // Join a session and handle presence
  joinSession(sessionId: string, user: { id: string; name: string }, onUpdate: (session: PairSession) => void) {
    if (user.id === 'offline-guest' || rtdb.app.name === '[MOCK]') {
        // --- MOCK IMPLEMENTATION ---
        let currentSession = getMockSession(sessionId);
        
        // If missing, create fallback
        if (!currentSession) {
            currentSession = {
                id: sessionId,
                code: "",
                output: "",
                users: {},
                createdAt: Date.now()
            };
        }

        // Add Self
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        currentSession.users[user.id] = {
            id: user.id,
            name: user.name,
            color,
            cursorX: 0,
            cursorY: 0,
            lastActive: Date.now()
        };
        saveMockSession(sessionId, currentSession);
        
        // Initial Callback
        onUpdate(currentSession);

        // Listen for updates from other tabs
        const handler = (event: MessageEvent) => {
             if (event.data && event.data.sessionId === sessionId) {
                 onUpdate(event.data.data);
             }
        };
        
        if (mockChannel) mockChannel.addEventListener('message', handler);

        return () => {
             if (mockChannel) mockChannel.removeEventListener('message', handler);
             // Remove self from mock session on exit (optional for mock)
        };
    }

    // --- REAL FIREBASE IMPLEMENTATION ---
    const sessionRef = ref(rtdb, `sessions/${sessionId}`);
    const userRef = child(sessionRef, `users/${user.id}`);

    // Assign a random color
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Set initial user state
    update(userRef, {
      id: user.id,
      name: user.name,
      color,
      cursorX: 0,
      cursorY: 0,
      lastActive: Date.now()
    }).catch(e => console.error("Session join update failed", e));

    // Remove user on disconnect
    onDisconnect(userRef).remove().catch(e => console.warn(e));

    // Listen for session updates
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onUpdate(data);
      }
    });

    return () => unsubscribe();
  },

  // Update code content
  updateCode(sessionId: string, code: string) {
    if (rtdb.app.name === '[MOCK]') {
        const session = getMockSession(sessionId);
        if (session) {
            session.code = code;
            saveMockSession(sessionId, session);
        }
        return;
    }
    const codeRef = ref(rtdb, `sessions/${sessionId}`);
    update(codeRef, { code });
  },

  // Update code output
  updateOutput(sessionId: string, output: string, isRunning: boolean) {
    if (rtdb.app.name === '[MOCK]') {
        const session = getMockSession(sessionId);
        if (session) {
            session.output = output;
            session.isRunning = isRunning;
            saveMockSession(sessionId, session);
        }
        return;
    }
    const sessionRef = ref(rtdb, `sessions/${sessionId}`);
    update(sessionRef, { output, isRunning });
  },

  // Update cursor position (throttled by caller typically, but valid here)
  updateCursor(sessionId: string, userId: string, x: number, y: number) {
    if (rtdb.app.name === '[MOCK]') {
        const session = getMockSession(sessionId);
        if (session && session.users[userId]) {
            session.users[userId].cursorX = x;
            session.users[userId].cursorY = y;
            session.users[userId].lastActive = Date.now();
            saveMockSession(sessionId, session);
        }
        return;
    }
    const userRef = ref(rtdb, `sessions/${sessionId}/users/${userId}`);
    update(userRef, {
      cursorX: x,
      cursorY: y,
      lastActive: Date.now()
    }).catch(() => {}); // Ignore cursor update errors silently
  }
};