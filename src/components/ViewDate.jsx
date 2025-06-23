import { useEffect, useState } from 'preact/hooks';
import { useLocation, Link, useRoute } from 'wouter-preact';
import { format, parseISO } from 'date-fns';
import { db } from '../lib/db';

export function ViewDate() {
  const [match, params] = useRoute('/date/:id');
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const [memory, setMemory] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);

  // Load memory data
  useEffect(() => {
    const loadMemory = async () => {
      if (!params?.id) return;
      
      setIsLoading(true);
      
      try {
        // Load memory data
        const memoryData = await db.dates.get(parseInt(params.id, 10));
        if (!memoryData) {
          setLocation('/');
          return;
        }
        
        // Load photos for this memory
        const memoryPhotos = await db.photos
          .where('dateId')
          .equals(parseInt(params.id, 10))
          .sortBy('order');
        
        // Create object URLs for the photos
        const urls = memoryPhotos.map(photo => ({
          id: photo.id,
          url: URL.createObjectURL(photo.blob)
        }));
        
        setMemory(memoryData);
        setPhotos(memoryPhotos);
        setPhotoUrls(urls);
        
      } catch (error) {
        console.error('Failed to load memory', error);
        setLocation('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMemory();
    
    // Cleanup function to revoke object URLs
    return () => {
      photoUrls.forEach(photo => {
        URL.revokeObjectURL(photo.url);
      });
    };
  }, [params?.id]);
  
  const handleDelete = async () => {
    if (!memory || !window.confirm('Are you sure you want to delete this memory? This cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await db.transaction('rw', [db.dates, db.photos], async () => {
        // Delete all photos associated with this memory
        await db.photos.where('dateId').equals(memory.id).delete();
        // Delete the memory itself
        await db.dates.delete(memory.id);
      });
      
      // Redirect to home after successful deletion
      setLocation('/');
      
    } catch (error) {
      console.error('Failed to delete memory', error);
      alert('Failed to delete the memory. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const goToNextPhoto = () => {
    setCurrentPhotoIndex(prev => (prev + 1) % photoUrls.length);
  };
  
  const goToPrevPhoto = () => {
    setCurrentPhotoIndex(prev => (prev - 1 + photoUrls.length) % photoUrls.length);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-romantic-dark/60">Loading memory...</div>
      </div>
    );
  }
  
  if (!memory) {
    return (
      <div className="text-center py-12">
        <p className="text-romantic-dark/60 mb-4">Memory not found</p>
        <Link href="/" className="btn btn-primary">
          Back to Memories
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/" className="text-romantic-pink hover:text-romantic-rose inline-flex items-center mb-2">
            ← Back to Memories
          </Link>
          <h2 className="text-2xl font-bold text-romantic-dark">
            {memory.title}
          </h2>
          <div className="flex items-center gap-2 text-romantic-dark/60">
            <span>{formatDate(memory.date)}</span>
            <span>•</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < memory.rating ? 'text-rose-500' : 'text-romantic-pink/30'}>
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link 
            href={`/add?edit=${memory.id}`} 
            className="btn btn-outline"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn bg-rose-50 text-rose-600 hover:bg-rose-100"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Memory</h3>
            <p className="text-romantic-dark/80 mb-6">
              Are you sure you want to delete this memory? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-rose-600 text-white hover:bg-rose-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        {/* Photo gallery */}
        {photoUrls.length > 0 ? (
          <div className="relative bg-romantic-pink/5">
            <div className="aspect-[4/3] md:aspect-video relative overflow-hidden">
              <img 
                src={photoUrls[currentPhotoIndex]?.url} 
                alt={`Memory ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation arrows */}
              {photoUrls.length > 1 && (
                <>
                  <button
                    onClick={goToPrevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-romantic-dark p-2 rounded-full shadow-md transition-all"
                    aria-label="Previous photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-romantic-dark p-2 rounded-full shadow-md transition-all"
                    aria-label="Next photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Photo thumbnails */}
            {photoUrls.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {photoUrls.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      index === currentPhotoIndex 
                        ? 'border-rose-500' 
                        : 'border-transparent hover:border-romantic-pink/50'
                    }`}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-romantic-pink/10 flex items-center justify-center">
            <span className="text-6xl">💝</span>
          </div>
        )}
        
        {/* Memory details */}
        <div className="p-6">
          {memory.description && (
            <div className="prose max-w-none mb-6">
              <h3 className="text-lg font-medium text-romantic-dark/80 mb-2">
                About this memory
              </h3>
              <p className="whitespace-pre-line text-romantic-dark/90">
                {memory.description}
              </p>
            </div>
          )}
          
          <div className="pt-4 border-t border-romantic-pink/20 mt-6">
            <h3 className="text-sm font-medium text-romantic-dark/60 mb-2">
              Memory Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-romantic-dark/60">Date</p>
                <p className="font-medium">{formatDate(memory.date)}</p>
              </div>
              <div>
                <p className="text-sm text-romantic-dark/60">Rating</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < memory.rating ? 'text-rose-500' : 'text-romantic-pink/30'}>
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-romantic-dark/60">Photos</p>
                <p className="font-medium">{photoUrls.length}</p>
              </div>
              <div>
                <p className="text-sm text-romantic-dark/60">Created</p>
                <p className="font-medium">
                  {memory.createdAt ? format(new Date(memory.createdAt), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Link href="/" className="btn btn-outline">
          Back to Memories
        </Link>
      </div>
    </div>
  );
}
