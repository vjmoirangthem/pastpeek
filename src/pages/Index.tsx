import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { LocationHeader } from '@/components/LocationHeader';
import { TimelineScroller } from '@/components/TimelineScroller';
import { EventCard } from '@/components/EventCard';
import { Sidebar } from '@/components/Sidebar';
import { Modal } from '@/components/Modal';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Get current timeline data
  const getCurrentData = () => {
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

  const handleSearch = (query: string) => {
    toast({
      title: `Searching for: ${query}`,
      description: "Loading historical data from multiple sources...",
    });
    // In a real app, this would trigger API calls
    console.log('Searching for:', query);
  };

  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive"
      });
    }
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
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Timeline Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Location Header */}
              <LocationHeader 
                location={sampleLocation}
                onTextToSpeech={handleTTS}
              />

              {/* Timeline Scroller */}
              <TimelineScroller
                currentYear={currentYear}
                onYearChange={setCurrentYear}
                keyMoments={keyMoments}
              />

              {/* Events Grid */}
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

              {/* Loading state for new content */}
              {currentData.events.length === 0 && (
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
                    Loading historical events for this time period
                  </p>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Sidebar
                  currentYear={currentYear}
                  onYearJump={setCurrentYear}
                  keyMoments={keyMoments}
                  weather={currentData.weather}
                  location="Imphal Valley"
                />
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
        content={selectedEvent ? `${selectedEvent.content}\n\nThis ${selectedEvent.type} event was significant in shaping the history of the region. The impact can still be felt today in the cultural and social fabric of Imphal.` : ''}
        category={selectedEvent?.type}
        sources={['Historical Archives', 'Academic Research', 'Wikimedia Commons']}
      />
    </div>
  );
};

export default Index;
