import { useState, useRef, useEffect } from 'preact/hooks';
import { useLocation, Link } from 'wouter-preact';
import Compressor from 'compressorjs';
import { db } from '../lib/db';
import { getThemeById } from '../lib/themes';

const MAX_PHOTOS = 5;

export function AddDate({ currentTheme = 'lilac' }) {
  const [_, setLocation] = useLocation();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    rating: 5,
  });
  
  const [photos, setPhotos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit
    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }
    
    setError('');
    
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
      
      // Compress the image
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
        convertSize: 0, // Always compress
        success(result) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPhotos(prev => [...prev, {
              id: Date.now() + Math.random().toString(36).substr(2, 9),
              file: result,
              preview: e.target.result,
              isUploading: false
            }]);
          };
          reader.readAsDataURL(result);
        },
        error(err) {
          console.error('Error compressing image:', err);
          setError('Failed to process one or more images. Please try again.');
        },
      });
    });
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Please enter a title for this memory.');
      return;
    }
    
    if (photos.length === 0) {
      const confirm = window.confirm('Are you sure you want to save without any photos?');
      if (!confirm) return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Start a transaction
      const dateId = await db.transaction('rw', [db.dates, db.photos], async () => {
        // Save the date entry
        const dateId = await db.dates.add({
          title: formData.title.trim(),
          description: formData.description.trim(),
          date: formData.date,
          rating: formData.rating,
          createdAt: new Date().toISOString(),
        });
        
        // Process and save photos
        const photoPromises = photos.map(async (photo, index) => {
          // Convert data URL to Blob if needed
          let blob;
          if (typeof photo.file === 'string') {
            const response = await fetch(photo.file);
            blob = await response.blob();
          } else {
            blob = photo.file;
          }
          
          await db.photos.add({
            dateId,
            blob,
            order: index,
            createdAt: new Date().toISOString(),
          });
        });
        
        await Promise.all(photoPromises);
        return dateId;
      });
      
      // Redirect to the newly created date
      setLocation(`/date/${dateId}`);
      
    } catch (error) {
      console.error('Failed to save date:', error);
      setError('Failed to save your memory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-romantic-dark pl-6">
          Add New Memory
        </h2>
        <Link 
          href="/" 
          className="flex items-center gap-1 text-romantic-pink hover:text-romantic-rose transition-colors"
        >
          <span>Back to Memories</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-romantic-dark/80 mb-1">
              Memory Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input"
              placeholder="E.g., Romantic Beach Getaway"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-romantic-dark/80 mb-1">
              When was this memory? *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="input"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-romantic-dark/80 mb-2">
              How would you rate this memory? *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= formData.rating;
                const theme = getThemeById(currentTheme);
                const themeColor = `text-romantic-${theme.id}`;
                
                return (
                  <button
                    key={star}
                    type="button"
                    className={`relative w-8 h-8 transition-all duration-200 hover:scale-110 ${isActive ? themeColor : 'text-gray-300'}`}
                    onClick={() => handleInputChange({
                      target: { name: 'rating', value: star }
                    })}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.classList.add('opacity-70');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.classList.remove('opacity-70');
                    }}
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-full h-full"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                );
              })}
              <span className="ml-2 text-romantic-dark/60">
                {formData.rating} of 5
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-romantic-dark/80 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input min-h-[120px]"
              placeholder="Share the special moments, feelings, or anything you'd like to remember..."
              rows="4"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-romantic-dark/80 mb-2">
              Add Photos (up to {MAX_PHOTOS})
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
              {/* Photo previews */}
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-romantic-pink/10 rounded-lg overflow-hidden">
                    <img 
                      src={photo.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-rose-100 transition-colors"
                    aria-label="Remove photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {/* Add photo button */}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-romantic-pink/50 rounded-lg flex flex-col items-center justify-center text-romantic-pink/60 hover:bg-romantic-pink/5 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-xs">Add Photo</span>
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={photos.length >= MAX_PHOTOS}
              />
            </div>
            
            <p className="text-xs text-romantic-dark/50">
              {photos.length} of {MAX_PHOTOS} photos added. JPG, PNG up to 5MB each.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Link 
            href="/" 
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save Memory'}
          </button>
        </div>
      </form>
    </div>
  );
}
