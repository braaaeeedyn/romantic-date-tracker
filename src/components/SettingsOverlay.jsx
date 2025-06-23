import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { setSetting, clearAllData } from '../lib/db';
import { isSetup } from '../App';
import { route } from 'preact-router';
import { themes } from '../lib/themes';

export function SettingsOverlay({ isOpen, onClose, initialName = '', initialPartnerName = '', onNamesUpdated, currentTheme = 'lilac' }) {
  const [name, setName] = useState(initialName);
  const [partnerName, setPartnerName] = useState(initialPartnerName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setPartnerName(initialPartnerName);
    }
  }, [isOpen, initialName, initialPartnerName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPartner = partnerName.trim();
    
    if (!trimmedName || !trimmedPartner) {
      setError('Both names are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update the database
      await Promise.all([
        setSetting('userName', trimmedName),
        setSetting('partnerName', trimmedPartner)
      ]);
      
      // Update the parent component's state
      if (onNamesUpdated) {
        onNamesUpdated(trimmedName, trimmedPartner);
      }
      
      // Close the overlay
      onClose();
      
      // Force a full page refresh to ensure all components are in sync
      window.location.reload();
    } catch (err) {
      console.error('Failed to save settings', err);
      setError('Failed to save settings. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleClearStorage = async () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setIsClearing(true);
      try {
        await clearAllData();
        isSetup.value = false;
        onClose();
        route('/');
      } catch (error) {
        console.error('Failed to clear storage', error);
        alert('Failed to clear storage. Please try again.');
      } finally {
        setIsClearing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-romantic-pink/10 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-romantic-pink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Edit Profile
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-romantic-pink focus:ring-romantic-pink sm:text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700">
                        Partner's Name
                      </label>
                      <input
                        type="text"
                        id="partnerName"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-romantic-pink focus:ring-romantic-pink sm:text-sm"
                        placeholder="Partner's name"
                      />
                    </div>
                    {error && (
                      <div className="mb-4 text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-6">
                      <button
                        type="button"
                        onClick={handleClearStorage}
                        disabled={isClearing}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {isClearing ? 'Clearing...' : 'Clear All Data'}
                      </button>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-romantic-dark/80 bg-white border border-romantic-dark/20 rounded-md shadow-sm hover:bg-romantic-light/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-romantic-primary/50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themes.find(t => t.id === currentTheme)?.bg.replace('bg-', '')} disabled:opacity-50 transition-colors ${themes.find(t => t.id === currentTheme)?.bg} hover:opacity-90`}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
