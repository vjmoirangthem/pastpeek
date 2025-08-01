import { motion } from 'framer-motion';
import { MapPin, Navigation, Info } from 'lucide-react';
import { OSMHistoricPlace } from '@/services/apiServices';

interface HistoricPlacesSectionProps {
  places: OSMHistoricPlace[];
  cityName: string;
}

export function HistoricPlacesSection({ places, cityName }: HistoricPlacesSectionProps) {
  if (!places || places.length === 0) {
    return null;
  }

  const openInMaps = (lat: number, lon: number, name: string) => {
    const url = `https://www.google.com/maps?q=${lat},${lon}&t=h&z=15`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-museum-gold/10 border border-museum-gold/20">
          <MapPin className="w-5 h-5 text-museum-gold" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-foreground">
            Historic Places
          </h3>
          <p className="text-sm text-muted-foreground">
            {places.length} historic landmarks in {cityName}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {places.map((place, index) => (
          <motion.div
            key={`${place.type}-${place.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-museum-gold/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-museum-gold transition-colors">
                  {place.tags.name || 'Historic Site'}
                </h4>
                
                <div className="space-y-1 mt-2 text-xs text-muted-foreground">
                  {place.tags.historic && (
                    <div className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <span className="capitalize">{place.tags.historic}</span>
                    </div>
                  )}
                  
                  {place.tags.tourism && (
                    <p className="text-xs">Tourism: {place.tags.tourism}</p>
                  )}
                  
                  {place.tags.description && (
                    <p className="text-xs line-clamp-2 mt-1">
                      {place.tags.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Coordinates: {place.lat.toFixed(4)}, {place.lon.toFixed(4)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => openInMaps(place.lat, place.lon, place.tags.name || 'Historic Site')}
                className="ml-3 p-2 rounded-lg bg-museum-gold/10 text-museum-gold hover:bg-museum-gold hover:text-primary-foreground transition-all"
                title="Open in Google Maps"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}