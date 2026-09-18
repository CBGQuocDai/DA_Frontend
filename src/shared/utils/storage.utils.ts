/**
 * Store item to localStorage (client-side only)
 */
export const storage = {
  set<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving to localStorage:`, error);
      }
    }
  },

  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue ?? null;
      } catch (error) {
        console.error(`Error reading from localStorage:`, error);
        return defaultValue ?? null;
      }
    }
    return defaultValue ?? null;
  },

  remove(key: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing from localStorage:`, error);
      }
    }
  },

  clear(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
      } catch (error) {
        console.error(`Error clearing localStorage:`, error);
      }
    }
  },
};

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
