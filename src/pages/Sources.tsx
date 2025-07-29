import { ArrowLeft, ExternalLink, Database, Image, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Sources() {
  const dataSources = [
    {
      name: 'Wikipedia',
      icon: Globe,
      description: 'Free encyclopedia with comprehensive historical content',
      url: 'https://en.wikipedia.org/',
      apis: ['REST API v1 for summaries', 'Parse API for full content'],
      usage: 'Historical summaries, articles, and basic information about places and events'
    },
    {
      name: 'Wikidata',
      icon: Database,
      description: 'Structured knowledge base with historical events and entities',
      url: 'https://www.wikidata.org/',
      apis: ['SPARQL Endpoint', 'Entity Search API'],
      usage: 'Timeline events, historical dates, and structured historical data'
    },
    {
      name: 'Openverse',
      icon: Image,
      description: 'Open-licensed images and media content',
      url: 'https://openverse.org/',
      apis: ['Images API v1'],
      usage: 'Historical images, photographs, and visual content with proper licensing'
    },
    {
      name: 'GeoNames',
      icon: Globe,
      description: 'Geographical database with location information',
      url: 'https://www.geonames.org/',
      apis: ['Search API', 'Location API'],
      usage: 'Location coordinates, country information, and geographical context'
    },
    {
      name: 'Open-Meteo',
      icon: Database,
      description: 'Historical weather data archive',
      url: 'https://open-meteo.com/',
      apis: ['Archive API'],
      usage: 'Historical weather patterns and climate data for specific dates and locations'
    },
    {
      name: 'Met Museum',
      icon: Image,
      description: 'Metropolitan Museum of Art collection',
      url: 'https://www.metmuseum.org/',
      apis: ['Collection API'],
      usage: 'Historical artifacts, artworks, and cultural objects from museum collections'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timeline
            </Link>
          </Button>
          <h1 className="text-4xl font-serif font-bold text-museum-gold">Data Sources</h1>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trusted Historical Data</CardTitle>
            <CardDescription>
              PastPeek aggregates data from multiple trusted, open-access sources to provide 
              comprehensive and accurate historical information. All content is properly 
              attributed and sourced from reputable institutions and databases.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Data Sources Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {dataSources.map((source, index) => {
            const Icon = source.icon;
            return (
              <Card key={index} className="transition-all hover:shadow-lg hover:border-museum-gold/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-museum-gold" />
                    {source.name}
                  </CardTitle>
                  <CardDescription>{source.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">APIs Used:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {source.apis.map((api, apiIndex) => (
                        <li key={apiIndex}>• {api}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">How We Use It:</h4>
                    <p className="text-sm text-muted-foreground">{source.usage}</p>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      Visit Source
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Processing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Processing & Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Content Filtering</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Advanced REGEX parsing for clean content extraction</li>
                  <li>• Duplicate event removal and consolidation</li>
                  <li>• Date normalization and historical accuracy checks</li>
                  <li>• Content categorization by event type</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Image Licensing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Only CC0 and CC-BY licensed images</li>
                  <li>• Proper attribution for all visual content</li>
                  <li>• Source verification and quality filtering</li>
                  <li>• Cultural sensitivity and appropriateness checks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attribution & Licensing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              All content displayed on PastPeek is properly attributed to its original sources. 
              We respect copyright and licensing requirements, using only open-access data and 
              properly licensed media content.
            </p>
            <p className="text-muted-foreground text-sm">
              If you believe any content is improperly attributed or violates licensing terms, 
              please contact us immediately and we will address the issue promptly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}