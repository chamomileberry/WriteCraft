import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Initialize from localStorage immediately to prevent flash
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Use a ref for hasUserToggled so it survives re-renders but resets on user change
  const hasUserToggledRef = useRef(false);
  // Track the current user ID to detect user changes
  const currentUserIdRef = useRef(user?.id);

  // Apply theme to DOM immediately
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    // Also update localStorage to keep it in sync with state
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Cross-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newIsDark = e.newValue === 'dark';
        if (newIsDark !== isDark) {
          setIsDark(newIsDark);
          // Mark as user toggle since another tab changed it
          hasUserToggledRef.current = true;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDark]);

  // Load theme from user preferences (run when user changes)
  useEffect(() => {
    let isMounted = true;

    // Reset hasUserToggled flag when user changes (login/logout/switch)
    if (currentUserIdRef.current !== user?.id) {
      hasUserToggledRef.current = false;
      currentUserIdRef.current = user?.id;
    }

    const loadTheme = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user-preferences', { credentials: 'include' });
        if (res.ok && isMounted && !hasUserToggledRef.current) {
          const preferences = await res.json();
          if (preferences.theme) {
            const themeIsDark = preferences.theme === 'dark';
            // Only update if the fetched preference differs from current state
            // This prevents unnecessary state churn
            if (themeIsDark !== isDark) {
              setIsDark(themeIsDark);
              localStorage.setItem('theme', preferences.theme);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user preferences:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, [user]); // Only run when user changes

  const toggleTheme = async () => {
    const newTheme = !isDark;
    const themeValue: Theme = newTheme ? 'dark' : 'light';

    // Mark that user has manually toggled (using ref so it persists across re-renders)
    hasUserToggledRef.current = true;

    // Update state and localStorage immediately for responsiveness
    setIsDark(newTheme);
    localStorage.setItem('theme', themeValue);

    // Save to user preferences if logged in (fire and forget)
    if (user) {
      try {
        await fetch('/api/user-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ theme: themeValue }),
        });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
        // Don't revert the local change if the server save fails
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
