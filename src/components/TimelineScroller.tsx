import { motion } from 'framer-motion';
import { useState } from 'react';

interface TimelineScrollerProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  keyMoments: Array<{
    year: number;
    title: string;
    description: string;
  }>;
}

export function TimelineScroller({ 
  currentYear, 
  onYearChange, 
  keyMoments 
}: TimelineScrollerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);

  const minYear = -5000; // Support BC dates
  const maxYear = new Date().getFullYear();

  const handleSliderStart = () => {
    setIsDragging(true);
    setDragStartTime(Date.now());
  };

  const handleSliderEnd = () => {
    setIsDragging(false);
    setDragStartTime(null);
  };

  const getSliderStep = () => {
    if (!isDragging || !dragStartTime) return 1;
    const holdTime = Date.now() - dragStartTime;
    // More precision the longer you hold
    if (holdTime > 2000) return 1; // Very precise after 2 seconds
    if (holdTime > 1000) return 5; // Moderate precision after 1 second
    return 25; // Default step for quick movements
  };

  const formatYear = (year: number): string => {
    if (year < 0) {
      return `${Math.abs(year)} BC`;
    }
    return year.toString();
  };

  return (
    <motion.div 
      className="bg-card border border-border rounded-xl p-6 shadow-museum"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Year Display */}
      <motion.div 
        className="text-center mb-6"
        animate={{ scale: isHovering || isDragging ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-4xl font-serif font-bold text-museum-gold drop-shadow-sm">
          {formatYear(currentYear)}
        </h2>
        <p className="text-muted-foreground font-sans">
          {currentYear === maxYear 
            ? 'Present day' 
            : currentYear < 0
              ? `${Math.abs(currentYear)} years before Christ`
              : `${Math.abs(maxYear - currentYear)} years ago`
          }
        </p>
        {isDragging && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-museum-gold mt-2"
          >
            Hold longer for precise control • Step: {getSliderStep()} years
          </motion.p>
        )}
      </motion.div>


      {/* Timeline Slider */}
      <div className="relative mb-6">
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={getSliderStep()}
          value={currentYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          onMouseDown={handleSliderStart}
          onMouseUp={handleSliderEnd}
          onTouchStart={handleSliderStart}
          onTouchEnd={handleSliderEnd}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="w-full h-4 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-muted via-museum-gold to-accent slider-thumb transition-all duration-200"
          style={{
            background: `linear-gradient(90deg, 
              hsl(var(--muted)) 0%, 
              hsl(var(--museum-gold)) ${((currentYear - minYear) / (maxYear - minYear)) * 100}%, 
              hsl(var(--accent)) 100%)`,
            height: isDragging ? '20px' : '16px'
          }}
        />
        
        {/* Year markers */}
        <div className="flex justify-between mt-2 text-sm text-muted-foreground font-sans">
          <span>5000 BC</span>
          <span>1000 BC</span>
          <span>0 AD</span>
          <span>1000</span>
          <span>1500</span>
          <span>2000</span>
          <span>{maxYear}</span>
        </div>
      </div>

      {/* Quick Jump Buttons for Key Moments */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {keyMoments.map((moment, index) => (
          <motion.button
            key={moment.year}
            onClick={() => onYearChange(moment.year)}
            className={`p-3 rounded-lg border transition-all duration-300 font-sans text-sm ${
              currentYear === moment.year
                ? 'bg-museum-gold text-primary-foreground border-museum-gold shadow-glow'
                : 'bg-card hover:bg-secondary border-border hover:border-museum-gold'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="font-medium text-museum-gold">{moment.year}</div>
            <div className="text-xs text-muted-foreground truncate">
              {moment.title}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// CSS for custom slider thumb
const sliderStyle = `
  .slider-thumb::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: hsl(var(--museum-gold));
    cursor: pointer;
    box-shadow: 0 0 15px hsl(var(--museum-gold) / 0.5);
    border: 2px solid hsl(var(--background));
  }

  .slider-thumb::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: hsl(var(--museum-gold));
    cursor: pointer;
    box-shadow: 0 0 15px hsl(var(--museum-gold) / 0.5);
    border: 2px solid hsl(var(--background));
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = sliderStyle;
  document.head.appendChild(style);
}