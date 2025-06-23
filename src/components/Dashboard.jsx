import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'wouter-preact';
import { format } from 'date-fns';
import { db } from '../lib/db';

const romanticMessages = [
  (u, p) => `Every love story is beautiful, but yours is my favorite.`,
  (u, p) => `Together is a wonderful place to be.`,
  (u, p) => `In a sea of people, my eyes will always search for you.`,
  (u, p) => `You two are proof that true love exists.`,
  (u, p) => `A perfect match made in heaven.`,
  (u, p) => `Your love story is my favorite.`,
  (u, p) => `Two hearts, one beautiful journey.`,
  (u, p) => `The best things in life are better with you two.`,
  (u, p) => `Your love is the kind that fairy tales are made of.`,
  (u, p) => `Cheers to your beautiful love story.`,
  (u, p) => `Love is composed of a single soul inhabiting two bodies. - Aristotle`,
  (u, p) => `You two are the definition of relationship goals.`,
  (u, p) => `May your love continue to grow stronger each day.`,
  (u, p) => `A love like yours is rare and beautiful.`,
  (u, p) => `Your love story is just beginning.`,
  (u, p) => `The best is yet to come for you two.`,
  (u, p) => `Your love is written in the stars.`,
  (u, p) => `A match made in heaven.`,
  (u, p) => `Your love story is my favorite one to follow.`,
  (u, p) => `Together, you make the perfect pair.`,
  (u, p) => `Your love is an inspiration to us all.`,
  (u, p) => `May your love continue to shine bright.`,
  (u, p) => `Two hearts, one beautiful journey together.`,
  (u, p) => `Your love is the kind that lasts a lifetime.`,
  (u, p) => `Wishing you both a lifetime of love and happiness.`
];

const getRandomRomanticMessage = (userName, partnerName) => {
  const randomIndex = Math.floor(Math.random() * romanticMessages.length);
  return romanticMessages[randomIndex](userName, partnerName);
};

export function Dashboard({ 
  userName = '', 
  partnerName = '',
  onNamesUpdated 
}) {
  const [localUserName, setLocalUserName] = useState(userName);
  const [localPartnerName, setLocalPartnerName] = useState(partnerName);
  
  // Update local state when props change
  useEffect(() => {
    console.log('Dashboard props updated:', { userName, partnerName });
    setLocalUserName(userName);
    setLocalPartnerName(partnerName);
  }, [userName, partnerName]);
  
  // Update parent when local names change
  useEffect(() => {
    if ((userName !== localUserName || partnerName !== localPartnerName) && onNamesUpdated) {
      onNamesUpdated(localUserName, localPartnerName);
    }
  }, [localUserName, localPartnerName, userName, partnerName, onNamesUpdated]);
  const [_, setLocation] = useLocation();
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [romanticMessage, setRomanticMessage] = useState('');

  useEffect(() => {
    setRomanticMessage(getRandomRomanticMessage(userName, partnerName));
    
    // Change the message every 10 seconds
    const interval = setInterval(() => {
      setRomanticMessage(getRandomRomanticMessage(userName, partnerName));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userName, partnerName]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadDates();
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [sortBy]);

  const loadDates = async () => {
    try {
      setIsLoading(true);
      let dates = await db.dates.toArray();
      
      // Sort dates
      if (sortBy === 'newest') {
        dates.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortBy === 'oldest') {
        dates.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy === 'highest') {
        dates.sort((a, b) => b.rating - a.rating);
      }
      
      // Filter by search query if any
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        dates = dates.filter(date => 
          date.title.toLowerCase().includes(query) ||
          (date.description && date.description.toLowerCase().includes(query))
        );
      }
      
      // Get first photo for each date
      const datesWithPhotos = await Promise.all(
        dates.map(async (date) => {
          const photo = await db.photos
            .where('dateId')
            .equals(date.id)
            .first();
          
          return {
            ...date,
            photoUrl: photo ? URL.createObjectURL(photo.blob) : null,
          };
        })
      );
      
      setDates(datesWithPhotos);
    } catch (error) {
      console.error('Failed to load dates', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDates();
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading && dates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-romantic-dark/60">Loading your memories...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-romantic-dark">
            {localUserName || 'You'} and {localPartnerName || 'Your Partner'}'s Memories
          </h2>
          <p className="text-sm text-romantic-dark/80 italic">
            {romanticMessage}
          </p>
        </div>
        <p className="text-romantic-dark/60">
          {dates.length} {dates.length === 1 ? 'memory' : 'memories'} saved
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setLocation('/add')}
            className="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Add Memory</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input flex-1"
            />
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Search
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-romantic-dark/60">Sort by:</span>
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'highest', label: 'Highest Rated' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === option.value}
                  onChange={() => setSortBy(option.value)}
                  className="text-romantic-pink focus:ring-romantic-pink"
                />
                {option.label}
              </label>
            ))}
          </div>
        </form>
        
        {dates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💝</div>
            <h3 className="text-lg font-medium text-romantic-dark mb-2">No memories yet</h3>
            <p className="text-romantic-dark/60 mb-6">
              Start documenting your special moments together
            </p>
            <a href="/add" className="btn btn-primary">
              Create Your First Memory
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dates.map((date) => (
              <div 
                key={date.id}
                onClick={() => setLocation(`/date/${date.id}`)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-romantic-pink/20"
              >
                {date.photoUrl ? (
                  <div className="h-48 bg-romantic-pink/10 relative overflow-hidden">
                    <img 
                      src={date.photoUrl} 
                      alt={date.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-romantic-pink/10 flex items-center justify-center">
                    <span className="text-4xl">💝</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{date.title}</h3>
                  <div className="flex items-center justify-between text-sm text-romantic-dark/60">
                    <span>{formatDate(date.date)}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < date.rating ? 'text-rose-500' : 'text-romantic-pink/30'}>
                          ❤️
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
