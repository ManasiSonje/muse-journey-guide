import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bot, Compass, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import MuseumCard from '@/components/MuseumCard';
import MuseumSearchFilters from '@/components/MuseumSearchFilters';
import { useMuseums } from '@/hooks/useMuseums';
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

  const handleViewMore = (id: number) => {
    console.log('View museum:', id);
  };

  const handleBookTicket = (id: number) => {
    console.log('Book ticket for:', id);
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
              Let our AI create a perfect museum itinerary based on your interests, location, and available time.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass rounded-3xl p-8 border border-border/20 shadow-elevated">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center">
                      <Compass className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-foreground">Smart Trip Planner</h3>
                      <p className="text-muted-foreground">AI-powered itinerary generation</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-teal" />
                      <span>Choose your city or location</span>
                    </div>
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Calendar className="w-5 h-5 text-golden" />
                      <span>Set your preferred dates and time</span>
                    </div>
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <span>Select your interests and preferences</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <EnhancedButton variant="premium" size="xl" className="w-full">
                    <Compass className="w-5 h-5 mr-2" />
                    Plan My Trip
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </EnhancedButton>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Get a detailed itinerary with timings, locations, and recommendations
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
