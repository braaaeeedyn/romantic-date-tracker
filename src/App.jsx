import { signal, effect } from "@preact/signals";
import { useEffect, useState } from "preact/hooks";
import { Route, Router } from "wouter-preact";
import { Setup } from "./components/Setup";
import { Dashboard } from "./components/Dashboard";
import { AddDate } from "./components/AddDate";
import { ViewDate } from "./components/ViewDate";
import { SettingsOverlay } from "./components/SettingsOverlay";
import { db, getSetting, setSetting } from "./lib/db";
import { themes, DEFAULT_THEME } from "./lib/themes";
import { Logo } from "./components/Logo";
import { FloatingHearts } from "./components/FloatingHearts";

// Initialize database
async function initDB() {
  try {
    if (!db.isOpen()) {
      console.log('Opening database...');
      await db.open();
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

export const isSetup = signal(false);

const currentThemes = [
  { id: 'pink', name: 'Pink', bg: 'bg-romantic-pink' },
  { id: 'mauve', name: 'Mauve', bg: 'bg-romantic-mauve' },
  { id: 'rose', name: 'Rose', bg: 'bg-romantic-rose' },
];

export function App() {
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [partnerName, setPartnerName] = useState('');

  const loadSettings = async () => {
    try {
      console.log('Loading settings from database...');
      
      // Initialize database if not already open
      const dbInitialized = await initDB();
      if (!dbInitialized) {
        throw new Error('Failed to initialize database');
      }
      
      // Get all settings at once
      const settings = await db.settings.toArray();
      console.log('All settings from DB:', settings);
      
      const nameSetting = settings.find(s => s.key === 'userName');
      const partnerSetting = settings.find(s => s.key === 'partnerName');
      const themeSetting = settings.find(s => s.key === 'theme');
      
      const name = nameSetting?.value;
      const pName = partnerSetting?.value;
      const theme = themeSetting?.value;
      
      console.log('Extracted settings:', { name, pName, theme });
      
      if (name) {
        console.log('Setting user name:', name);
        setUserName(name);
      }
      if (pName) {
        console.log('Setting partner name:', pName);
        setPartnerName(pName);
      }
      
      const setupComplete = !!(name && pName);
      console.log('Setup complete:', setupComplete);
      isSetup.value = setupComplete;
      
      if (theme) {
        console.log('Setting theme:', theme);
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Try to recover by reinitializing the database
      try {
        console.log('Attempting to reinitialize database...');
        await initDB();
      } catch (e) {
        console.error('Failed to reinitialize database:', e);
      }
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply theme to root element when it changes
  useEffect(() => {
    console.log('Current theme changed:', currentTheme);
    const theme = themes.find(t => t.id === currentTheme) || themes[0];
    document.documentElement.setAttribute('data-theme', theme.id);
    
    // Update theme color meta tag for mobile browsers
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-romantic-primary').trim();
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [currentTheme]);
  
  // Debug effect to log name changes
  useEffect(() => {
    console.log('User name changed:', userName);
    console.log('Partner name changed:', partnerName);
  }, [userName, partnerName]);

  const handleThemeChange = async (themeId) => {
    setCurrentTheme(themeId);
    await setSetting('theme', themeId);
  };

  const currentThemeColor = themes.find(t => t.id === currentTheme)?.bg || 'bg-romantic-pink';

  return (
    <div className="min-h-screen flex flex-col">
      {isSetup.value && (
        <header className={`${currentThemeColor}/50 backdrop-blur-sm py-4 px-6 shadow-sm sticky top-0 z-10`}>
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold text-romantic-dark cursor-pointer">
                Romantic Dates
              </h1>
            </a>
            <nav className="flex items-center gap-4">
              <div className="relative group">
                <button 
                  className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-romantic-dark/20 hover:border-romantic-dark/40 transition-colors"
                  aria-label="Change theme"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    const dropdown = document.querySelector('.theme-dropdown');
                    dropdown?.classList.toggle('hidden');
                    document.getElementById('dropdown-backdrop')?.classList.toggle('hidden', !dropdown?.classList.contains('hidden'));
                  }}
                >
                  <div className={`w-5 h-5 rounded-full ${themes.find(t => t.id === currentTheme)?.bg} flex items-center justify-center text-white`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                </button>
                <div className="theme-dropdown hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-romantic-dark/10">
                  <div className="px-3 py-2 text-sm font-medium text-romantic-dark/70 border-b border-romantic-dark/10">
                    Choose a theme
                  </div>
                  <div className="p-2 grid grid-cols-4 gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeChange(theme.id);
                          document.querySelector('.theme-dropdown')?.classList.add('hidden');
                        }}
                        className={`flex flex-col items-center p-2 rounded-md transition-colors ${currentTheme === theme.id ? 'bg-romantic-light' : 'hover:bg-romantic-light/50'}`}
                        title={theme.name}
                        aria-label={`Change to ${theme.name} theme`}
                      >
                        <div className={`w-6 h-6 rounded-full ${theme.bg} mb-1 border-2 ${currentTheme === theme.id ? 'border-romantic-dark/50' : 'border-transparent'} flex items-center justify-center`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                        <span className="text-xs text-romantic-dark/80">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Click outside to close dropdown */}
              <div 
                className="fixed inset-0 z-40 hidden" 
                id="dropdown-backdrop"
                onClick={(e) => {
                  document.querySelector('.theme-dropdown')?.classList.add('hidden');
                  e.target.classList.add('hidden');
                }}
              />
              <button 
                onClick={() => setShowSettings(true)}
                className="text-romantic-dark/70 hover:text-romantic-dark p-1"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 p-4 max-w-6xl w-full mx-auto">
        <Router>
          <Route path="/">
            {isSetup.value ? (
              <Dashboard 
                userName={userName} 
                partnerName={partnerName} 
                onNamesUpdated={(newUserName, newPartnerName) => {
                  setUserName(newUserName);
                  setPartnerName(newPartnerName);
                }}
              />
            ) : (
              <>
                <FloatingHearts />
                <Setup onSetupComplete={() => loadSettings()} />
              </>
            )}
          </Route>
          <Route path="/add">
            {() => <AddDate currentTheme={currentTheme} />}
          </Route>
          <Route path="/date/:id" component={ViewDate} />
        </Router>
      </main>

      <footer className="py-4 text-center text-sm text-romantic-dark/60">
        Made with ❤️ for couples everywhere
      </footer>

      <SettingsOverlay 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        initialName={userName}
        initialPartnerName={partnerName}
        onNamesUpdated={(newUserName, newPartnerName) => {
          setUserName(newUserName);
          setPartnerName(newPartnerName);
        }}
        currentTheme={currentTheme}
      />
    </div>
  );
}
