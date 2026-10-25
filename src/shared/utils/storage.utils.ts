/**
 * Store simple string to localStorage
 */
export const storageString = {
  set(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },

  get(key: string): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },

  remove(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

/**
 * Store JSON-serializable values to localStorage
 */
export const storageJson = {
  set<T>(key: string, value: T): void {
    storageString.set(key, JSON.stringify(value));
  },

  get<T>(key: string): T | null {
    const raw = storageString.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    storageString.remove(key);
  },
};
