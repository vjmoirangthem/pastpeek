const GEONAMES_USERNAME = 'vjmoirangthem';

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

export interface GeoNamesResult {
  name: string;
  countryName: string;
  adminName1: string;
  lat: string;
  lng: string;
  population?: number;
  fclName: string;
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

// Wikipedia REST API
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

// GeoNames API
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
      return data.geonames[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching GeoNames data:', error);
    return null;
  }
}

// Openverse API for CC images
export async function fetchOpenverseImages(city: string, limit: number = 5): Promise<OpenverseImage[]> {
  try {
    const encodedCity = encodeURIComponent(city);
    const response = await fetch(
      `https://api.openverse.engineering/v1/images/?q=${encodedCity}&license=cc0,by&page_size=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Openverse API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results || [];
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

// Wikidata SPARQL for historical events
export async function fetchWikidataEvents(entityId: string): Promise<WikidataEvent[]> {
  try {
    const sparqlQuery = `
      SELECT DISTINCT ?event ?eventLabel ?date ?typeLabel ?eventDescription WHERE {
        ?event wdt:P276 wd:${entityId} .
        ?event wdt:P585 ?date .
        ?event wdt:P31 ?type .
        ?event rdfs:label ?eventLabel .
        OPTIONAL { ?event schema:description ?eventDescription . }
        FILTER(LANG(?eventLabel) = "en")
        FILTER(LANG(?eventDescription) = "en")
        FILTER(YEAR(?date) >= 1600)
      }
      ORDER BY ?date
      LIMIT 20
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
    
    return data.results.bindings.map((binding: any) => ({
      date: binding.date?.value || '',
      label: binding.eventLabel?.value || 'Historical Event',
      description: binding.eventDescription?.value || 'A significant historical event',
      type: binding.typeLabel?.value || 'event'
    }));
  } catch (error) {
    console.error('Error fetching Wikidata events:', error);
    return [];
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

// Combined data fetcher for a city
export async function fetchCityData(city: string) {
  const [
    wikipediaSummary,
    geoNamesData,
    openverseImages,
    metArtifacts
  ] = await Promise.allSettled([
    fetchWikipediaSummary(city),
    fetchGeoNamesData(city),
    fetchOpenverseImages(city, 6),
    fetchMetArtifacts(city, 2)
  ]);

  // Get Wikidata events if we have a Wikipedia page
  let wikidataEvents: WikidataEvent[] = [];
  if (wikipediaSummary.status === 'fulfilled' && wikipediaSummary.value) {
    try {
      const entityId = await fetchWikidataEntityId(city);
      if (entityId) {
        wikidataEvents = await fetchWikidataEvents(entityId);
      }
    } catch (error) {
      console.error('Error fetching Wikidata events:', error);
    }
  }

  return {
    wikipedia: wikipediaSummary.status === 'fulfilled' ? wikipediaSummary.value : null,
    geoNames: geoNamesData.status === 'fulfilled' ? geoNamesData.value : null,
    images: openverseImages.status === 'fulfilled' ? openverseImages.value : [],
    artifacts: metArtifacts.status === 'fulfilled' ? metArtifacts.value : [],
    events: wikidataEvents
  };
}