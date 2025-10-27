import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const [hasUserToggled, setHasUserToggled] = useState(false);

  // Apply theme to DOM immediately
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Load theme from user preferences (only once on mount)
  useEffect(() => {
    let isMounted = true;

    const loadTheme = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user-preferences', { credentials: 'include' });
        if (res.ok && isMounted && !hasUserToggled) {
          const preferences = await res.json();
          if (preferences.theme) {
            const themeIsDark = preferences.theme === 'dark';
            setIsDark(themeIsDark);
            localStorage.setItem('theme', preferences.theme);
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
  }, [user]); // Only run when user changes, not when hasUserToggled changes

  const toggleTheme = async () => {
    const newTheme = !isDark;
    const themeValue: Theme = newTheme ? 'dark' : 'light';

    // Mark that user has manually toggled
    setHasUserToggled(true);

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
