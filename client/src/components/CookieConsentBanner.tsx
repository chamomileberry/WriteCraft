import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = 'writecraft_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'writecraft_cookie_preferences';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
          console.error('Failed to parse cookie preferences:', e);
        }
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply preferences (e.g., disable analytics if opted out)
    if (!prefs.analytics) {
      // Disable PostHog if analytics is disabled
      if (window.posthog) {
        window.posthog.opt_out_capturing();
      }
    }
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      functional: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      functional: false,
    });
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pointer-events-none"
        data-testid="cookie-consent-banner"
      >
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <Card className="p-4 sm:p-6 shadow-lg border-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Cookie className="h-6 w-6 flex-shrink-0 text-primary" />
              
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-base">We use cookies</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide essential functionality. 
                  You can customize your preferences or accept all cookies.{' '}
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    Learn more
                  </Link>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomize}
                  data-testid="button-customize-cookies"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptNecessary}
                  data-testid="button-necessary-only"
                >
                  Necessary Only
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  data-testid="button-accept-all-cookies"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-cookie-settings">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Some cookies are necessary for the site to function properly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="necessary" className="font-semibold text-base">
                    Necessary Cookies
                  </Label>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Essential for the website to function. These cookies enable core functionality like security, authentication, and session management.
                </p>
              </div>
              <Switch
                id="necessary"
                checked={true}
                disabled
                data-testid="switch-necessary-cookies"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="analytics" className="font-semibold text-base">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand how you use WriteCraft so we can improve the product. We use PostHog for privacy-focused analytics.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
                data-testid="switch-analytics-cookies"
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="functional" className="font-semibold text-base">
                  Functional Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Remember your preferences and settings to provide a personalized experience (theme, language, UI customizations).
                </p>
              </div>
              <Switch
                id="functional"
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, functional: checked })
                }
                data-testid="switch-functional-cookies"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPreferences({
                  necessary: true,
                  analytics: false,
                  functional: false,
                });
                saveCustomPreferences();
              }}
              data-testid="button-reject-optional"
            >
              Reject Optional
            </Button>
            <Button onClick={saveCustomPreferences} data-testid="button-save-preferences">
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
