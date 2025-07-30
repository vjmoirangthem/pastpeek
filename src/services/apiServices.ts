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

// Wikipedia REST API - Summary
export async function fetchWikipediaSummary(city: string): Promise<WikipediaSummary | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching Wikipedia summary:', error);
    return null;
  }
}

// Wikipedia Full Content with REGEX parsing
export async function fetchWikipediaFullContent(city: string): Promise<WikipediaFullContent | null> {
  try {
    const encodedCity = encodeURIComponent(city.replace(/\s+/g, '_'));
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodedCity}&format=json&origin=*`);
    
    if (!response.ok) {
      throw new Error(`Wikipedia Parse API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      return null;
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
  } catch (error) {
    console.error('Error fetching Wikipedia full content:', error);
    return null;
  }
}

// GeoNames API - Single Location
export async function fetchGeoNamesData(city: string): Promise<GeoNamesResult | null> {
  try {
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
    
    return null;
  } catch (error) {
    console.error('Error fetching GeoNames data:', error);
    return null;
  }
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

// Openverse API for CC images with time period filtering
export async function fetchOpenverseImages(city: string, timePeriod?: string, limit: number = 8): Promise<OpenverseImage[]> {
  try {
    const searchQuery = timePeriod ? `${city} ${timePeriod}` : city;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Use working Openverse endpoint
    const response = await fetch(
      `https://api.openverse.engineering/v1/images?q=${encodedQuery}&license=cc0,by&page_size=${limit * 2}`
    );
    
    if (!response.ok) {
      throw new Error(`Openverse API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }
    
    // Filter and format results
    const images = data.results
      .filter((img: any) => img.url && img.thumbnail)
      .slice(0, limit)
      .map((img: any) => ({
        id: img.id || Math.random().toString(),
        title: img.title || `${city} Historical Image`,
        url: img.url,
        thumbnail: img.thumbnail || img.url,
        creator: img.creator || 'Unknown',
        license: img.license || 'cc0',
        license_url: img.license_url || '',
        source: img.source || 'openverse'
      }));
    
    return images;
  } catch (error) {
    console.error('Error fetching Openverse images:', error);
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

// Fetch historical weather data from Open-Meteo
export async function fetchHistoricalWeather(lat: number, lng: number, year: number): Promise<any> {
  try {
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
      const avgMaxTemp = data.daily.temperature_2m_max.reduce((a: number, b: number) => a + b, 0) / data.daily.temperature_2m_max.length;
      const avgMinTemp = data.daily.temperature_2m_min.reduce((a: number, b: number) => a + b, 0) / data.daily.temperature_2m_min.length;
      const totalPrecip = data.daily.precipitation_sum.reduce((a: number, b: number) => a + b, 0);
      
      return {
        temperature: Math.round((avgMaxTemp + avgMinTemp) / 2),
        maxTemp: Math.round(avgMaxTemp),
        minTemp: Math.round(avgMinTemp),
        precipitation: Math.round(totalPrecip * 10) / 10,
        condition: totalPrecip > 5 ? 'Rainy' : totalPrecip > 1 ? 'Partly Cloudy' : 'Clear',
        icon: totalPrecip > 5 ? '🌧️' : totalPrecip > 1 ? '⛅' : '☀️'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
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

// Combined data fetcher for a city with enhanced filtering
export async function fetchCityData(city: string, startYear?: number, endYear?: number) {
  const [
    wikipediaSummary,
    wikipediaContent,
    geoNamesData,
    openverseImages,
    metArtifacts
  ] = await Promise.allSettled([
    fetchWikipediaSummary(city),
    fetchWikipediaFullContent(city),
    fetchGeoNamesData(city),
    fetchOpenverseImages(city, undefined, 12),
    fetchMetArtifacts(city, 3)
  ]);

  // Get Wikidata events with date filtering
  let wikidataEvents: WikidataEvent[] = [];
  let weatherData: WeatherData[] = [];
  
  if (wikipediaSummary.status === 'fulfilled' && wikipediaSummary.value) {
    try {
      const entityId = await fetchWikidataEntityId(city);
      if (entityId) {
        wikidataEvents = await fetchWikidataEvents(entityId, startYear, endYear);
      }
    } catch (error) {
      console.error('Error fetching Wikidata events:', error);
    }
  }


  // Process and filter events
  const filteredEvents = wikidataEvents.map(categorizeEvent);
  const uniqueEvents = removeDuplicateEvents(filteredEvents);

  return {
    wikipedia: wikipediaSummary.status === 'fulfilled' ? wikipediaSummary.value : null,
    wikipediaContent: wikipediaContent.status === 'fulfilled' ? wikipediaContent.value : null,
    geoNames: geoNamesData.status === 'fulfilled' ? geoNamesData.value : null,
    images: openverseImages.status === 'fulfilled' ? openverseImages.value : [],
    artifacts: metArtifacts.status === 'fulfilled' ? metArtifacts.value : [],
    events: uniqueEvents
  };
}