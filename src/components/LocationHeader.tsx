import { motion } from 'framer-motion';
import { Volume2, MapPin, Thermometer, Clock, Mountain } from 'lucide-react';
import { useState } from 'react';

interface LocationHeaderProps {
  location: {
    name: string;
    subtitle: string;
    description: string;
    coordinates: string;
    elevation: string;
    weather: {
      temperature: string;
      condition: string;
    };
    localTime: string;
  };
  onTextToSpeech: (text: string) => void;
  weather?: {
    temperature: number;
    maxTemp: number;
    minTemp: number;
    precipitation: number;
    condition: string;
    icon: string;
  } | null;
}

export function LocationHeader({ location, onTextToSpeech, weather }: LocationHeaderProps) {
  const [isReading, setIsReading] = useState(false);

  const handleTTS = () => {
    setIsReading(true);
    onTextToSpeech(location.description);
    // Reset after 3 seconds (placeholder for actual TTS completion)
    setTimeout(() => setIsReading(false), 3000);
  };

  const infoCards = [
    {
      icon: Thermometer,
      title: "Current Weather",
      value: location.weather.temperature,
      subtitle: location.weather.condition
    },
    {
      icon: Clock,
      title: "Local Time",
      value: location.localTime,
      subtitle: "IST"
    },
    {
      icon: MapPin,
      title: "Coordinates",
      value: location.coordinates,
      subtitle: "Lat, Long"
    },
    {
      icon: Mountain,
      title: "Elevation",
      value: location.elevation,
      subtitle: "Above sea level"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Location Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-gradient-card border border-border p-8 text-center shadow-museum"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--museum-gold)_1px,_transparent_1px)] bg-[length:24px_24px]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.h1 
            className="text-4xl md:text-5xl font-serif font-bold text-museum-gold mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {location.name}
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground font-serif italic mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {location.subtitle}
          </motion.p>

          <motion.div 
            className="max-w-2xl mx-auto p-6 bg-card/60 backdrop-blur-sm border border-border rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-foreground font-sans leading-relaxed text-base">
              {location.description}
            </p>
          </motion.div>

          {/* TTS Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleTTS}
            className={`
              absolute top-4 right-4 p-3 rounded-full transition-all duration-300
              ${isReading 
                ? 'bg-museum-gold text-primary-foreground animate-glow-pulse' 
                : 'bg-museum-gold/10 text-museum-gold hover:bg-museum-gold hover:text-primary-foreground'
              }
            `}
            title="Listen to description"
          >
            <Volume2 className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Info Cards Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {infoCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-card transition-all duration-300 hover:border-museum-gold/30"
          >
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-lg bg-museum-gold/10">
                <card.icon className="w-5 h-5 text-museum-gold" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-sans mb-1">
              {card.title}
            </div>
            <div className="text-sm font-medium text-museum-gold font-mono">
              {card.value}
            </div>
            {card.subtitle && (
              <div className="text-xs text-muted-foreground font-sans">
                {card.subtitle}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}