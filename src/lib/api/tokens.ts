/**
 * Client-held bearer token store.
 *
 * Mirrors the mobile reference (`lib/core/data/storage/token_store.dart`) but
 * for the browser: the access token is kept in memory for fast synchronous
 * reads, with both tokens mirrored to `localStorage` so a session survives a
 * page reload. The browser has no Keychain/Keystore equivalent — this is the
 * agreed client-held model; treat XSS hygiene as a hard requirement.
 */

const ACCESS_KEY = "ventura.accessToken";
const REFRESH_KEY = "ventura.refreshToken";

let accessCache: string | null = null;
let refreshCache: string | null = null;
let hydrated = false;

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  accessCache = window.localStorage.getItem(ACCESS_KEY);
  refreshCache = window.localStorage.getItem(REFRESH_KEY);
  hydrated = true;
}

export const tokenStore = {
  getAccess(): string | null {
    hydrate();
    return accessCache;
  },

  getRefresh(): string | null {
    hydrate();
    return refreshCache;
  },

  hasTokens(): boolean {
    hydrate();
    return Boolean(accessCache && refreshCache);
  },

  save(accessToken: string, refreshToken: string): void {
    accessCache = accessToken;
    refreshCache = refreshToken;
    hydrated = true;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_KEY, accessToken);
      window.localStorage.setItem(REFRESH_KEY, refreshToken);
    }
  },

  clear(): void {
    accessCache = null;
    refreshCache = null;
    hydrated = true;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
    }
  },
};
