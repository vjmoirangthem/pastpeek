import { ArrowLeft, Search, Clock, Map, Image, Volume2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Help() {
  const features = [
    {
      icon: Search,
      title: 'Search Places',
      description: 'Use the search bar to explore any city or location in history'
    },
    {
      icon: Clock,
      title: 'Timeline Navigation',
      description: 'Drag the timeline slider to travel through different time periods'
    },
    {
      icon: Map,
      title: 'Historical Context',
      description: 'View geographical and cultural information for each location'
    },
    {
      icon: Image,
      title: 'Visual History',
      description: 'Explore historical images and artifacts from museum collections'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Listen to historical content with our built-in audio features'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access PastPeek seamlessly on any device'
    }
  ];

  const faqs = [
    {
      question: 'How do I search for a specific place?',
      answer: 'Use the search bar at the top of the page. Type any city, location, or place name and select from the suggestions. The platform will load historical data for that location.'
    },
    {
      question: 'How does the timeline work?',
      answer: 'The timeline slider allows you to navigate through history from 5000 BC to the present day. Drag the slider or use the year range inputs to filter events by specific time periods.'
    },
    {
      question: 'Can I listen to the historical content?',
      answer: 'Yes! Click the speaker icon on any article or event card to have the content read aloud using text-to-speech technology.'
    },
    {
      question: 'Where does the historical data come from?',
      answer: 'All data comes from trusted, open-access sources including Wikipedia, Wikidata, and various museum collections. Visit our Sources page for complete details.'
    },
    {
      question: 'How accurate is the historical information?',
      answer: 'We source data from reputable institutions and apply quality filters to ensure accuracy. However, always cross-reference important historical facts with academic sources.'
    },
    {
      question: 'Can I use this for educational purposes?',
      answer: 'Absolutely! PastPeek is designed to be an educational tool. All content is properly sourced and can be used for learning and research purposes.'
    },
    {
      question: 'Is PastPeek free to use?',
      answer: 'Yes, PastPeek is completely free to use. We believe historical knowledge should be accessible to everyone.'
    },
    {
      question: 'How do I report incorrect information?',
      answer: 'If you find any errors or issues, please contact us through the Contact page. We take data accuracy seriously and will investigate all reports promptly.'
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
          <h1 className="text-4xl font-serif font-bold text-museum-gold">Help & Support</h1>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started with PastPeek</CardTitle>
            <CardDescription>
              Learn how to explore history using our interactive timeline platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border">
                    <Icon className="w-5 h-5 text-museum-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step by Step Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Use PastPeek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-museum-gold text-primary-foreground font-bold text-sm flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium mb-1">Search for a Location</h3>
                  <p className="text-muted-foreground">Enter any city or place name in the search bar to begin your historical journey.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-museum-gold text-primary-foreground font-bold text-sm flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium mb-1">Explore the Timeline</h3>
                  <p className="text-muted-foreground">Use the timeline slider to navigate through different historical periods and see relevant events.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-museum-gold text-primary-foreground font-bold text-sm flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium mb-1">Discover Content</h3>
                  <p className="text-muted-foreground">Click on event cards to read detailed historical information, view images, and explore artifacts.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-museum-gold text-primary-foreground font-bold text-sm flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-medium mb-1">Listen and Learn</h3>
                  <p className="text-muted-foreground">Use the text-to-speech feature to listen to historical content while you explore.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}