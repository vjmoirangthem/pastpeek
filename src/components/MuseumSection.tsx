import { motion } from 'framer-motion';
import { Building, ExternalLink, Calendar, User } from 'lucide-react';
import { MetMuseumObject } from '@/services/apiServices';

interface MuseumSectionProps {
  objects: MetMuseumObject[];
  cityName: string;
}

export function MuseumSection({ objects, cityName }: MuseumSectionProps) {
  if (!objects || objects.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-museum-gold/10 border border-museum-gold/20">
          <Building className="w-5 h-5 text-museum-gold" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-foreground">
            Metropolitan Museum Collection
          </h3>
          <p className="text-sm text-muted-foreground">
            {objects.length} artifacts related to {cityName}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {objects.map((object, index) => (
          <motion.div
            key={object.objectID}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-museum-gold/30 transition-all"
          >
            <div className="flex items-start gap-4">
              {object.primaryImageSmall && (
                <img
                  src={object.primaryImageSmall}
                  alt={object.title}
                  className="w-16 h-16 object-cover rounded border border-border group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-museum-gold transition-colors line-clamp-2">
                  {object.title}
                </h4>
                
                <div className="space-y-1 mt-2 text-xs text-muted-foreground">
                  {object.artistDisplayName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{object.artistDisplayName}</span>
                    </div>
                  )}
                  
                  {object.objectDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{object.objectDate}</span>
                    </div>
                  )}
                  
                  {object.culture && (
                    <p className="text-xs">Culture: {object.culture}</p>
                  )}
                  
                  {object.medium && (
                    <p className="text-xs line-clamp-1">Medium: {object.medium}</p>
                  )}
                </div>
                
                {object.objectURL && (
                  <a
                    href={object.objectURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-museum-gold hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View at Met Museum
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}