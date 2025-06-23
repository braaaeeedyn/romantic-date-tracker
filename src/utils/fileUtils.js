import Compressor from 'compressorjs';

/**
 * Compresses an image file with specified options
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      convertSize: 0, // Always compress
      ...options,
      success(result) {
        resolve(result);
      },
      error(err) {
        console.error('Error compressing image:', err);
        reject(err);
      },
    });
  });
};

/**
 * Converts a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validates if a file is an image and within size limit
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {{valid: boolean, error?: string}} - Validation result
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are allowed.' };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { 
      valid: false, 
      error: `Image must be smaller than ${maxSizeMB}MB.` 
    };
  }
  
  return { valid: true };
};

/**
 * Creates a thumbnail from an image file
 * @param {File} file - The image file
 * @param {number} maxWidth - Maximum width of the thumbnail
 * @param {number} maxHeight - Maximum height of the thumbnail
 * @returns {Promise<File>} - Thumbnail file
 */
export const createThumbnail = (file, maxWidth = 200, maxHeight = 200) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob], `thumb_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
          );
        },
        'image/jpeg',
        0.7 // quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};
