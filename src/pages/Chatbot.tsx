import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Play, Search, MapPin, Calendar, Lock, Clock, Navigation2, ArrowRight, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';
import MuseumCard from '@/components/MuseumCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useMuseums } from '@/hooks/useMuseums';
import { cn } from '@/lib/utils';
import chatbotAvatar from '@/assets/chatbot-avatar.png';
import { ChatbotFlowService, ConversationState } from '@/services/chatbotFlows';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  isLive?: boolean;
  platform: 'youtube' | 'vimeo' | 'dailymotion' | 'fallback';
  embedUrl: string;
}

const Chatbot = () => {
  const { user, loading } = useAuth();
  const { cities } = useMuseums();
  const [flowService] = useState(() => new ChatbotFlowService());
  const [conversationState, setConversationState] = useState<ConversationState>(() => 
    flowService.getInitialState()
  );
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMuseumId, setSelectedMuseumId] = useState<string | null>(null);

  // Trip planning state
  const [tripCity, setTripCity] = useState('');
  const [tripDate, setTripDate] = useState<Date>();
  const [tripHours, setTripHours] = useState('');
  const [tripResults, setTripResults] = useState<any[]>([]);
  const [showTripResults, setShowTripResults] = useState(false);
  const [tripLoading, setTripLoading] = useState(false);
  
  // Museum video state
  const [selectedMuseum, setSelectedMuseum] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleOptionSelect = async (optionId: string) => {
    if (!user) return;
    
    setIsProcessing(true);
    const response = flowService.handleOptionSelect(optionId);
    setConversationState(response.nextState);
    setIsProcessing(false);
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim() || !user || isProcessing) return;
    
    setIsProcessing(true);
    console.log('Input submitted:', inputValue);
    console.log('Current state:', conversationState);
    
    try {
      const response = await flowService.processUserInput(inputValue, conversationState);
      console.log('Flow response:', response);
      
      console.log('Setting new state:', response.nextState);
      setConversationState(response.nextState);
      setInputValue('');
    } catch (error) {
      console.error('Error processing input:', error);
      setConversationState(flowService.resetToMenu());
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToMenu = () => {
    setConversationState(flowService.getInitialState());
    setInputValue('');
    setSelectedMuseumId(null);
  };

  // Handle museum query parameter from Dashboard
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const museumId = searchParams.get('museum');
    if (museumId && user) {
      setSelectedMuseumId(museumId);
      fetchAndDisplayMuseumDetails(museumId);
    }
  }, [searchParams, user]);

  const fetchAndDisplayMuseumDetails = async (museumId: string) => {
    try {
      const { data: museum, error } = await supabase
        .from('museums')
        .select('*')
        .eq('id', museumId)
        .maybeSingle();

      if (error || !museum) {
        setConversationState({
          currentFlow: 'menu',
          awaitingInput: null,
          currentMessage: "Sorry, I couldn't find that museum. How else can I help you?",
          showInput: false,
          showButtons: true
        });
        return;
      }

      let details = `**${museum.name}**

📍 ${museum.city} | 🏛️ ${museum.type || 'Museum'}
⏰ ${museum.timings || 'Contact for timings'}
💰 ${museum.entry_fee || 'Contact for pricing'}

${museum.description || 'No description available'}`;

      setConversationState({
        currentFlow: null,
        awaitingInput: null,
        currentMessage: details,
        showInput: false,
        showButtons: true
      });
    } catch (error) {
      console.error('Error fetching museum details:', error);
    }
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

  const generateTrip = async () => {
    if (!tripCity || !tripHours || !tripDate) {
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
    
    // Always show top 3 museums
    const maxMuseums = 3;
    
    const availableMuseums = cityMuseums.filter(museum => {
      if (!museum.detailed_timings) return true;
      
      const timings = museum.detailed_timings as any;
      const dayTiming = timings[dayOfWeek]?.toLowerCase();
      
      // Check if museum is closed on selected day
      if (!dayTiming || dayTiming === 'closed' || dayTiming.includes('closed')) {
        return false;
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

    setTripResults(museumsWithDistance.slice(0, maxMuseums));
    setShowTripResults(true);
    setTripLoading(false);

    setTimeout(() => {
      document.getElementById('trip-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleViewMore = (id: string) => {
    console.log('View more:', id);
  };

  const handleBookTicket = (id: string) => {
    console.log('Book ticket for:', id);
  };

  const searchYouTubeVideos = async (museumName: string) => {
    if (!museumName.trim()) {
      console.log('Empty museum name, skipping search');
      return;
    }
    
    console.log('Starting video search for:', museumName);
    setVideoLoading(true);
    setVideoError(null);
    
    try {
      console.log('Invoking youtube-search function...');
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query: museumName }
      });
      
      console.log('YouTube search response:', { data, error });
      
      if (error) {
        console.error('YouTube API Error:', error);
        setVideoError('Unable to load video right now. Please try again later.');
        setVideos([]);
        return;
      }
      
      if (data && data.hasResults && data.videos.length > 0) {
        console.log(`Found ${data.videos.length} videos`);
        setVideos(data.videos);
        setVideoError(null);
      } else {
        console.log('No results from primary search, trying fallback');
        // Try fallback search with more general terms
        await searchFallbackVideos(museumName);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      setVideoError('Unable to load video right now. Please try again later.');
      setVideos([]);
    } finally {
      setVideoLoading(false);
    }
  };

  const searchFallbackVideos = async (originalQuery: string) => {
    try {
      // Try searching for general museum content if specific museum has no videos
      const fallbackQueries = [
        `${originalQuery.split(' ')[0]} museum tour`, // First word + museum tour
        'museum virtual tour',
        'famous museums documentary'
      ];

      for (const fallbackQuery of fallbackQueries) {
        const { data, error } = await supabase.functions.invoke('youtube-search', {
          body: { query: fallbackQuery }
        });
        
        if (!error && data && data.hasResults && data.videos.length > 0) {
          setVideos(data.videos);
          setVideoError(`No videos found for "${originalQuery}". Showing related museum content instead.`);
          return;
        }
      }
      
      // If all fallbacks fail
      setVideos([]);
      setVideoError('No video available for this museum, please try another search.');
    } catch (error) {
      console.error('Fallback search failed:', error);
      setVideos([]);
      setVideoError('No video available for this museum, please try another search.');
    }
  };

  const searchMuseum = async () => {
    if (!selectedMuseum.trim()) {
      console.log('No museum selected');
      return;
    }
    
    console.log('Searching for museum:', selectedMuseum);
    
    // Search for YouTube videos
    await searchYouTubeVideos(selectedMuseum);
    
    // Keep the search term visible until results load
    // setSelectedMuseum('');
  };

  return (
    <div className="min-h-screen bg-background bg-museum-pattern">
      <Navigation />
      
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-6 h-[calc(100vh-8rem)]">
          <div className="grid lg:grid-cols-4 gap-6 h-full">
            
            {/* Left Side - Video & Trip Planner */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Museum Video Section */}
              <Card className="glass border-border/20 p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Museum Videos</h3>
                    <p className="text-sm text-muted-foreground">Explore virtual tours</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Input
                    placeholder="Search museum name..."
                    value={selectedMuseum}
                    onChange={(e) => setSelectedMuseum(e.target.value)}
                    className="glass border-border/20"
                  />
                  <EnhancedButton
                    variant="museum"
                    size="sm"
                    onClick={searchMuseum}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    View Museum
                  </EnhancedButton>
                </div>
                
                {/* Video Embed */}
                <YouTubeVideoEmbed 
                  videos={videos}
                  query={selectedMuseum}
                  loading={videoLoading}
                  error={videoError}
                />
              </Card>

              {/* Trip Planner Section */}
              <Card className="glass border-border/20 p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Trip Planner</h3>
                    <p className="text-sm text-muted-foreground">Plan your museum visit</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">City</label>
                    <Select value={tripCity} onValueChange={setTripCity}>
                      <SelectTrigger className="glass border-border/20">
                        <SelectValue placeholder="Select city" />
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
                    <label className="text-xs text-muted-foreground">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <EnhancedButton
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal glass",
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
                    <label className="text-xs text-muted-foreground">Hours</label>
                    <Select value={tripHours} onValueChange={setTripHours}>
                      <SelectTrigger className="glass border-border/20">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <EnhancedButton
                    variant="premium"
                    size="sm"
                    onClick={generateTrip}
                    className="w-full"
                    disabled={!tripCity || !tripHours || !tripDate || tripLoading}
                  >
                    {tripLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Finding Museums...
                      </>
                    ) : (
                      <>
                        <Navigation2 className="w-4 h-4 mr-2" />
                        Generate Trip
                      </>
                    )}
                  </EnhancedButton>
                </div>
              </Card>
            </div>

            {/* Right Side - Chatbot */}
            <div className="lg:col-span-3">
              <Card className="glass border-border/20 h-full flex flex-col">
                
                {/* Chat Header */}
                <div className="p-6 border-b border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={chatbotAvatar}
                          alt="MuseMate Avatar"
                          className="w-12 h-12 rounded-full border-2 border-golden/20"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-semibold text-foreground">MuseMate</h2>
                        <p className="text-sm text-muted-foreground">Your Museum Booking Assistant</p>
                      </div>
                    </div>
                    
                    {conversationState.currentFlow !== 'menu' && (
                      <EnhancedButton
                        variant="ghost"
                        size="sm"
                        onClick={resetToMenu}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ← Back to Menu
                      </EnhancedButton>
                    )}
                  </div>
                </div>

                {/* Chatbot Content Area */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <div className="max-w-2xl mx-auto w-full space-y-6">
                    
                    {/* Current Message */}
                    <div className="text-center">
                      <motion.div 
                        key={conversationState.currentMessage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-golden/20 border border-golden/30 p-6 rounded-2xl glow-golden"
                      >
                        <div className="text-foreground whitespace-pre-line text-left">
                          {conversationState.currentMessage.split('\n').map((line, i) => {
                            // Handle bold text
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return (
                                <h3 key={i} className="font-display text-xl font-semibold mb-3 text-center">
                                  {line.replace(/\*\*/g, '')}
                                </h3>
                              );
                            }
                            // Handle emoji lines (details)
                            if (line.match(/^[📍🏛️⏰💰📞]/)) {
                              return (
                                <p key={i} className="text-sm mb-2 flex items-start gap-2">
                                  <span>{line}</span>
                                </p>
                              );
                            }
                            // Regular text
                            return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                          })}
                        </div>
                      </motion.div>
                    </div>

                    {/* Option Buttons */}
                    {conversationState.showButtons && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {/* Show booking link button if available */}
                        {conversationState.tempData?.bookingLink ? (
                          <a
                            href={conversationState.tempData.bookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="md:col-span-2"
                          >
                            <EnhancedButton
                              variant="premium"
                              className="w-full h-16 flex items-center justify-center gap-3"
                            >
                              <span className="text-2xl">🎫</span>
                              <span className="text-base font-semibold">
                                Book {conversationState.tempData.museumName} Now
                              </span>
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </EnhancedButton>
                          </a>
                        ) : (
                          flowService.getMenuOptions().map((option) => (
                            <EnhancedButton
                              key={option.id}
                              variant="museum"
                              className="h-16 flex flex-col items-center justify-center space-y-2"
                              onClick={() => handleOptionSelect(option.id)}
                              disabled={isProcessing}
                            >
                              <span className="text-2xl">{option.icon}</span>
                              <span className="text-sm font-medium">{option.label}</span>
                            </EnhancedButton>
                          ))
                        )}
                      </motion.div>
                    )}

                    {/* Input Field */}
                    {conversationState.showInput && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex space-x-3">
                          <Input
                            placeholder={conversationState.inputPlaceholder || "Enter your response..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleInputSubmit();
                              }
                            }}
                            className="flex-1 h-12 glass border-border/20 focus:border-golden"
                            disabled={isProcessing}
                          />
                          <EnhancedButton
                            variant="hero"
                            size="icon"
                            onClick={handleInputSubmit}
                            disabled={!inputValue.trim() || isProcessing}
                            className="h-12 w-12"
                          >
                            <Send className="w-5 h-5" />
                          </EnhancedButton>
                        </div>
                        
                        {isProcessing && (
                          <div className="text-center">
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-muted-foreground"
                            >
                              Processing...
                            </motion.p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Unauthorized State */}
                {!loading && !user && (
                  <div className="p-6 border-t border-border/20">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Please login to start chatting with MuseMate</p>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-3">
                        <Link to="/login">
                          <EnhancedButton variant="hero" size="sm">
                            Login
                          </EnhancedButton>
                        </Link>
                        <span className="text-muted-foreground">or</span>
                        <Link to="/signup">
                          <EnhancedButton variant="premium" size="sm">
                            Sign Up
                          </EnhancedButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Trip Results */}
          {showTripResults && (
            <motion.div
              id="trip-results"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-6xl mx-auto mt-6"
            >
              <Card className="glass border-teal/20 p-8 glow-teal">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-bold text-foreground flex items-center">
                      <Navigation2 className="w-6 h-6 mr-3 text-teal" />
                      Your Trip Plan for {tripCity}
                    </h3>
                    <EnhancedButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTripResults(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </EnhancedButton>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-golden" />
                      <span>{tripDate ? format(tripDate, 'EEEE, MMMM d, yyyy') : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal" />
                      <span>{tripHours} hours</span>
                    </div>
                  </div>
                </div>

                {tripResults.length > 0 ? (
                  <>
                    <p className="text-muted-foreground mb-6 flex items-center gap-2">
                      <span className="font-semibold text-foreground">{tripResults.length}</span> 
                      museum{tripResults.length !== 1 ? 's' : ''} recommended for your {tripHours}-hour visit
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {tripResults.map((museum, index) => (
                        <motion.div
                          key={museum.id}
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <MuseumCard
                            {...museum}
                            onViewMore={handleViewMore}
                            onBookTicket={handleBookTicket}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No museums found for {tripCity} on {tripDate ? format(tripDate, 'EEEE') : 'the selected day'}.
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;