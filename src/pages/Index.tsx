import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { LocationHeader } from '@/components/LocationHeader';
import { TimelineScroller } from '@/components/TimelineScroller';
import { EventCard } from '@/components/EventCard';
import { Sidebar } from '@/components/Sidebar';
import { Modal } from '@/components/Modal';
import { useToast } from '@/hooks/use-toast';
import { fetchCityData, WikidataEvent, OpenverseImage, MetArtifact } from '@/services/apiServices';
import { EventCardSkeleton, LocationHeaderSkeleton, ImageGallerySkeleton, SidebarSkeleton } from '@/components/LoadingSkeleton';

// Sample data - in a real app, this would come from APIs
const sampleLocation = {
  name: "Imphal",
  subtitle: "The Jewel City of Manipur",
  description: "Imphal, the capital city of Manipur, is nestled in the heart of the Manipur Valley. Known as the \"Jewel of India,\" this ancient city has been a cultural and political center for over 2,000 years. Rich in history, tradition, and natural beauty, Imphal stands as a testament to the resilience and cultural heritage of the Meitei people.",
  coordinates: "24.8°N, 93.9°E",
  elevation: "786m",
  weather: {
    temperature: "26°C",
    condition: "Partly Cloudy"
  },
  localTime: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })
};

const keyMoments = [
  { year: 1850, title: "British Colonial Period", description: "British influence begins" },
  { year: 1891, title: "Anglo-Manipur War", description: "Major conflict with British forces" },
  { year: 1944, title: "Battle of Imphal", description: "WWII turning point in Asia" },
  { year: 1972, title: "Manipur becomes State", description: "Gains full statehood" }
];

const timelineData: Record<number, any> = {
  1850: {
    events: [
      {
        id: '1850-1',
        title: 'British Colonial Influence',
        content: 'The British East India Company begins to exert influence over Manipur, though the kingdom maintains relative autonomy. This period marks the beginning of significant political changes in the region.',
        type: 'political' as const,
        year: 1850,
        layout: 'large' as const,
        hasImage: true
      },
      {
        id: '1850-2',
        title: 'Trade Routes Flourish',
        content: 'Imphal serves as an important trading hub connecting India and Southeast Asia. Merchants from various regions converge here, bringing diverse cultures and goods.',
        type: 'economic' as const,
        year: 1850,
        layout: 'wide' as const,
        hasImage: true
      },
      {
        id: '1850-3',
        title: 'Kangla Palace Complex',
        content: 'The historic Kangla Palace remains the seat of power, showcasing traditional Manipuri architecture and serving as the cultural heart of the kingdom.',
        type: 'cultural' as const,
        year: 1850,
        layout: 'medium' as const,
        hasImage: true
      }
    ],
    weather: { icon: '🌧️', description: 'Monsoon Season', detail: 'Heavy rainfall typical for the region' }
  },
  1891: {
    events: [
      {
        id: '1891-1',
        title: 'Anglo-Manipur War',
        content: 'A significant conflict between the British and Manipur kingdom that resulted in the exile of the royal family and marked the end of Manipur\'s independence.',
        type: 'military' as const,
        year: 1891,
        layout: 'large' as const,
        hasImage: true
      },
      {
        id: '1891-2',
        title: 'End of Sovereignty',
        content: 'Manipur loses its independent status and comes under direct British rule, fundamentally changing the political landscape of the region.',
        type: 'political' as const,
        year: 1891,
        layout: 'medium' as const,
        hasImage: true
      }
    ],
    weather: { icon: '⛈️', description: 'Stormy Period', detail: 'Turbulent times both politically and climatically' }
  },
  1944: {
    events: [
      {
        id: '1944-1',
        title: 'Battle of Imphal',
        content: 'One of the most significant battles of World War II in Southeast Asia. The successful defense of Imphal marked a turning point in the war against Japanese forces.',
        type: 'military' as const,
        year: 1944,
        layout: 'large' as const,
        hasImage: true
      },
      {
        id: '1944-2',
        title: 'Strategic Air Operations',
        content: 'Imphal becomes a crucial strategic location with massive military operations. The airfield plays a vital role in the Allied victory.',
        type: 'international' as const,
        year: 1944,
        layout: 'wide' as const,
        hasImage: true
      }
    ],
    weather: { icon: '☀️', description: 'Dry Season', detail: 'Clear weather conditions during major military operations' }
  },
  1972: {
    events: [
      {
        id: '1972-1',
        title: 'Statehood Achievement',
        content: 'Manipur becomes a full state of India, gaining greater political autonomy and representation in the national government.',
        type: 'political' as const,
        year: 1972,
        layout: 'large' as const,
        hasImage: true
      },
      {
        id: '1972-2',
        title: 'Infrastructure Modernization',
        content: 'Significant development in infrastructure, education, and healthcare systems begins, marking the start of modern Manipur.',
        type: 'development' as const,
        year: 1972,
        layout: 'wide' as const,
        hasImage: true
      }
    ],
    weather: { icon: '🌞', description: 'Clear Skies Ahead', detail: 'Optimistic climate reflecting bright political future' }
  }
};

const Index = () => {
  const [currentYear, setCurrentYear] = useState(1850);
  const [searchValue, setSearchValue] = useState("Imphal, Manipur");
  const [isDark, setIsDark] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState("Imphal");
  const [yearRange, setYearRange] = useState<{start: number, end: number} | undefined>();
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Get current timeline data - now using API data
  const getCurrentData = () => {
    if (apiData && apiData.events && apiData.events.length > 0) {
      // Group events by year and return data for current year
      const eventsByYear: Record<number, any> = {};
      
      apiData.events.forEach((event: WikidataEvent) => {
        const year = new Date(event.date).getFullYear();
        if (!eventsByYear[year]) {
          eventsByYear[year] = {
            events: [],
            weather: { icon: '🌤️', description: 'Historical Period', detail: `Climate data for ${year}` }
          };
        }
        
        eventsByYear[year].events.push({
          id: `${year}-${eventsByYear[year].events.length}`,
          title: event.label,
          content: event.description,
          type: event.type.toLowerCase().includes('war') || event.type.toLowerCase().includes('battle') ? 'military' : 
                event.type.toLowerCase().includes('political') ? 'political' : 'cultural',
          year: year,
          layout: eventsByYear[year].events.length % 3 === 0 ? 'large' : 
                 eventsByYear[year].events.length % 2 === 0 ? 'wide' : 'medium',
          hasImage: true
        });
      });
      
      // Find closest year to current timeline position
      const availableYears = Object.keys(eventsByYear).map(Number).sort((a, b) => a - b);
      if (availableYears.length > 0) {
        const closestYear = availableYears.reduce((prev, curr) => 
          Math.abs(curr - currentYear) < Math.abs(prev - currentYear) ? curr : prev
        );
        return eventsByYear[closestYear];
      }
    }
    
    // Fallback to sample data
    const availableYears = Object.keys(timelineData).map(Number).sort((a, b) => a - b);
    const closestYear = availableYears.reduce((prev, curr) => 
      Math.abs(curr - currentYear) < Math.abs(prev - currentYear) ? curr : prev
    );
    return timelineData[closestYear] || timelineData[1850];
  };

  const currentData = getCurrentData();

  // Theme management
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load initial city data on mount
  useEffect(() => {
    loadCityData(currentCity);
  }, []);

  // Load city data from APIs
  const loadCityData = async (city: string, startYear?: number, endYear?: number) => {
    setIsLoading(true);
    setCurrentCity(city);
    
    try {
      const data = await fetchCityData(city);
      setApiData(data);
      
      // Update location info with real data
      if (data.wikipedia || data.geoNames) {
        const newLocation = {
          name: data.wikipedia?.title || data.geoNames?.name || city,
          subtitle: data.geoNames?.fclName || "Historic Location",
          description: data.wikipedia?.extract || `Exploring the historical and cultural heritage of ${city}.`,
          coordinates: data.geoNames ? `${parseFloat(data.geoNames.lat).toFixed(1)}°N, ${parseFloat(data.geoNames.lng).toFixed(1)}°E` : "",
          elevation: "",
          weather: {
            temperature: "Loading...",
            condition: "Checking conditions"
          },
          localTime: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })
        };
        
        // Store the new location data
        setApiData(prevData => ({ ...prevData, location: newLocation }));
      }
      
      toast({
        title: "Data loaded successfully",
        description: `Found ${data.events.length} historical events, ${data.images.length} images, and ${data.artifacts.length} artifacts.`,
      });
    } catch (error) {
      console.error('Error loading city data:', error);
      toast({
        title: "Data loading failed",
        description: "Using fallback data. Some features may be limited.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchValue(query);
    const cityName = query.split(',')[0].trim(); // Extract city name from "City, State/Country"
    
    toast({
      title: `Searching for: ${query}`,
      description: "Loading historical data from multiple sources...",
    });
    
    await loadCityData(cityName);
  };

  const handleTTS = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive"
      });
      return;
    }

    // Stop current speech if playing
    if (currentSpeech) {
      speechSynthesis.cancel();
      setCurrentSpeech(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.onend = () => setCurrentSpeech(null);
    utterance.onerror = () => setCurrentSpeech(null);
    
    setCurrentSpeech(utterance);
    speechSynthesis.speak(utterance);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-museum">
      {/* Header */}
      <Header
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        onMenuToggle={() => setShowMenu(!showMenu)}
      />

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Timeline Area */}
            <div className="lg:col-span-3 space-y-4 lg:space-y-8 order-2 lg:order-1">
              {/* Location Header */}
              {isLoading ? (
                <LocationHeaderSkeleton />
              ) : (
                <LocationHeader 
                  location={apiData?.location || sampleLocation}
                  onTextToSpeech={handleTTS}
                />
              )}

              {/* Timeline Scroller */}
              <TimelineScroller
                currentYear={currentYear}
                onYearChange={setCurrentYear}
                onYearRangeChange={(start, end) => {
                  setYearRange({start, end});
                  loadCityData(currentCity, start, end);
                }}
                yearRange={yearRange}
                keyMoments={apiData?.events ? apiData.events
                  .filter((event: any) => event.year && typeof event.year === 'number')
                  .reduce((unique: any[], event: any) => {
                    if (!unique.find(e => e.year === event.year)) {
                      unique.push({
                        year: Number(event.year),
                        title: String(event.title || event.label || 'Historical Event'),
                        description: String((event.description || event.content || 'Historical Event').substring(0, 50) + '...')
                      });
                    }
                    return unique;
                  }, [])
                  .slice(0, 4) : keyMoments}
              />

              {/* Events Grid */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <EventCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <motion.div 
                  key={currentYear} // Re-animate when year changes
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {currentData.events.map((event: any, index: number) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={index}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Image Gallery from Openverse */}
              {apiData?.images && apiData.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-serif text-foreground">Historical Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {apiData.images.slice(0, 8).map((image: OpenverseImage, index: number) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => setSelectedEvent({
                          title: image.title || 'Historical Image',
                          content: `This image is from ${image.source}. Created by: ${image.creator}. License: ${image.license}`,
                          type: 'image',
                          imageUrl: image.url
                        })}
                      >
                        <div className="relative overflow-hidden rounded-lg border border-border bg-card">
                          <img
                            src={image.thumbnail || image.url}
                            alt={image.title || 'Historical image'}
                            className="w-full h-32 object-cover transition-transform group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-medium">View Details</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {image.title || 'Historical Image'}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Images sourced from Openverse under Creative Commons licenses
                  </p>
                </motion.div>
              )}

              {/* Met Museum Artifacts */}
              {apiData?.artifacts && apiData.artifacts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-serif text-foreground">Cultural Artifacts</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {apiData.artifacts.map((artifact: MetArtifact, index: number) => (
                      <motion.div
                        key={artifact.objectID}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.2 }}
                        className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedEvent({
                          title: artifact.title,
                          content: `Culture: ${artifact.culture}\nDynasty: ${artifact.dynasty}\nDate: ${artifact.objectDate}\n\nThis artifact is part of the Metropolitan Museum of Art's public domain collection.`,
                          type: 'artifact',
                          imageUrl: artifact.primaryImage
                        })}
                      >
                        {artifact.primaryImageSmall && (
                          <img
                            src={artifact.primaryImageSmall}
                            alt={artifact.title}
                            className="w-full h-32 object-cover rounded mb-3"
                            loading="lazy"
                          />
                        )}
                        <h4 className="font-semibold text-foreground mb-2">{artifact.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Culture: {artifact.culture}</p>
                          <p>Date: {artifact.objectDate}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Artifacts from The Metropolitan Museum of Art, CC0 Public Domain
                  </p>
                </motion.div>
              )}

              {/* Loading state for new content */}
              {!isLoading && currentData.events.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-museum-gold text-4xl mb-4">🔍</div>
                  <h3 className="text-xl font-serif text-foreground mb-2">
                    Exploring {currentYear}...
                  </h3>
                  <p className="text-muted-foreground">
                    No historical events found for this time period. Try a different year or location.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="sticky top-24">
                {isLoading ? (
                  <SidebarSkeleton />
                ) : (
                  <Sidebar
                    currentYear={currentYear}
                    onYearJump={setCurrentYear}
                    keyMoments={apiData?.events ? apiData.events.slice(0, 4).map((event: WikidataEvent) => ({
                      year: new Date(event.date).getFullYear(),
                      title: event.label,
                      description: event.description?.substring(0, 50) + '...' || 'Historical Event'
                    })) : keyMoments}
                    weather={currentData.weather}
                    location={apiData?.geoNames?.name || currentCity}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        content={selectedEvent ? (selectedEvent.imageUrl ? `${selectedEvent.content}\n\n[Image: ${selectedEvent.imageUrl}]` : `${selectedEvent.content}\n\nThis ${selectedEvent.type} provides valuable insight into the historical and cultural heritage of the region.`) : ''}
        category={selectedEvent?.type}
        sources={['Historical Archives', 'Academic Research', 'Wikimedia Commons']}
      />
    </div>
  );
};

export default Index;
