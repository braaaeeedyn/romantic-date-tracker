import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'wouter-preact';
import { db, setSetting, getSetting } from '../lib/db';
import { isSetup } from '../App';
import { FloatingHearts } from './FloatingHearts';

export function Setup({ onSetupComplete }) {
  const [_, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    yourName: '',
    partnerName: '',
    theme: 'peach',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.yourName.trim();
    const trimmedPartner = formData.partnerName.trim();
    
    if (!trimmedName || !trimmedPartner) {
      setError('Please enter both names');
      return;
    }
    
    console.log('Submitting form with:', { trimmedName, trimmedPartner });
    setIsSubmitting(true);
    setError('');
    
    try {
      // Save settings to IndexedDB
      console.log('Saving settings to database...');
      await setSetting('userName', trimmedName);
      await setSetting('partnerName', trimmedPartner);
      await setSetting('theme', formData.theme);
      
      console.log('Settings saved, verifying...');
      // Verify the settings were saved
      const settings = await db.settings.toArray();
      const savedName = settings.find(s => s.key === 'userName')?.value;
      const savedPartner = settings.find(s => s.key === 'partnerName')?.value;
      
      console.log('Verified saved settings:', { savedName, savedPartner });
      
      if (savedName === trimmedName && savedPartner === trimmedPartner) {
        console.log('Setup complete, notifying parent...');
        if (onSetupComplete) {
          await onSetupComplete();
        }
        // Update the global state
        isSetup.value = true;
        // Redirect to dashboard
        setLocation('/');
      } else {
        throw new Error('Failed to verify saved settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError(`Failed to save settings: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeOptions = [
    { id: 'lilac', name: 'Lilac', bg: 'bg-romantic-lilac' },
    { id: 'mauve', name: 'Mauve', bg: 'bg-romantic-mauve' },
    { id: 'rose', name: 'Rose', bg: 'bg-romantic-rose' },
    { id: 'peach', name: 'Peach', bg: 'bg-romantic-peach' },
    { id: 'passion', name: 'Passion', bg: 'bg-romantic-lavender' },
    { id: 'coral', name: 'Coral', bg: 'bg-romantic-coral' },
    { id: 'sky', name: 'Sky', bg: 'bg-romantic-sky' },
    { id: 'mint', name: 'Mint', bg: 'bg-romantic-mint' }
  ];
  
  // Apply selected theme to the root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', formData.theme);
  }, [formData.theme]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-b from-rose-50 to-pink-50">
      <FloatingHearts />
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-primary/20 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-primary">
        Welcome to Romantic Dates
      </h2>
      
      <p className="text-center mb-6 text-romantic-dark/80">
        Let's get started by telling us a bit about you and your partner.
      </p>
      
      <div className="mb-6">
        <p className="text-sm font-medium text-romantic-dark/80 mb-3 text-center">Choose a theme</p>
        <div className="space-y-3">
          {/* First row of themes */}
          <div className="flex gap-3 justify-center">
            {themeOptions.slice(0, 4).map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                className={`w-10 h-10 rounded-full ${theme.bg} transition-all ${
                  formData.theme === theme.id 
                    ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                    : 'opacity-80 hover:opacity-100 hover:scale-110'
                }`}
                title={theme.name}
                aria-label={`Select ${theme.name} theme`}
              />
            ))}
          </div>
          {/* Second row of themes */}
          <div className="flex gap-3 justify-center">
            {themeOptions.slice(4).map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                className={`w-10 h-10 rounded-full ${theme.bg} transition-all ${
                  formData.theme === theme.id 
                    ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                    : 'opacity-80 hover:opacity-100 hover:scale-110'
                }`}
                title={theme.name}
                aria-label={`Select ${theme.name} theme`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="yourName" className="block text-sm font-medium text-romantic-dark/80 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="yourName"
            name="yourName"
            value={formData.yourName}
            onChange={handleInputChange}
            className="input"
            placeholder="Your name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="partnerName" className="block text-sm font-medium text-romantic-dark/80 mb-1">
            Partner's Name
          </label>
          <input
            type="text"
            id="partnerName"
            name="partnerName"
            value={formData.partnerName}
            onChange={handleInputChange}
            className="input"
            placeholder="Partner's name"
            required
          />
        </div>
        

        
        <button
          type="submit"
          disabled={isSubmitting || !formData.yourName.trim() || !formData.partnerName.trim()}
          className={`btn btn-primary w-full mt-8 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Get Started'}
        </button>
      </form>
      </div>
    </div>
  );
}
