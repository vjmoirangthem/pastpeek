import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  license?: string;
}

// Utility function to convert Wikipedia thumbnail URLs to full resolution
const getFullResolutionUrl = (thumbnailUrl: string): string => {
  if (thumbnailUrl.includes('wikipedia.org') && thumbnailUrl.includes('/thumb/')) {
    // Remove the thumbnail path and size specification
    const fullUrl = thumbnailUrl
      .replace('/thumb', '')
      .replace(/\/\d+px-[^/]+$/, '');
    return fullUrl;
  }
  return thumbnailUrl;
};

export function ImageViewer({ isOpen, onClose, imageUrl, title, license }: ImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const fullResUrl = getFullResolutionUrl(imageUrl);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullResUrl;
    link.download = title.replace(/[^a-zA-Z0-9]/g, '_') + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Image Viewer */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Header Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDownload}
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200"
                title="Download image"
              >
                <Download className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.open(fullResUrl, '_blank')}
                className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 rounded-full bg-black/50 hover:bg-red-500/70 text-white transition-all duration-200"
                title="Close viewer"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}

              {imageError ? (
                <div className="text-white text-center p-8">
                  <ZoomIn className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Failed to load high resolution image</p>
                  <p className="text-sm opacity-70">The original image may not be available</p>
                </div>
              ) : (
                <img
                  src={fullResUrl}
                  alt={title}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className={`
                    max-w-full max-h-full object-contain rounded-lg shadow-2xl
                    transition-opacity duration-300
                    ${isLoading ? 'opacity-0' : 'opacity-100'}
                  `}
                />
              )}
            </motion.div>

            {/* Image Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white"
            >
              <h3 className="font-serif font-bold text-lg mb-1 text-museum-gold">
                {title}
              </h3>
              {license && (
                <p className="text-sm opacity-80 flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" />
                  {license}
                </p>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}