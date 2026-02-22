/**
 * Build proper image URL for travelogue images
 * @param {string} imagePath - The image path from database
 * @returns {string} - Complete image URL
 */
export const buildImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/no-image.png';
  }

  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If starts with /, prepend domain
  if (imagePath.startsWith('/')) {
    return `http://localhost:3001${imagePath}`;
  }

  // Otherwise, assume it's a relative path from root
  return `http://localhost:3001/${imagePath}`;
};
