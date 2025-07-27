import { motion } from 'framer-motion';
import { Search, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const suggestions = [
  "Rome, Italy", "London, England", "Paris, France", "Delhi, India",
  "Imphal, Manipur", "Tokyo, Japan", "Cairo, Egypt", "Athens, Greece",
  "Constantinople", "Babylon", "Machu Picchu", "Angkor Wat"
];

export function SearchBox({ value, onChange, onSearch, placeholder = "Search any place... (try 'Rome', 'London', 'Imphal')" }: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`
            relative flex items-center border rounded-full transition-all duration-300
            ${isFocused 
              ? 'border-museum-gold shadow-glow bg-card' 
              : 'border-border bg-card/50 hover:bg-card hover:border-museum-gold/50'
            }
          `}
          animate={{ 
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Icon */}
          <div className="pl-4 pr-2">
            <Search className={`w-5 h-5 transition-colors duration-200 ${
              isFocused ? 'text-museum-gold' : 'text-muted-foreground'
            }`} />
          </div>

          {/* Input */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            className="flex-1 py-3 px-2 bg-transparent text-foreground placeholder-muted-foreground outline-none font-sans"
          />

          {/* Current location indicator */}
          <div className="pr-4 pl-2 flex items-center gap-2 text-muted-foreground">
            {value && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-xs bg-museum-gold/10 text-museum-gold px-2 py-1 rounded-full"
              >
                <MapPin className="w-3 h-3" />
                <span>Searching...</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Search button - hidden but functional for Enter key */}
        <button type="submit" className="hidden" />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-museum z-50 overflow-hidden"
        >
          <div className="p-2">
            <div className="text-xs text-muted-foreground px-3 py-2 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Suggested places to explore:
            </div>
            {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-foreground font-sans text-sm transition-colors duration-150 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-museum-gold flex-shrink-0" />
                <span>{suggestion}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick access chips */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2 mt-3"
      >
        {["Rome", "London", "Imphal", "Delhi"].map((place, index) => (
          <motion.button
            key={place}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => handleSuggestionClick(place)}
            className="px-3 py-1 text-xs bg-muted hover:bg-museum-gold/10 text-muted-foreground hover:text-museum-gold border border-border hover:border-museum-gold/30 rounded-full transition-all duration-200 font-sans"
          >
            {place}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}