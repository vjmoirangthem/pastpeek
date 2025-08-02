import { motion } from 'framer-motion';
import { MapPin, ExternalLink, Clock, Building } from 'lucide-react';
import { OverpassElement } from '@/services/apiServices';

interface HistoricPlacesSectionProps {
  places: OverpassElement[];
  onPlaceClick: (place: OverpassElement) => void;
}

export function HistoricPlacesSection({ places, onPlaceClick }: HistoricPlacesSectionProps) {
  if (!places || places.length === 0) {
    return null;
  }

  const getHistoricIcon = (historicType: string) => {
    switch (historicType.toLowerCase()) {
      case 'monument':
        return Building;
      case 'memorial':
        return Clock;
      case 'archaeological_site':
        return MapPin;
      case 'castle':
      case 'fort':
        return Building;
      default:
        return MapPin;
    }
  };

  const getHistoricTypeDisplay = (historicType: string) => {
    const types: { [key: string]: string } = {
      'monument': 'Monument',
      'memorial': 'Memorial',
      'archaeological_site': 'Archaeological Site',
      'castle': 'Castle',
      'fort': 'Fort',
      'church': 'Historic Church',
      'mosque': 'Historic Mosque',
      'temple': 'Historic Temple',
      'building': 'Historic Building',
      'ruins': 'Historic Ruins',
      'battlefield': 'Battlefield',
      'city_gate': 'City Gate'
    };
    return types[historicType.toLowerCase()] || historicType.replace('_', ' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-500" />
        </div>
        <h3 className="text-xl font-serif text-foreground">Historic Places</h3>
        <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {places.length} locations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, index) => {
          const HistoricIcon = getHistoricIcon(place.tags.historic);
          
          return (
            <motion.div
              key={`${place.type}-${place.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group cursor-pointer bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300"
              onClick={() => onPlaceClick(place)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <HistoricIcon className="w-5 h-5 text-blue-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground line-clamp-1">
                      {place.tags.name || place.tags['name:en'] || 'Historic Location'}
                    </h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {getHistoricTypeDisplay(place.tags.historic)}
                  </p>
                  
                  {place.tags.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {place.tags.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {place.lat && place.lon && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{place.lat.toFixed(4)}, {place.lon.toFixed(4)}</span>
                      </div>
                    )}
                    
                    {place.tags.tourism === 'attraction' && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Tourist Attraction
                      </span>
                    )}
                  </div>
                  
                  {place.tags.website && (
                    <div className="mt-2">
                      <a 
                        href={place.tags.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Historic places data from OpenStreetMap contributors
      </p>
    </motion.div>
  );
}