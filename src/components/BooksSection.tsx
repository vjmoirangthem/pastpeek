import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Book, ExternalLink, Download } from 'lucide-react';
import { GutenbergBook, fetchGutenbergBookDetails } from '@/services/apiServices';

interface BooksSectionProps {
  books: GutenbergBook[];
  cityName: string;
}

export function BooksSection({ books, cityName }: BooksSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBook, setSelectedBook] = useState<GutenbergBook | null>(null);
  const [bookDetails, setBookDetails] = useState<GutenbergBook | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleBookClick = async (book: GutenbergBook) => {
    setSelectedBook(book);
    setLoadingDetails(true);
    
    try {
      const details = await fetchGutenbergBookDetails(book.id);
      setBookDetails(details);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeBookDetails = () => {
    setSelectedBook(null);
    setBookDetails(null);
  };

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-museum-gold/10 border border-museum-gold/20">
              <Book className="w-5 h-5 text-museum-gold" />
            </div>
            <div className="text-left">
              <h3 className="font-serif font-semibold text-foreground group-hover:text-museum-gold transition-colors">
                Historical Books about {cityName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {books.length} books found from Project Gutenberg
              </p>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-4"
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-museum-gold/30 transition-all cursor-pointer group"
                  onClick={() => handleBookClick(book)}
                >
                  {book.thumbnailImage && (
                    <img
                      src={book.thumbnailImage}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded border border-border group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground group-hover:text-museum-gold transition-colors line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {book.author}
                    </p>
                    {book.summary && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {book.summary}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:text-museum-gold transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Book Details Modal */}
      <AnimatePresence>
        {selectedBook && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeBookDetails}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <Book className="w-6 h-6 text-museum-gold" />
                    <div>
                      <h2 className="text-xl font-serif font-bold text-museum-gold">
                        Book Details
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Project Gutenberg
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={closeBookDetails}
                    className="p-2 rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-museum-gold"></div>
                    </div>
                  ) : bookDetails ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        {bookDetails.coverImage && (
                          <img
                            src={bookDetails.coverImage}
                            alt={bookDetails.title}
                            className="w-24 h-32 object-cover rounded border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                            {bookDetails.title}
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            by {bookDetails.author}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {bookDetails.language && (
                              <div>
                                <span className="font-medium text-museum-gold">Language:</span>
                                <span className="ml-2 text-muted-foreground">{bookDetails.language}</span>
                              </div>
                            )}
                            {bookDetails.published && (
                              <div>
                                <span className="font-medium text-museum-gold">Published:</span>
                                <span className="ml-2 text-muted-foreground">{bookDetails.published}</span>
                              </div>
                            )}
                            {bookDetails.downloads && (
                              <div>
                                <span className="font-medium text-museum-gold">Downloads:</span>
                                <span className="ml-2 text-muted-foreground">{bookDetails.downloads.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {bookDetails.summary && (
                        <div>
                          <h4 className="font-medium text-museum-gold mb-2">Summary</h4>
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {bookDetails.summary.split('\n').map((paragraph, index) => (
                              <p key={index} className="mb-2">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookDetails.downloadLinks && Object.keys(bookDetails.downloadLinks).length > 0 && (
                        <div>
                          <h4 className="font-medium text-museum-gold mb-3">Download Options</h4>
                          <div className="flex flex-wrap gap-2">
                            {bookDetails.downloadLinks.epub && (
                              <a
                                href={bookDetails.downloadLinks.epub}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-museum-gold/10 text-museum-gold border border-museum-gold/20 rounded-lg hover:bg-museum-gold hover:text-primary-foreground transition-all text-sm"
                              >
                                <Download className="w-4 h-4" />
                                EPUB
                              </a>
                            )}
                            {bookDetails.downloadLinks.kindle && (
                              <a
                                href={bookDetails.downloadLinks.kindle}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-museum-gold/10 text-museum-gold border border-museum-gold/20 rounded-lg hover:bg-museum-gold hover:text-primary-foreground transition-all text-sm"
                              >
                                <Download className="w-4 h-4" />
                                Kindle
                              </a>
                            )}
                            {bookDetails.downloadLinks.text && (
                              <a
                                href={bookDetails.downloadLinks.text}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-museum-gold/10 text-museum-gold border border-museum-gold/20 rounded-lg hover:bg-museum-gold hover:text-primary-foreground transition-all text-sm"
                              >
                                <Download className="w-4 h-4" />
                                Text
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Failed to load book details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}