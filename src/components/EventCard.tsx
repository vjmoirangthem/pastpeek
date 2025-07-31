import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Scroll, Sword, Palette, TrendingUp, Calendar } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    content: string;
    type: 'political' | 'military' | 'cultural' | 'economic' | 'social' | 'international' | 'development' | 'sports';
    year: number;
    layout?: 'small' | 'medium' | 'large' | 'wide' | 'tall';
    hasImage?: boolean;
    imageUrl?: string;
    imageLicense?: string;
  };
  index: number;
  onClick: () => void;
}

const typeIcons = {
  political: Clock,
  military: Sword,
  cultural: Palette,
  economic: TrendingUp,
  social: Users,
  international: MapPin,
  development: Scroll,
  sports: Users
};

const typeColors = {
  political: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  military: 'from-red-500/20 to-red-600/20 border-red-500/30',
  cultural: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  economic: 'from-green-500/20 to-green-600/20 border-green-500/30',
  social: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  international: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
  development: 'from-teal-500/20 to-teal-600/20 border-teal-500/30',
  sports: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
};

export function EventCard({ event, index, onClick }: EventCardProps) {
  const Icon = typeIcons[event.type] || Calendar;
  const colorClass = typeColors[event.type] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
  
  const layoutClasses = {
    small: 'md:col-span-1 md:row-span-1',
    medium: 'md:col-span-1 md:row-span-2',
    large: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2 md:row-span-1',
    tall: 'md:col-span-1 md:row-span-3'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className={`
        group cursor-pointer overflow-hidden rounded-xl border bg-gradient-to-br
        ${colorClass} ${layoutClasses[event.layout || 'medium']}
        hover:shadow-museum hover:border-museum-gold/50 transition-all duration-300
      `}
      onClick={onClick}
    >
      {/* Image Section */}
      {event.hasImage && (
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-muted to-muted/60">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Scroll className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span className="text-xs">Historical Image</span>
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 p-2 rounded-lg bg-museum-gold/10 border border-museum-gold/20">
            <Icon className="w-5 h-5 text-museum-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-foreground group-hover:text-museum-gold transition-colors duration-200">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-museum-gold bg-museum-gold/10 px-2 py-0.5 rounded-full">
                {event.year}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {event.type}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-muted-foreground font-sans leading-relaxed line-clamp-3 group-hover:text-foreground/80 transition-colors duration-200">
          {event.content}
        </p>

        {/* Hover indicator */}
        <motion.div 
          className="mt-4 text-xs text-museum-gold font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={{ opacity: 0 }}
        >
          Click to explore this moment →
        </motion.div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-museum-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}