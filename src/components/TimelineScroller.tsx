import { motion } from 'framer-motion';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimelineScrollerProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  onYearRangeChange?: (startYear: number, endYear: number) => void;
  yearRange?: { start: number; end: number };
  keyMoments: Array<{
    year: number;
    title: string;
    description: string;
  }>;
}

export function TimelineScroller({ 
  currentYear, 
  onYearChange, 
  onYearRangeChange, 
  yearRange, 
  keyMoments 
}: TimelineScrollerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [useRange, setUseRange] = useState(!!yearRange);
  const [startYear, setStartYear] = useState(yearRange?.start || 1600);
  const [endYear, setEndYear] = useState(yearRange?.end || 2024);

  const minYear = -5000; // Support BC dates
  const maxYear = 2024;

  const handleRangeToggle = (checked: boolean) => {
    setUseRange(checked);
    if (checked && onYearRangeChange) {
      onYearRangeChange(startYear, endYear);
    }
  };

  const handleStartYearChange = (value: string) => {
    const year = parseInt(value) || minYear;
    setStartYear(year);
    if (useRange && onYearRangeChange) {
      onYearRangeChange(year, endYear);
    }
  };

  const handleEndYearChange = (value: string) => {
    const year = parseInt(value) || maxYear;
    setEndYear(year);
    if (useRange && onYearRangeChange) {
      onYearRangeChange(startYear, year);
    }
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
        animate={{ scale: isHovering ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-4xl font-serif font-bold text-museum-gold drop-shadow-sm">
          {useRange ? `${formatYear(startYear)} - ${formatYear(endYear)}` : formatYear(currentYear)}
        </h2>
        <p className="text-muted-foreground font-sans">
          {useRange 
            ? `Exploring ${endYear - startYear + 1} years of history`
            : currentYear === 2024 
              ? 'Present day' 
              : currentYear < 0
                ? `${Math.abs(currentYear)} years before Christ`
                : `${Math.abs(2024 - currentYear)} years ago`
          }
        </p>
      </motion.div>

      {/* Range Controls */}
      <div className="mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="useRange" 
            checked={useRange} 
            onCheckedChange={handleRangeToggle}
          />
          <Label htmlFor="useRange" className="text-sm font-medium">
            Filter by year range
          </Label>
        </div>
        
        {useRange && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startYear" className="text-xs text-muted-foreground">Start Year</Label>
              <Input
                id="startYear"
                type="number"
                value={startYear}
                onChange={(e) => handleStartYearChange(e.target.value)}
                min={minYear}
                max={maxYear}
                className="h-8 text-sm"
                placeholder="e.g. -500 for 500 BC"
              />
            </div>
            <div>
              <Label htmlFor="endYear" className="text-xs text-muted-foreground">End Year</Label>
              <Input
                id="endYear"
                type="number"
                value={endYear}
                onChange={(e) => handleEndYearChange(e.target.value)}
                min={minYear}
                max={maxYear}
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline Slider */}
      <div className="relative mb-6">
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={currentYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-muted via-museum-gold to-accent slider-thumb"
          style={{
            background: `linear-gradient(90deg, 
              hsl(var(--muted)) 0%, 
              hsl(var(--museum-gold)) ${((currentYear - minYear) / (maxYear - minYear)) * 100}%, 
              hsl(var(--accent)) 100%)`
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
          <span>2024</span>
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