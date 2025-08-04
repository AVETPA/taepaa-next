// utils/authSync.ts

type AuthEvent = 'login' | 'logout';

const authChannel = typeof window !== 'undefined'
  ? new BroadcastChannel('auth-sync')
  : null;

/**
 * Broadcasts an auth change to other tabs (login/logout)
 */
export const notifyAuthChange = (event: AuthEvent) => {
  if (authChannel) {
    authChannel.postMessage(event);
  }
};

/**
 * Listens for auth changes from other tabs
 */
export const listenForAuthChange = (callback: (event: AuthEvent) => void) => {
  if (authChannel) {
    authChannel.onmessage = (e: MessageEvent) => {
      const event = e.data;
      if (event === 'login' || event === 'logout') {
        callback(event);
      }
    };
  }
};
