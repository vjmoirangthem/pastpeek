import { motion } from 'framer-motion';
import { Map, Calendar, Cloud, Navigation } from 'lucide-react';

interface SidebarProps {
  currentYear: number;
  onYearJump: (year: number) => void;
  keyMoments: Array<{
    year: number;
    title: string;
    description: string;
  }>;
  weather: {
    icon: string;
    description: string;
    detail: string;
  };
  location: string;
}

export function Sidebar({ currentYear, onYearJump, keyMoments, weather, location }: SidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Historical Map */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-museum-gold" />
          <h3 className="font-serif font-semibold text-foreground">Historical Map</h3>
        </div>
        
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/60 rounded-lg border border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Interactive Map View</p>
              <p className="text-xs">Historical boundaries for {currentYear}</p>
            </div>
          </div>
          
          {/* Map overlay */}
          <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
            {location}<br />
            <span className="text-xs opacity-75">{currentYear} Boundaries</span>
          </div>
        </div>
      </div>

      {/* Key Moments */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-museum-gold" />
          <h3 className="font-serif font-semibold text-foreground">Key Moments</h3>
        </div>
        
        <div className="space-y-2">
          {keyMoments.map((moment, index) => (
            <motion.button
              key={moment.year}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onYearJump(moment.year)}
              className={`
                w-full text-left p-3 rounded-lg transition-all duration-200 border-l-3
                ${currentYear === moment.year
                  ? 'bg-museum-gold/10 border-l-museum-gold text-museum-gold'
                  : 'bg-secondary/50 border-l-transparent hover:bg-secondary hover:border-l-museum-gold/50'
                }
              `}
            >
              <div className="font-medium text-sm">
                {moment.year}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {moment.title}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Historical Weather */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-museum-gold" />
          <h3 className="font-serif font-semibold text-foreground">Historical Climate</h3>
        </div>
        
        <motion.div 
          key={currentYear} // Re-animate when year changes
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg"
        >
          <div className="text-3xl mb-2">{weather.icon}</div>
          <div className="font-medium text-foreground mb-1">
            {weather.description}
          </div>
          <div className="text-xs text-muted-foreground">
            {weather.detail}
          </div>
        </motion.div>
      </div>

      {/* Navigation Aid */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-museum-gold" />
          <h3 className="font-serif font-semibold text-foreground">Navigation</h3>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Use the timeline slider above to travel through time, or click on key moments to jump to specific years.
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => onYearJump(Math.max(1600, currentYear - 50))}
              className="p-2 text-xs bg-secondary hover:bg-museum-gold/10 hover:text-museum-gold rounded transition-colors duration-200"
            >
              ← 50 years
            </button>
            <button
              onClick={() => onYearJump(Math.min(2024, currentYear + 50))}
              className="p-2 text-xs bg-secondary hover:bg-museum-gold/10 hover:text-museum-gold rounded transition-colors duration-200"
            >
              50 years →
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}