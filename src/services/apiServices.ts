import { cacheService, CACHE_KEYS, CACHE_TTL } from './cacheService';

const GEONAMES_USERNAME = 'vjmoirangthem';

// Interfaces
export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface WikipediaFullContent {
  title: string;
  content: string;
  sections: WikipediaSection[];
  images: string[];
  categories: string[];
}

export interface WikipediaSection {
  title: string;
  content: string;
  level: number;
  index: number;
}

export interface GeoNamesResult {
  name: string;
  countryName: string;
  adminName1: string;
  lat: string;
  lng: string;
  population?: number;
  fclName: string;
  geonameId: number;
}

export interface GeoNamesSuggestion {
  name: string;
  countryName: string;
  adminName1: string;
  fclName: string;
  geonameId: number;
}

export interface OpenverseImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  creator: string;
  license: string;
  license_url: string;
  source: string;
}

export interface WikidataEvent {
  date: string;
  label: string;
  description: string;
  type: string;
  year: number;
  id: string;
}

export interface WeatherData {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation: number;
}

export interface FilteredEvent {
  id: string;
  title: string;
  content: string;
  type: string;
  year: number;
  dateRange?: string;
  keywords: string[];
  hasImage?: boolean;
  layout?: 'small' | 'medium' | 'large' | 'wide';
}

export interface MetArtifact {
  objectID: number;
  title: string;
  culture: string;
  dynasty: string;
  objectDate: string;
  primaryImage: string;
  primaryImageSmall: string;
}

// Wikipedia REST API - Summary with caching
export async function fetchWikipediaSummary(city: string): Promise<WikipediaSummary | null> {
  return cacheService.getOrFetch(
    CACHE_KEYS.WIKIPEDIA_SUMMARY,
    async () => {
      const encodedCity = encodeURIComponent(city.replace(/\s+/g, '_'));
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodedCity}`);
      
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail,
        coordinates: data.coordinates
      };
    },
    { city },
    CACHE_TTL.LONG
  ).catch(error => {
    console.error('Error fetching Wikipedia summary:', error);
    return null;
  });
}

// Wikipedia Full Content with REGEX parsing and caching
export async function fetchWikipediaFullContent(city: string): Promise<WikipediaFullContent | null> {
  return cacheService.getOrFetch(
    CACHE_KEYS.WIKIPEDIA_FULL,
    async () => {
      const encodedCity = encodeURIComponent(city.replace(/\s+/g, '_'));
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodedCity}&format=json&origin=*`);
      
      if (!response.ok) {
        throw new Error(`Wikipedia Parse API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Wikipedia page not found: ${city}`);
      }
      
      const html = data.parse.text['*'];
      const sections = parseWikipediaSections(html);
      const images = extractImages(html);
      const categories = data.parse.categories?.map((cat: any) => cat['*']) || [];
      
      return {
        title: data.parse.title,
        content: stripHtml(html),
        sections,
        images,
        categories
      };
    },
    { city },
    CACHE_TTL.LONG
  ).catch(error => {
    console.error('Error fetching Wikipedia full content:', error);
    return null;
  });
}

// GeoNames API - Single Location with caching
export async function fetchGeoNamesData(city: string): Promise<GeoNamesResult | null> {
  return cacheService.getOrFetch(
    CACHE_KEYS.GEONAMES,
    async () => {
      const encodedCity = encodeURIComponent(city);
      const response = await fetch(
        `https://secure.geonames.org/searchJSON?q=${encodedCity}&maxRows=1&username=${GEONAMES_USERNAME}`
      );
      
      if (!response.ok) {
        throw new Error(`GeoNames API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.geonames && data.geonames.length > 0) {
        return { ...data.geonames[0], geonameId: data.geonames[0].geonameId };
      }
      
      throw new Error(`Location not found: ${city}`);
    },
    { city },
    CACHE_TTL.VERY_LONG
  ).catch(error => {
    console.error('Error fetching GeoNames data:', error);
    return null;
  });
}

// GeoNames API - Auto-suggestions
export async function fetchGeoNamesSuggestions(query: string): Promise<GeoNamesSuggestion[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://secure.geonames.org/searchJSON?q=${encodedQuery}&maxRows=10&username=${GEONAMES_USERNAME}&featureClass=P&style=SHORT`
    );
    
    if (!response.ok) {
      throw new Error(`GeoNames suggestions error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.geonames?.map((item: any) => ({
      name: item.name,
      countryName: item.countryName,
      adminName1: item.adminName1,
      fclName: item.fclName,
      geonameId: item.geonameId
    })) || [];
  } catch (error) {
    console.error('Error fetching GeoNames suggestions:', error);
    return [];
  }
}

// Wikipedia Images - Extract from Wikipedia content
export async function fetchWikipediaImages(city: string, limit: number = 8): Promise<OpenverseImage[]> {
  try {
    const fullContent = await fetchWikipediaFullContent(city);
    if (!fullContent || !fullContent.images) {
      return [];
    }

    // Convert Wikipedia images to OpenverseImage format
    const images: OpenverseImage[] = fullContent.images
      .slice(0, limit)
      .map((imgUrl: string, index: number) => ({
        id: `wiki-${city}-${index}`,
        title: `${city} - Historical Image ${index + 1}`,
        url: imgUrl.startsWith('//') ? `https:${imgUrl}` : imgUrl,
        thumbnail: imgUrl.startsWith('//') ? `https:${imgUrl}` : imgUrl,
        creator: 'Wikipedia Contributors',
        license: 'CC BY-SA',
        license_url: 'https://creativecommons.org/licenses/by-sa/3.0/',
        source: 'wikipedia'
      }));

    return images;
  } catch (error) {
    console.error('Error fetching Wikipedia images:', error);
    return [];
  }
}

// Wikidata Entity Search
export async function fetchWikidataEntityId(city: string): Promise<string | null> {
  try {
    const encodedCity = encodeURIComponent(city);
    const response = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodedCity}&language=en&format=json&origin=*`
    );
    
    if (!response.ok) {
      throw new Error(`Wikidata search error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.search && data.search.length > 0) {
      return data.search[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Wikidata entity ID:', error);
    return null;
  }
}

// Wikidata SPARQL for historical events with enhanced filtering
export async function fetchWikidataEvents(entityId: string, startYear?: number, endYear?: number): Promise<WikidataEvent[]> {
  try {
    const yearFilter = startYear && endYear 
      ? `FILTER(YEAR(?date) >= ${startYear} && YEAR(?date) <= ${endYear})`
      : 'FILTER(YEAR(?date) >= -5000)'; // Support BC dates
    
    const sparqlQuery = `
      SELECT DISTINCT ?event ?eventLabel ?date ?typeLabel ?eventDescription WHERE {
        ?event wdt:P276 wd:${entityId} .
        ?event wdt:P585 ?date .
        ?event wdt:P31 ?type .
        ?event rdfs:label ?eventLabel .
        OPTIONAL { ?event schema:description ?eventDescription . }
        FILTER(LANG(?eventLabel) = "en")
        FILTER(LANG(?eventDescription) = "en")
        ${yearFilter}
      }
      ORDER BY ?date
      LIMIT 50
    `;
    
    const encodedQuery = encodeURIComponent(sparqlQuery);
    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`,
      {
        headers: {
          'Accept': 'application/sparql-results+json',
          'User-Agent': 'PastPeek/1.0 (https://pastpeek.app) Educational Research Tool'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Wikidata SPARQL error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.bindings.map((binding: any, index: number) => {
      const date = binding.date?.value || '';
      const year = new Date(date).getFullYear();
      
      return {
        id: `wikidata-${entityId}-${index}`,
        date,
        label: binding.eventLabel?.value || 'Historical Event',
        description: binding.eventDescription?.value || 'A significant historical event',
        type: binding.typeLabel?.value || 'event',
        year
      };
    });
  } catch (error) {
    console.error('Error fetching Wikidata events:', error);
    return [];
  }
}

// Fetch current weather data from Open-Meteo
export async function fetchCurrentWeather(lat: number, lng: number): Promise<any> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Current weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.current_weather.temperature),
      condition: getWeatherCondition(data.current_weather.weathercode),
      windSpeed: data.current_weather.windspeed,
      windDirection: data.current_weather.winddirection
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

// Helper function to convert weather codes to conditions
function getWeatherCondition(code: number): string {
  const conditions: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return conditions[code] || 'Unknown';
}

// Fetch geocoding data from Nominatim
export async function fetchGeocoding(cityName: string): Promise<{ lat: number, lng: number, timezone: string } | null> {
  try {
    const encodedCity = encodeURIComponent(cityName);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedCity}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PastPeek-App/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      
      // Get timezone for the coordinates
      const timezoneResponse = await fetch(
        `https://timeapi.io/api/TimeZone/coordinate?latitude=${result.lat}&longitude=${result.lon}`
      );
      
      let timezone = 'UTC';
      if (timezoneResponse.ok) {
        const timezoneData = await timezoneResponse.json();
        timezone = timezoneData.timeZone || 'UTC';
      }
      
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        timezone: timezone
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    return null;
  }
}

// Fetch elevation data from Open-Meteo
export async function fetchElevation(lat: number, lng: number): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Elevation API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.elevation ? Math.round(data.elevation) : null;
  } catch (error) {
    console.error('Error fetching elevation:', error);
    return null;
  }
}

// Fetch historical weather data from Open-Meteo with caching
export async function fetchHistoricalWeather(lat: number, lng: number, year: number): Promise<any> {
  return cacheService.getOrFetch(
    CACHE_KEYS.WEATHER,
    async () => {
      // Create a date range for the middle of the year
      const startDate = `${year}-06-01`;
      const endDate = `${year}-06-07`;

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the weather data to return average values
      if (data.daily && data.daily.temperature_2m_max && data.daily.temperature_2m_max.length > 0) {
        const validMaxTemps = data.daily.temperature_2m_max.filter((temp: number) => temp !== null && !isNaN(temp));
        const validMinTemps = data.daily.temperature_2m_min.filter((temp: number) => temp !== null && !isNaN(temp));
        const validPrecip = data.daily.precipitation_sum.filter((precip: number) => precip !== null && !isNaN(precip));
        
        if (validMaxTemps.length > 0 && validMinTemps.length > 0) {
          const avgMaxTemp = validMaxTemps.reduce((a: number, b: number) => a + b, 0) / validMaxTemps.length;
          const avgMinTemp = validMinTemps.reduce((a: number, b: number) => a + b, 0) / validMinTemps.length;
          const totalPrecip = validPrecip.reduce((a: number, b: number) => a + b, 0);
          
          return {
            temperature: Math.round((avgMaxTemp + avgMinTemp) / 2),
            maxTemp: Math.round(avgMaxTemp),
            minTemp: Math.round(avgMinTemp),
            precipitation: Math.round(totalPrecip * 10) / 10,
            condition: totalPrecip > 5 ? 'Rainy' : totalPrecip > 1 ? 'Partly Cloudy' : 'Clear',
            icon: totalPrecip > 5 ? '🌧️' : totalPrecip > 1 ? '⛅' : '☀️',
            year,
            date: startDate
          };
        }
      }
      
      throw new Error('No valid weather data found');
    },
    { lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100, year },
    CACHE_TTL.VERY_LONG
  ).catch(error => {
    console.error('Error fetching weather:', error);
    return null;
  });
}

// Met Museum API
export async function fetchMetArtifacts(city: string, limit: number = 3): Promise<MetArtifact[]> {
  try {
    const encodedCity = encodeURIComponent(city);
    const searchResponse = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodedCity}`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`Met Museum search error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return [];
    }
    
    const artifacts: MetArtifact[] = [];
    const objectIds = searchData.objectIDs.slice(0, limit);
    
    for (const objectId of objectIds) {
      try {
        const objectResponse = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
        );
        
        if (objectResponse.ok) {
          const objectData = await objectResponse.json();
          
          if (objectData.isPublicDomain && objectData.primaryImage) {
            artifacts.push({
              objectID: objectData.objectID,
              title: objectData.title || 'Untitled Artifact',
              culture: objectData.culture || 'Unknown Culture',
              dynasty: objectData.dynasty || '',
              objectDate: objectData.objectDate || 'Date Unknown',
              primaryImage: objectData.primaryImage,
              primaryImageSmall: objectData.primaryImageSmall
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching object ${objectId}:`, error);
      }
    }
    
    return artifacts;
  } catch (error) {
    console.error('Error fetching Met artifacts:', error);
    return [];
  }
}

// REGEX utilities for content parsing
export function parseWikipediaSections(html: string): WikipediaSection[] {
  const sections: WikipediaSection[] = [];
  
  // Extract sections with headers
  const sectionRegex = /<h([1-6])[^>]*><span[^>]*id="([^"]*)"[^>]*>([^<]+)<\/span><\/h[1-6]>/g;
  const contentRegex = /<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/p>/g;
  
  let match;
  let index = 0;
  
  while ((match = sectionRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const title = stripHtml(match[3]);
    
    // Extract content between this header and the next
    const nextHeaderIndex = html.indexOf('<h', match.index + match[0].length);
    const sectionHtml = nextHeaderIndex > 0 
      ? html.substring(match.index + match[0].length, nextHeaderIndex)
      : html.substring(match.index + match[0].length);
    
    const content = stripHtml(sectionHtml).substring(0, 500);
    
    if (content.trim() && title.toLowerCase().includes('history') || 
        title.toLowerCase().includes('culture') || 
        title.toLowerCase().includes('timeline')) {
      sections.push({
        title,
        content: content.trim(),
        level,
        index: index++
      });
    }
  }
  
  return sections;
}

export function extractImages(html: string): string[] {
  const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
  const images: string[] = [];
  let match;
  
  while ((match = imageRegex.exec(html)) !== null) {
    if (match[1].includes('wikipedia') || match[1].includes('wikimedia')) {
      images.push(match[1]);
    }
  }
  
  return images.slice(0, 5); // Limit to 5 images
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function categorizeEvent(event: WikidataEvent): FilteredEvent {
  const keywords = extractKeywords(event.label + ' ' + event.description);
  const type = determineEventType(event.type, keywords);
  const hasImage = keywords.some(keyword => 
    ['war', 'battle', 'palace', 'temple', 'monument'].includes(keyword.toLowerCase())
  );
  
  return {
    id: event.id,
    title: event.label,
    content: event.description,
    type,
    year: event.year,
    dateRange: formatDateRange(event.date),
    keywords,
    hasImage,
    layout: hasImage ? 'large' : 'medium'
  };
}

function extractKeywords(text: string): string[] {
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'a', 'an'];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));
  
  return [...new Set(words)].slice(0, 5);
}

function determineEventType(wikiType: string, keywords: string[]): string {
  const type = wikiType.toLowerCase();
  
  if (type.includes('war') || type.includes('battle') || keywords.some(k => ['war', 'battle', 'conflict'].includes(k))) {
    return 'military';
  }
  if (type.includes('political') || keywords.some(k => ['government', 'state', 'independence'].includes(k))) {
    return 'political';
  }
  if (type.includes('cultural') || keywords.some(k => ['temple', 'palace', 'art', 'culture'].includes(k))) {
    return 'cultural';
  }
  if (keywords.some(k => ['trade', 'economic', 'market'].includes(k))) {
    return 'economic';
  }
  
  return 'historical';
}

function formatDateRange(date: string): string {
  const year = new Date(date).getFullYear();
  const century = Math.ceil(year / 100);
  
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  }
  
  return `${century}${century === 1 ? 'st' : century === 2 ? 'nd' : century === 3 ? 'rd' : 'th'} Century`;
}

// Remove duplicates from events
export function removeDuplicateEvents(events: FilteredEvent[]): FilteredEvent[] {
  const seen = new Set<string>();
  return events.filter(event => {
    const key = `${event.title.toLowerCase()}_${event.year}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Filter events by year range
export function filterEventsByYear(events: FilteredEvent[], startYear: number, endYear: number): FilteredEvent[] {
  return events.filter(event => event.year >= startYear && event.year <= endYear);
}

// Met Museum API - Search and fetch objects
export interface MetMuseumObject {
  objectID: number;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  dimensions: string;
  classification: string;
  department: string;
  culture: string;
  primaryImage: string;
  primaryImageSmall: string;
  objectURL: string;
  objectName: string;
  artistDisplayBio: string;
  creditLine: string;
  repository: string;
}

export async function fetchMetMuseumObjects(query: string): Promise<MetMuseumObject[]> {
  try {
    const searchResponse = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`Met Museum search error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return [];
    }
    
    const objects: MetMuseumObject[] = [];
    const objectIDs = searchData.objectIDs.slice(0, 5);
    
    for (const objectID of objectIDs) {
      try {
        const objectResponse = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
        );
        
        if (objectResponse.ok) {
          const objectData = await objectResponse.json();
          
          if (objectData.title && objectData.objectDate) {
            objects.push({
              objectID: objectData.objectID,
              title: objectData.title,
              artistDisplayName: objectData.artistDisplayName || 'Unknown Artist',
              objectDate: objectData.objectDate,
              medium: objectData.medium || 'Unknown Medium',
              dimensions: objectData.dimensions || 'Dimensions not available',
              classification: objectData.classification || 'Artifact',
              department: objectData.department || 'Unknown Department',
              culture: objectData.culture || 'Unknown Culture',
              primaryImage: objectData.primaryImage || '',
              primaryImageSmall: objectData.primaryImageSmall || '',
              objectURL: objectData.objectURL || '',
              objectName: objectData.objectName || 'Artifact',
              artistDisplayBio: objectData.artistDisplayBio || '',
              creditLine: objectData.creditLine || '',
              repository: objectData.repository || 'Metropolitan Museum of Art'
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching object ${objectID}:`, error);
      }
    }
    
    return objects;
  } catch (error) {
    console.error('Error fetching Met Museum objects:', error);
    return [];
  }
}

// Overpass API - OSM Historic Places
export interface OSMHistoricPlace {
  id: number;
  type: string;
  lat: number;
  lon: number;
  tags: {
    historic?: string;
    name?: string;
    tourism?: string;
    amenity?: string;
    description?: string;
  };
}

export async function fetchOSMHistoricPlaces(cityName: string): Promise<OSMHistoricPlace[]> {
  try {
    const overpassQuery = `[out:json];area[name="${cityName}"]->.searchArea;(nwr["historic"](area.searchArea););out body;`;
    
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
    );
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.elements?.filter((element: any) => 
      element.tags?.name && element.lat && element.lon
    ).slice(0, 10) || [];
  } catch (error) {
    console.error('Error fetching OSM historic places:', error);
    return [];
  }
}

// Project Gutenberg API - Books search
export interface GutenbergBook {
  id: string;
  title: string;
  author: string;
  summary?: string;
  language?: string;
  downloads?: number;
  published?: string;
  subjects?: string[];
  downloadLinks?: {
    epub?: string;
    kindle?: string;
    text?: string;
  };
  coverImage?: string;
  thumbnailImage?: string;
}

export async function fetchGutenbergBooks(query: string): Promise<GutenbergBook[]> {
  try {
    const response = await fetch(
      `https://www.gutenberg.org/ebooks/search.opds/?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Gutenberg API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const entries = xmlDoc.getElementsByTagName('entry');
    const books: GutenbergBook[] = [];
    
    for (let i = 0; i < Math.min(entries.length, 10); i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName('title')[0]?.textContent || 'Unknown Title';
      const content = entry.getElementsByTagName('content')[0]?.textContent || '';
      const id = entry.getElementsByTagName('id')[0]?.textContent || '';
      
      if (title.includes('Sort') || !content.includes('Author:')) {
        continue;
      }
      
      const authorMatch = content.match(/Author:\s*([^\n]+)/);
      const author = authorMatch ? authorMatch[1].trim() : 'Unknown Author';
      
      const bookIdMatch = id.match(/\/ebooks\/(\d+)/);
      const bookId = bookIdMatch ? bookIdMatch[1] : '';
      
      if (bookId) {
        books.push({
          id: bookId,
          title: title.trim(),
          author: author,
          summary: content.substring(0, 300) + '...',
          coverImage: `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.cover.medium.jpg`,
          thumbnailImage: `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.cover.small.jpg`
        });
      }
    }
    
    return books;
  } catch (error) {
    console.error('Error fetching Gutenberg books:', error);
    return [];
  }
}

export async function fetchGutenbergBookDetails(bookId: string): Promise<GutenbergBook | null> {
  try {
    const response = await fetch(
      `https://www.gutenberg.org/ebooks/${bookId}.opds`
    );
    
    if (!response.ok) {
      throw new Error(`Gutenberg book details error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const entries = xmlDoc.getElementsByTagName('entry');
    if (entries.length === 0) return null;
    
    const entry = entries[0];
    const title = entry.getElementsByTagName('title')[0]?.textContent || 'Unknown Title';
    const content = entry.getElementsByTagName('content')[0]?.textContent || '';
    
    const authorMatch = content.match(/Author:\s*([^\n]+)/);
    const languageMatch = content.match(/Language:\s*([^\n]+)/);
    const downloadsMatch = content.match(/Downloads:\s*(\d+)/);
    const publishedMatch = content.match(/Published:\s*([^\n]+)/);
    
    const links = entry.getElementsByTagName('link');
    const downloadLinks: any = {};
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const rel = link.getAttribute('rel');
      const type = link.getAttribute('type');
      const href = link.getAttribute('href');
      
      if (rel === 'http://opds-spec.org/acquisition' && href) {
        if (type?.includes('epub')) {
          downloadLinks.epub = `https://www.gutenberg.org${href}`;
        } else if (type?.includes('kindle')) {
          downloadLinks.kindle = `https://www.gutenberg.org${href}`;
        } else if (type?.includes('text')) {
          downloadLinks.text = `https://www.gutenberg.org${href}`;
        }
      }
    }
    
    return {
      id: bookId,
      title: title.trim(),
      author: authorMatch ? authorMatch[1].trim() : 'Unknown Author',
      summary: content,
      language: languageMatch ? languageMatch[1].trim() : 'Unknown',
      downloads: downloadsMatch ? parseInt(downloadsMatch[1]) : 0,
      published: publishedMatch ? publishedMatch[1].trim() : 'Unknown',
      downloadLinks,
      coverImage: `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.cover.medium.jpg`,
      thumbnailImage: `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.cover.small.jpg`
    };
  } catch (error) {
    console.error('Error fetching Gutenberg book details:', error);
    return null;
  }
}

// Main function to fetch all city data with smart caching
export async function fetchCityData(city: string, startYear?: number, endYear?: number): Promise<any> {
  try {
    console.log(`🔍 Starting data fetch for: ${city}`);
    
    const [
      wikipediaSummary,
      geoNamesData
    ] = await Promise.all([
      fetchWikipediaSummary(city),
      fetchGeoNamesData(city)
    ]);

    if (!wikipediaSummary && !geoNamesData) {
      console.warn('❌ No basic data found for city');
      return null;
    }

    let coordinates = null;
    if (geoNamesData) {
      coordinates = {
        lat: parseFloat(geoNamesData.lat),
        lng: parseFloat(geoNamesData.lng)
      };
    } else if (wikipediaSummary?.coordinates) {
      coordinates = {
        lat: wikipediaSummary.coordinates.lat,
        lng: wikipediaSummary.coordinates.lon
      };
    }

    const [
      wikidataEntityId,
      images,
      historicalWeather,
      currentWeather,
      elevation,
      metMuseumObjects,
      osmHistoricPlaces,
      gutenbergBooks
    ] = await Promise.all([
      fetchWikidataEntityId(city),
      fetchWikipediaImages(city, 12),
      coordinates ? fetchHistoricalWeather(coordinates.lat, coordinates.lng, new Date().getFullYear()) : null,
      coordinates ? fetchCurrentWeather(coordinates.lat, coordinates.lng) : null,
      coordinates ? fetchElevation(coordinates.lat, coordinates.lng) : null,
      fetchMetMuseumObjects(city),
      fetchOSMHistoricPlaces(city),
      fetchGutenbergBooks(city)
    ]);

    let events: WikidataEvent[] = [];
    if (wikidataEntityId) {
      console.log(`📊 Fetching events for entity: ${wikidataEntityId}`);
      events = await fetchWikidataEvents(wikidataEntityId, startYear, endYear);
    }

    console.log(`✅ Data fetch complete. Events: ${events.length}, Images: ${images.length}, Museum: ${metMuseumObjects.length}, Historic: ${osmHistoricPlaces.length}, Books: ${gutenbergBooks.length}`);

    return {
      name: wikipediaSummary?.title || geoNamesData?.name || city,
      description: wikipediaSummary?.extract || `Historical information about ${city}`,
      coordinates: geoNamesData ? `${geoNamesData.lat}°N, ${geoNamesData.lng}°E` : 'Coordinates unavailable',
      images,
      events,
      historicalWeather,
      currentWeather,
      elevation: elevation ? `${Math.round(elevation)}m` : 'Elevation unavailable',
      geoData: geoNamesData,
      metMuseumObjects,
      osmHistoricPlaces,
      gutenbergBooks
    };
  } catch (error) {
    console.error('💥 Error fetching city data:', error);
    return null;
  }
}
