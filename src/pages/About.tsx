import { ArrowLeft, ExternalLink, Users, Target, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function About() {
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
          <h1 className="text-4xl font-serif font-bold text-museum-gold">About PastPeek</h1>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-museum-gold" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                PastPeek is an immersive historical timeline platform that brings the past to life through 
                interactive exploration. We combine cutting-edge technology with rich historical data to 
                create an engaging journey through time, making history accessible and fascinating for everyone.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-museum-gold" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To create the world's most comprehensive and interactive historical timeline platform, 
                where users can explore any place and time period through authentic data, stunning visuals, 
                and immersive storytelling.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6">What Makes PastPeek Special</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-Time Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We fetch live historical data from Wikipedia, Wikidata, and other trusted sources 
                  to ensure accuracy and comprehensiveness.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interactive Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Navigate through history with our advanced timeline slider, supporting dates 
                  from 5000 BC to present day with precise year filtering.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rich Multimedia</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Experience history through authentic images, artifacts, and weather data 
                  from the exact time periods you're exploring.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Create Origins */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-museum-gold" />
              About Create Origins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              PastPeek is proudly developed by <strong>Create Origins</strong>, a forward-thinking 
              technology company dedicated to creating innovative digital experiences that educate, 
              inspire, and connect people with knowledge.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Create Origins specializes in building cutting-edge web applications that combine 
              beautiful design with powerful functionality, always with a focus on user experience 
              and accessibility.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="https://createorigins.vercel.app/" target="_blank" rel="noopener noreferrer">
                Visit Create Origins
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Built With Modern Technology</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frontend Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• React 18 with TypeScript</li>
                  <li>• Tailwind CSS for responsive design</li>
                  <li>• Framer Motion for smooth animations</li>
                  <li>• Lucide React for beautiful icons</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Sources & APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Wikipedia & Wikidata APIs</li>
                  <li>• Openverse for historical images</li>
                  <li>• GeoNames for location data</li>
                  <li>• Open-Meteo for historical weather</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}