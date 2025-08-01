import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { LocationHeader } from '@/components/LocationHeader';
import { TimelineScroller } from '@/components/TimelineScroller';
import { EventCard } from '@/components/EventCard';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { Modal } from '@/components/Modal';
import { TTSFloater } from '@/components/TTSFloater';
import { useToast } from '@/hooks/use-toast';
import { fetchCityData, WikidataEvent, OpenverseImage, MetArtifact, fetchHistoricalWeather, fetchCurrentWeather, fetchGeocoding, fetchElevation } from '@/services/apiServices';
import { BooksSection } from '@/components/BooksSection';
import { MuseumSection } from '@/components/MuseumSection';
import { HistoricPlacesSection } from '@/components/HistoricPlacesSection';
import { EventCardSkeleton, LocationHeaderSkeleton, ImageGallerySkeleton, SidebarSkeleton } from '@/components/LoadingSkeleton';

// Fallback data only used when API fails
const fallbackLocation = {
  name: "Imphal",
  subtitle: "The Jewel City of Manipur",
  description: "Historical data unavailable. Please check your connection.",
  coordinates: "24.8°N, 93.9°E",
  elevation: "786m",
  weather: {
    temperature: "N/A",
    condition: "Data unavailable"
  },
  localTime: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }),
  timezone: "Asia/Kolkata"
};

// Removed dummy timeline data - now using only API data

const Index = () => {
  const [currentYear, setCurrentYear] = useState(2025);
  const [searchValue, setSearchValue] = useState("Imphal, Manipur");
  const [isDark, setIsDark] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [currentCity, setCurrentCity] = useState("Imphal");
  const [yearRange, setYearRange] = useState<{start: number, end: number} | undefined>();
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [showTTSFloater, setShowTTSFloater] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const { toast } = useToast();

  // Get current timeline data - now using only API data
  const getCurrentData = () => {
    if (apiData && apiData.events && apiData.events.length > 0) {
      // Group events by year and return data for current year
      const eventsByYear: Record<number, any> = {};
      
      apiData.events.forEach((event: WikidataEvent) => {
        const year = event.year || new Date(event.date).getFullYear();
        if (!eventsByYear[year]) {
          eventsByYear[year] = {
            events: [],
            weather: currentWeather || { icon: '🌤️', description: 'Historical Period', detail: `Climate data for ${year}` }
          };
        }
        
        eventsByYear[year].events.push({
          id: event.id || `${year}-${eventsByYear[year].events.length}`,
          title: event.label || 'Historical Event',
          content: event.description || 'A significant historical event.',
          type: event.type?.toLowerCase().includes('war') || event.type?.toLowerCase().includes('battle') ? 'military' : 
                event.type?.toLowerCase().includes('political') ? 'political' : 'cultural',
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
        
        // Update weather in the data
        if (eventsByYear[closestYear] && currentWeather) {
          eventsByYear[closestYear].weather = {
            icon: currentWeather.icon,
            description: currentWeather.condition,
            detail: `${currentWeather.temperature}°C, ${currentWeather.condition}`,
            temperature: currentWeather.temperature,
            maxTemp: currentWeather.maxTemp,
            minTemp: currentWeather.minTemp,
            precipitation: currentWeather.precipitation
          };
        }
        
        return eventsByYear[closestYear];
      }
    }
    
    // Return minimal fallback data when no API data available
    return {
      events: [{
        id: 'fallback-1',
        title: 'No Historical Data Available',
        content: 'Please check your internet connection or try searching for a different location.',
        type: 'info',
        year: currentYear,
        layout: 'large',
        hasImage: false
      }],
      weather: { icon: '❓', description: 'No Data', detail: 'Weather data unavailable' }
    };
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
        // Get proper coordinates and timezone for the location
        const geocodingData = await fetchGeocoding(city);
        let timezone = "UTC";
        let coordinates = "";
        let elevation = "";
        
        if (geocodingData) {
          timezone = geocodingData.timezone;
          coordinates = `${geocodingData.lat.toFixed(1)}°N, ${geocodingData.lng.toFixed(1)}°E`;
          
          // Fetch elevation
          const elevationData = await fetchElevation(geocodingData.lat, geocodingData.lng);
          elevation = elevationData ? `${elevationData}m` : "";
          
          // Fetch current weather
          const currentWeather = await fetchCurrentWeather(geocodingData.lat, geocodingData.lng);
          if (currentWeather) {
            data.location.weather = {
              temperature: `${currentWeather.temperature}°C`,
              condition: currentWeather.condition
            };
          }
        } else if (data.geoNames) {
          coordinates = `${parseFloat(data.geoNames.lat).toFixed(1)}°N, ${parseFloat(data.geoNames.lng).toFixed(1)}°E`;
        }
        
        // Calculate local time and time difference
        const now = new Date();
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const localTime = now.toLocaleTimeString('en-GB', { 
          timeZone: timezone, 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Calculate time difference
        const userTime = new Date(now.toLocaleString("en-US", {timeZone: userTimezone}));
        const locationTime = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
        const diffMs = locationTime.getTime() - userTime.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const timeDiffText = diffHours === 0 ? "Same timezone" : 
                           diffHours > 0 ? `+${diffHours}h from your time` : 
                           `${diffHours}h from your time`;
        
        const newLocation = {
          name: data.wikipedia?.title || data.geoNames?.name || city,
          subtitle: data.geoNames?.fclName || "Historic Location",
          description: data.wikipedia?.extract || `Exploring the historical and cultural heritage of ${city}.`,
          coordinates: coordinates || "",
          elevation: elevation,
          weather: data.location.weather,
          localTime: localTime,
          timezone: timeDiffText
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

  // Load weather data when year or city changes
  const loadWeatherData = async (year: number, city: string) => {
    if (apiData?.geoNames) {
      try {
        const weather = await fetchHistoricalWeather(
          parseFloat(apiData.geoNames.lat), 
          parseFloat(apiData.geoNames.lng), 
          year
        );
        setCurrentWeather(weather);
      } catch (error) {
        console.error('Error loading weather:', error);
      }
    }
  };

  // Load weather when year changes
  useEffect(() => {
    if (apiData?.geoNames) {
      loadWeatherData(currentYear, currentCity);
    }
  }, [currentYear, apiData?.geoNames, currentCity]);

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

    setTtsText(text);
    setShowTTSFloater(true);
    
    if (!currentSpeech) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.onend = () => {
        setCurrentSpeech(null);
        setShowTTSFloater(false);
      };
      utterance.onerror = () => {
        setCurrentSpeech(null);
        setShowTTSFloater(false);
      };
      
      setCurrentSpeech(utterance);
      speechSynthesis.speak(utterance);
    }
  };

  const handleTTSToggle = () => {
    if (currentSpeech) {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      } else {
        speechSynthesis.pause();
      }
    }
  };

  const handleTTSSeek = (seconds: number) => {
    // Since Web Speech API doesn't support seeking, restart from beginning
    if (currentSpeech) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.rate = 0.8;
      utterance.onend = () => {
        setCurrentSpeech(null);
        setShowTTSFloater(false);
      };
      setCurrentSpeech(utterance);
      speechSynthesis.speak(utterance);
    }
  };

  const handleTTSClose = () => {
    if (currentSpeech) {
      speechSynthesis.cancel();
      setCurrentSpeech(null);
    }
    setShowTTSFloater(false);
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

      {/* Sidebar for Mobile */}
      <Sidebar 
        isOpen={showMenu} 
        onClose={() => setShowMenu(false)} 
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
                  location={apiData?.location || fallbackLocation}
                  onTextToSpeech={handleTTS}
                  weather={currentWeather}
                />
              )}

              {/* Timeline Scroller */}
              <TimelineScroller
                currentYear={currentYear}
                onYearChange={setCurrentYear}
                keyMoments={apiData?.events ? apiData.events
                  .filter((event: any) => event.year && typeof event.year === 'number' && !isNaN(event.year))
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
                  .sort((a, b) => a.year - b.year)
                  .slice(0, 6) : []}
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
                  <RightSidebar
                    currentYear={currentYear}
                    onYearJump={setCurrentYear}
                    keyMoments={apiData?.events ? apiData.events.slice(0, 4).map((event: WikidataEvent) => ({
                      year: new Date(event.date).getFullYear(),
                      title: event.label,
                      description: event.description?.substring(0, 50) + '...' || 'Historical Event'
                    })) : []}
                    weather={currentWeather || currentData.weather}
                    location={apiData?.geoNames?.name || currentCity}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* New Sections - Museum, Historic Places, Books */}
          <div className="space-y-6 mt-8">
            {/* Museum Section */}
            {apiData?.metMuseumObjects && apiData.metMuseumObjects.length > 0 && (
              <MuseumSection 
                objects={apiData.metMuseumObjects} 
                cityName={currentCity}
              />
            )}

            {/* Historic Places Section */}
            {apiData?.osmHistoricPlaces && apiData.osmHistoricPlaces.length > 0 && (
              <HistoricPlacesSection 
                places={apiData.osmHistoricPlaces} 
                cityName={currentCity}
              />
            )}

            {/* Books Section */}
            {apiData?.gutenbergBooks && apiData.gutenbergBooks.length > 0 && (
              <BooksSection 
                books={apiData.gutenbergBooks} 
                cityName={currentCity}
              />
            )}
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

      {/* TTS Floater */}
      <TTSFloater
        isOpen={showTTSFloater}
        onClose={handleTTSClose}
        text={ttsText}
        isPlaying={!!currentSpeech && !speechSynthesis.paused}
        onTogglePlay={handleTTSToggle}
        onSeek={handleTTSSeek}
      />
    </div>
  );
};

export default Index;
