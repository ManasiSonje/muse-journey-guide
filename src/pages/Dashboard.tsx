import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bot, Compass, Calendar, ArrowRight, MapPin, Clock, Navigation2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import MuseumCard from '@/components/MuseumCard';
import MuseumSearchFilters from '@/components/MuseumSearchFilters';
import { useMuseums } from '@/hooks/useMuseums';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import heroImage from '@/assets/hero-museum.jpg';

const Dashboard = () => {
  const {
    museums,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedType,
    setSelectedType,
    cities,
    types
  } = useMuseums();

  const [tripCity, setTripCity] = useState('');
  const [tripTime, setTripTime] = useState('');
  const [tripDate, setTripDate] = useState<Date>();
  const [tripResults, setTripResults] = useState<any[]>([]);
  const [showTripResults, setShowTripResults] = useState(false);
  const [tripLoading, setTripLoading] = useState(false);

  const handleViewMore = (id: number) => {
    console.log('View museum:', id);
  };

  const handleBookTicket = (id: number) => {
    console.log('Book ticket for:', id);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // City center coordinates (approximate)
  const cityCenters: { [key: string]: { lat: number; lng: number } } = {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Nagpur': { lat: 21.1458, lng: 79.0882 },
    'Nashik': { lat: 19.9975, lng: 73.7898 },
    'Aurangabad': { lat: 19.8762, lng: 75.3433 },
    'Kolhapur': { lat: 16.7050, lng: 74.2433 }
  };

  const handlePlanTrip = async () => {
    if (!tripCity || !tripTime || !tripDate) {
      return;
    }

    setTripLoading(true);
    setShowTripResults(false);

    const { data: cityMuseums } = await supabase
      .from('museums')
      .select('*')
      .ilike('city', `%${tripCity}%`);

    if (!cityMuseums || cityMuseums.length === 0) {
      setTripResults([]);
      setShowTripResults(true);
      setTripLoading(false);
      return;
    }

    // Get day of week from selected date
    const dayOfWeek = format(tripDate, 'EEEE').toLowerCase();
    
    const timeInput = tripTime.toLowerCase();
    const availableMuseums = cityMuseums.filter(museum => {
      if (!museum.detailed_timings) return true;
      
      const timings = museum.detailed_timings as any;
      const dayTiming = timings[dayOfWeek]?.toLowerCase();
      
      // Check if museum is closed on selected day
      if (!dayTiming || dayTiming === 'closed' || dayTiming.includes('closed')) {
        return false;
      }
      
      // Check if time matches
      if (timeInput.includes('morning') || timeInput.includes('am')) {
        return true;
      }
      if (timeInput.includes('afternoon') || timeInput.includes('pm') || timeInput.includes('evening')) {
        return true;
      }
      
      return true;
    });

    // Sort by distance from city center
    const cityCenter = cityCenters[tripCity];
    const museumsWithDistance = availableMuseums.map(museum => {
      let distance = 999; // Default distance for museums without coordinates
      
      if (cityCenter && museum.latitude && museum.longitude) {
        const lat = typeof museum.latitude === 'string' ? parseFloat(museum.latitude) : museum.latitude;
        const lng = typeof museum.longitude === 'string' ? parseFloat(museum.longitude) : museum.longitude;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          distance = calculateDistance(cityCenter.lat, cityCenter.lng, lat, lng);
        }
      }
      
      return { ...museum, distance };
    });

    museumsWithDistance.sort((a, b) => a.distance - b.distance);

    setTripResults(museumsWithDistance.slice(0, 6)); // Show top 6 nearest museums
    setShowTripResults(true);
    setTripLoading(false);

    setTimeout(() => {
      document.getElementById('trip-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background bg-museum-pattern">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-golden/5 via-transparent to-teal/5" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-5xl lg:text-7xl font-bold leading-tight"
                >
                  <span className="text-glow-golden">Discover.</span>
                  <br />
                  <span className="text-glow-teal">Experience.</span>
                  <br />
                  <span className="text-foreground">Remember.</span>
                </motion.h1>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-muted-foreground max-w-lg leading-relaxed"
                >
                  Discover amazing museums across Maharashtra with our smart AI-powered assistant, 
                  <span className="text-teal font-medium"> MuseMate</span>. 
                  Explore rich cultural heritage and create unforgettable experiences.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <EnhancedButton
                  variant="hero"
                  size="xl"
                  onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Museums
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </EnhancedButton>
                
                <Link to="/chatbot">
                  <EnhancedButton variant="museum" size="xl" className="w-full sm:w-auto">
                    <Bot className="w-5 h-5 mr-2" />
                    Meet MuseMate
                  </EnhancedButton>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-elevated">
                <img
                  src={heroImage}
                  alt="Futuristic museum interior"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="search-section" className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Explore Museums in
              <span className="text-glow-golden"> Maharashtra</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover Maharashtra's rich cultural heritage through its museums. Search by name, city, or type to find your perfect visit.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="max-w-5xl mx-auto mb-16">
            <MuseumSearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              cities={cities}
              types={types}
              resultsCount={museums.length}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-golden/20 border-t-golden rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading museums...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">Error loading museums: {error}</p>
              <EnhancedButton 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </EnhancedButton>
            </div>
          )}

          {/* Museums Grid */}
          {!loading && !error && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {museums.length > 0 ? (
                museums.map((museum, index) => (
                  <motion.div
                    key={museum.id}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MuseumCard
                      {...museum}
                      onViewMore={handleViewMore}
                      onBookTicket={handleBookTicket}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No museums found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters to find museums.
                  </p>
                  <EnhancedButton 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('');
                      setSelectedType('');
                    }}
                  >
                    Clear Filters
                  </EnhancedButton>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Trip Planning Section */}
      <section className="py-16 bg-gradient-to-r from-card/30 via-card/20 to-card/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Generate Your
              <span className="text-glow-teal"> Personalized Trip</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plan your perfect museum itinerary based on your city and preferred visiting time.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass rounded-3xl p-8 border border-border/20 shadow-elevated">
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                    <Compass className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">Smart Trip Planner</h3>
                    <p className="text-muted-foreground">Filter museums by city and visiting hours</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                      <MapPin className="w-4 h-4 text-teal" />
                      <span>Select City</span>
                    </label>
                    <Select value={tripCity} onValueChange={setTripCity}>
                      <SelectTrigger className="bg-background/50 border-border/50 hover:border-teal/50 transition-colors">
                        <SelectValue placeholder="Choose a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                      <Calendar className="w-4 h-4 text-golden" />
                      <span>Select Date</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <EnhancedButton
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background/50 hover:bg-background/70",
                            !tripDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {tripDate ? format(tripDate, "PPP") : "Pick a date"}
                        </EnhancedButton>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={tripDate}
                          onSelect={setTripDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-foreground">
                      <Clock className="w-4 h-4 text-golden" />
                      <span>Preferred Time</span>
                    </label>
                    <Select value={tripTime} onValueChange={setTripTime}>
                      <SelectTrigger className="bg-background/50 border-border/50 hover:border-golden/50 transition-colors">
                        <SelectValue placeholder="Choose time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <EnhancedButton 
                  variant="premium" 
                  size="xl" 
                  className="w-full"
                  onClick={handlePlanTrip}
                  disabled={!tripCity || !tripTime || !tripDate || tripLoading}
                >
                  {tripLoading ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Finding Nearest Museums...
                    </>
                  ) : (
                    <>
                      <Navigation2 className="w-5 h-5 mr-2" />
                      Generate Trip Plan
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </EnhancedButton>
              </div>
            </div>
          </motion.div>

          {/* Trip Results */}
          {showTripResults && (
            <motion.div
              id="trip-results"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-6xl mx-auto mt-12"
            >
              <div className="glass rounded-3xl p-8 border border-teal/20 glow-teal">
                <div className="space-y-4 mb-6">
                  <h3 className="font-display text-2xl font-bold text-foreground flex items-center">
                    <Navigation2 className="w-6 h-6 mr-3 text-teal" />
                    Your Trip Plan for {tripCity}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-golden" />
                      <span>{tripDate ? format(tripDate, 'EEEE, MMMM d, yyyy') : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal" />
                      <span className="capitalize">{tripTime}</span>
                    </div>
                  </div>
                </div>

                {tripResults.length > 0 ? (
                  <>
                    <p className="text-muted-foreground mb-6 flex items-center gap-2">
                      <span className="font-semibold text-foreground">{tripResults.length}</span> 
                      nearest museum{tripResults.length !== 1 ? 's' : ''} available on {tripDate ? format(tripDate, 'EEEE') : 'the selected day'} during {tripTime}
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tripResults.map((museum, index) => (
                        <div key={museum.id} className="relative">
                          {museum.distance && museum.distance < 999 && (
                            <div className="absolute -top-2 -right-2 z-10 bg-teal/90 text-background px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                              <Navigation2 className="w-3 h-3" />
                              {museum.distance.toFixed(1)} km
                            </div>
                          )}
                          <MuseumCard
                            {...museum}
                            onViewMore={handleViewMore}
                            onBookTicket={handleBookTicket}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">No museums found</h4>
                    <p className="text-muted-foreground">
                      No museums found in {tripCity} that are open on {tripDate ? format(tripDate, 'EEEE') : 'the selected day'} during {tripTime}. Try a different date, time, or city.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Chatbot CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="glass-strong rounded-3xl p-12 border border-golden/20 glow-golden">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="font-display text-4xl font-bold text-foreground">
                    Meet <span className="text-glow-golden">MuseMate</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Your personal museum booking assistant. Get instant help with ticket bookings, 
                    exhibition information, and travel recommendations.
                  </p>
                </div>
                
                <Link to="/chatbot">
                  <EnhancedButton variant="hero" size="xl" className="animate-glow-pulse">
                    <Bot className="w-6 h-6 mr-3" />
                    Start Chatting with MuseMate
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </EnhancedButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
