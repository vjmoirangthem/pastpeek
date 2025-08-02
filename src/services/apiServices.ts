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
    { lat, lng, year },
    CACHE_TTL.LONG
  ).catch(error => {
    console.error('Error fetching historical weather:', error);
    return null;
  });
}

// Met Museum API Interfaces
export interface MetMuseumObject {
  objectID: number;
  isHighlight: boolean;
  title: string;
  culture: string;
  period: string;
  dynasty: string;
  reign: string;
  portfolio: string;
  artistDisplayName: string;
  artistDisplayBio: string;
  artistNationality: string;
  objectDate: string;
  objectBeginDate: number;
  objectEndDate: number;
  medium: string;
  dimensions: string;
  creditLine: string;
  classification: string;
  department: string;
  objectName: string;
  city: string;
  state: string;
  county: string;
  country: string;
  region: string;
  subregion: string;
  locale: string;
  repository: string;
  objectURL: string;
  primaryImage: string;
  primaryImageSmall: string;
  additionalImages: string[];
  constituents: Array<{
    constituentID: number;
    role: string;
    name: string;
    constituentULAN_URL: string;
    constituentWikidata_URL: string;
    gender: string;
  }>;
  isPublicDomain: boolean;
  rightsAndReproduction: string;
  linkResource: string;
  metadataDate: string;
  tags: any;
  objectWikidata_URL: string;
  isTimelineWork: boolean;
  GalleryNumber: string;
}

export interface MetMuseumSearchResult {
  total: number;
  objectIDs: number[];
}

// Overpass API Interfaces
export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags: {
    [key: string]: string;
  };
}

export interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    timestamp_areas_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

// Met Museum API - Search for objects
export async function fetchMetMuseumSearch(query: string): Promise<MetMuseumSearchResult | null> {
  return cacheService.getOrFetch(
    'met_search',
    async () => {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodedQuery}`
      );
      
      if (!response.ok) {
        throw new Error(`Met Museum search error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    },
    { query },
    CACHE_TTL.VERY_LONG
  ).catch(error => {
    console.error('Error fetching Met Museum search:', error);
    return null;
  });
}

// Met Museum API - Get object details
export async function fetchMetMuseumObject(objectID: number): Promise<MetMuseumObject | null> {
  return cacheService.getOrFetch(
    'met_object',
    async () => {
      const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
      );
      
      if (!response.ok) {
        throw new Error(`Met Museum object error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    },
    { objectID },
    CACHE_TTL.VERY_LONG
  ).catch(error => {
    console.error('Error fetching Met Museum object:', error);
    return null;
  });
}

// Met Museum API - Get multiple objects for a location
export async function fetchMetMuseumArtifacts(city: string, limit: number = 10): Promise<MetMuseumObject[]> {
  try {
    const searchResult = await fetchMetMuseumSearch(city);
    if (!searchResult || !searchResult.objectIDs || searchResult.objectIDs.length === 0) {
      return [];
    }

    // Get details for first few objects
    const objectPromises = searchResult.objectIDs
      .slice(0, limit)
      .map(id => fetchMetMuseumObject(id));

    const objects = await Promise.all(objectPromises);
    
    // Filter out null results and return valid objects
    return objects.filter((obj): obj is MetMuseumObject => obj !== null);
  } catch (error) {
    console.error('Error fetching Met Museum artifacts:', error);
    return [];
  }
}

// Overpass API - Get historic places in a city
export async function fetchHistoricPlaces(cityName: string): Promise<OverpassElement[]> {
  return cacheService.getOrFetch(
    'historic_places',
    async () => {
      const query = `[out:json];area[name="${cityName}"]->.searchArea;(nwr["historic"](area.searchArea););out body;`;
      const encodedQuery = encodeURIComponent(query);
      
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodedQuery}`,
        {
          headers: {
            'User-Agent': 'PastPeek-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }
      
      const data: OverpassResponse = await response.json();
      
      // Filter and process the results
      return data.elements
        .filter(element => 
          element.tags && 
          element.tags.name && 
          element.tags.historic &&
          element.lat && 
          element.lon
        )
        .slice(0, 20); // Limit to 20 results
    },
    { cityName },
    CACHE_TTL.VERY_LONG
  ).catch(error => {
    console.error('Error fetching historic places:', error);
    return [];
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

// Main function to fetch all city data with smart caching
export async function fetchCityData(city: string, startYear?: number, endYear?: number): Promise<any> {
  return cacheService.getOrFetch(
    CACHE_KEYS.CITY_DATA,
    async () => {
      console.log(`Fetching comprehensive data for: ${city}`);
      
      // Fetch all data in parallel with Promise.allSettled for resilience
      const [
        wikipediaSummaryResult,
        wikipediaFullResult,
        geoNamesResult,
        wikidataEntityResult
      ] = await Promise.allSettled([
        fetchWikipediaSummary(city),
        fetchWikipediaFullContent(city),
        fetchGeoNamesData(city),
        fetchWikidataEntityId(city)
      ]);

      // Process initial results
      const wikipediaSummary = wikipediaSummaryResult.status === 'fulfilled' ? wikipediaSummaryResult.value : null;
      const wikipediaFull = wikipediaFullResult.status === 'fulfilled' ? wikipediaFullResult.value : null;
      const geoNames = geoNamesResult.status === 'fulfilled' ? geoNamesResult.value : null;
      const wikidataEntityId = wikidataEntityResult.status === 'fulfilled' ? wikidataEntityResult.value : null;

      // Fetch images and additional data
      const [
        wikipediaImagesResult,
        metArtifactsResult
      ] = await Promise.allSettled([
        fetchWikipediaImages(city, 8),
        fetchMetArtifacts(city, 3)
      ]);

      const wikipediaImages = wikipediaImagesResult.status === 'fulfilled' ? wikipediaImagesResult.value : [];
      const metArtifacts = metArtifactsResult.status === 'fulfilled' ? metArtifactsResult.value : [];

      // Fetch Wikidata events if entity ID is available
      let wikidataEvents: WikidataEvent[] = [];
      if (wikidataEntityId) {
        try {
          wikidataEvents = await fetchWikidataEvents(wikidataEntityId, startYear, endYear);
        } catch (error) {
          console.error('Error fetching Wikidata events:', error);
        }
      }

      // Process Wikipedia sections to extract historical events
      const wikipediaEvents = (wikipediaFull?.sections || [])
        .filter(section => 
          section.title.toLowerCase().includes('history') ||
          section.title.toLowerCase().includes('timeline') ||
          section.title.toLowerCase().includes('events')
        )
        .map((section, index) => {
          // Try to extract years from content
          const yearMatches = section.content.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/g);
          const year = yearMatches ? parseInt(yearMatches[0]) : new Date().getFullYear();
          
          return {
            id: `wiki-section-${index}`,
            date: `${year}-01-01`,
            label: section.title,
            description: section.content.substring(0, 200) + '...',
            type: 'historical',
            year
          };
        });

      // Combine all events
      const allEvents = [...wikidataEvents, ...wikipediaEvents];

      const processedData = {
        city,
        wikipedia: wikipediaSummary,
        wikipediaFull,
        geoNames,
        events: allEvents,
        images: wikipediaImages,
        artifacts: metArtifacts,
        location: {
          name: wikipediaSummary?.title || geoNames?.name || city,
          subtitle: geoNames?.fclName || "Historic Location",
          description: wikipediaSummary?.extract || `Exploring the historical and cultural heritage of ${city}.`,
          coordinates: geoNames ? `${parseFloat(geoNames.lat).toFixed(1)}°N, ${parseFloat(geoNames.lng).toFixed(1)}°E` : "",
          elevation: "",
          weather: {
            temperature: "Loading...",
            condition: "Checking conditions"
          },
          localTime: "Loading...",
          timezone: ""
        },
        summary: {
          totalEvents: allEvents.length,
          totalImages: wikipediaImages.length,
          totalArtifacts: metArtifacts.length,
          hasCoordinates: !!geoNames,
          hasWikipediaContent: !!wikipediaSummary
        }
      };

      console.log(`Data fetching completed for ${city}:`, processedData.summary);
      return processedData;
    },
    { city, startYear, endYear },
    CACHE_TTL.MEDIUM
  ).catch(error => {
    console.error('Error in fetchCityData:', error);
    throw error;
  });
}
