import { motion } from 'framer-motion';
import { ExternalLink, Calendar, User, MapPin } from 'lucide-react';
import { MetMuseumObject } from '@/services/apiServices';

interface MuseumSectionProps {
  artifacts: MetMuseumObject[];
  onArtifactClick: (artifact: MetMuseumObject) => void;
}

export function MuseumSection({ artifacts, onArtifactClick }: MuseumSectionProps) {
  if (!artifacts || artifacts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-museum-gold/20 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-museum-gold" />
        </div>
        <h3 className="text-xl font-serif text-foreground">Museum Artifacts</h3>
        <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {artifacts.length} items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map((artifact, index) => (
          <motion.div
            key={artifact.objectID}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group cursor-pointer bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            onClick={() => onArtifactClick(artifact)}
          >
            {/* Image */}
            <div className="relative h-48 bg-muted overflow-hidden">
              {artifact.primaryImageSmall || artifact.primaryImage ? (
                <img
                  src={artifact.primaryImageSmall || artifact.primaryImage}
                  alt={artifact.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-museum-gold/20 to-museum-gold/10">
                  <Calendar className="w-12 h-12 text-museum-gold/50" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-full">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">View Details</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-serif font-semibold text-foreground line-clamp-2 mb-1">
                  {artifact.title || 'Untitled Artifact'}
                </h4>
                {artifact.artistDisplayName && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{artifact.artistDisplayName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {artifact.objectDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{artifact.objectDate}</span>
                  </div>
                )}
                
                {artifact.culture && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{artifact.culture}</span>
                  </div>
                )}

                {artifact.medium && (
                  <p className="text-xs line-clamp-2">{artifact.medium}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {artifact.department}
                </span>
                {artifact.isPublicDomain && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Public Domain
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Artifacts from The Metropolitan Museum of Art, New York
      </p>
    </motion.div>
  );
}