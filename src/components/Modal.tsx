import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  imageUrl?: string;
  imageLicense?: string;
  sources?: string[];
  category?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  imageUrl, 
  imageLicense, 
  sources = [],
  category 
}: ModalProps) {
  const [isReading, setIsReading] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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

  const handleTTS = () => {
    setIsReading(true);
    // In a real app, implement actual TTS here
    console.log('Reading:', content);
    setTimeout(() => setIsReading(false), 3000);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-serif font-bold text-museum-gold mb-1">
                      {title}
                    </h2>
                    {category && (
                      <span className="text-sm text-muted-foreground capitalize font-sans">
                        {category} Event
                      </span>
                    )}
                  </div>
                  
                  {/* TTS Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleTTS}
                    className={`
                      p-3 rounded-full transition-all duration-300
                      ${isReading 
                        ? 'bg-museum-gold text-primary-foreground animate-glow-pulse' 
                        : 'bg-museum-gold/10 text-museum-gold hover:bg-museum-gold hover:text-primary-foreground'
                      }
                    `}
                    title="Listen to article"
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                <div className="p-6">
                  {/* Image */}
                  {imageUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <img
                        src={imageUrl.includes('/thumb/') ? imageUrl.replace('/thumb/', '/').replace(/\/\d+px-.*$/, '') : imageUrl}
                        alt={title}
                        className="w-full max-h-96 object-contain rounded-xl border border-border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(imageUrl.includes('/thumb/') ? imageUrl.replace('/thumb/', '/').replace(/\/\d+px-.*$/, '') : imageUrl, '_blank')}
                      />
                      {imageLicense && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                          <ExternalLink className="w-3 h-3" />
                          License: {imageLicense}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Main Content */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="prose prose-lg max-w-none"
                  >
                    <div className="font-sans leading-relaxed text-foreground">
                      {content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>

                  {/* Additional Details */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-border"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {category && (
                        <div>
                          <h4 className="font-serif font-semibold text-museum-gold mb-2">
                            Category
                          </h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {category} Historical Event
                          </p>
                        </div>
                      )}
                      
                      {sources.length > 0 && (
                        <div>
                          <h4 className="font-serif font-semibold text-museum-gold mb-2">
                            Sources
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {sources.map((source, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {source}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}