import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Smile, Play, Search, MapPin, Calendar, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';
import chatbotAvatar from '@/assets/chatbot-avatar.png';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm MuseMate, your personal museum booking assistant. I can help you find museums, book tickets, and plan your cultural journey. What would you like to explore today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Trip planning state
  const [tripLocation, setTripLocation] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripHours, setTripHours] = useState('');
  
  // Museum video state
  const [selectedMuseum, setSelectedMuseum] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        "I'd love to help you with that! Can you tell me which city you're interested in visiting?",
        "That's a great choice! Let me find some amazing museums for you. How many tickets do you need?",
        "Perfect! I can help you book tickets. What date were you thinking of visiting?",
        "Excellent! I'll generate a personalized itinerary for you. What are your main interests - art, history, science, or culture?",
        "Great question! The museum has fascinating exhibits. Would you like me to show you their virtual tour or book tickets directly?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    simulateBotResponse(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateTrip = () => {
    if (!tripLocation || !tripDate || !tripHours) return;
    
    const tripMessage: Message = {
      id: Date.now().toString(),
      content: `I'd like to plan a trip in ${tripLocation} on ${tripDate} for ${tripHours} hours. Can you create an itinerary for me?`,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, tripMessage]);
    simulateBotResponse(`Trip planning request: ${tripLocation}, ${tripDate}, ${tripHours} hours`);
    
    // Clear form
    setTripLocation('');
    setTripDate('');
    setTripHours('');
  };

  const searchYouTubeVideos = async (museumName: string) => {
    if (!museumName.trim()) return;
    
    setVideoLoading(true);
    setVideoError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query: museumName }
      });
      
      if (error) {
        console.error('YouTube API Error:', error);
        setVideoError('Unable to load video right now. Please try again later.');
        setVideos([]);
        return;
      }
      
      if (data && data.hasResults && data.videos.length > 0) {
        setVideos(data.videos);
        setVideoError(null);
      } else {
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
    if (!selectedMuseum) return;
    
    const museumMessage: Message = {
      id: Date.now().toString(),
      content: `Can you show me information about ${selectedMuseum}? I'd like to see videos and learn more about their exhibitions.`,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, museumMessage]);
    simulateBotResponse(`Museum search: ${selectedMuseum}`);
    
    // Search for YouTube videos
    await searchYouTubeVideos(selectedMuseum);
    
    setSelectedMuseum('');
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
                    <p className="text-sm text-muted-foreground">AI-powered itinerary</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Input
                    placeholder="City/Location"
                    value={tripLocation}
                    onChange={(e) => setTripLocation(e.target.value)}
                    className="glass border-border/20"
                  />
                  <Input
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="glass border-border/20"
                  />
                  <Input
                    placeholder="Available hours (e.g., 6)"
                    value={tripHours}
                    onChange={(e) => setTripHours(e.target.value)}
                    className="glass border-border/20"
                  />
                  <EnhancedButton
                    variant="premium"
                    size="sm"
                    onClick={generateTrip}
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Trip
                  </EnhancedButton>
                </div>
              </Card>
            </div>

            {/* Right Side - Chatbot */}
            <div className="lg:col-span-3">
              <Card className="glass border-border/20 h-full flex flex-col">
                
                {/* Chat Header */}
                <div className="p-6 border-b border-border/20">
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
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-teal/20 text-foreground border border-teal/30 glow-teal'
                              : 'bg-golden/20 text-foreground border border-golden/30 glow-golden'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-60 mt-2 block">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-golden/20 border border-golden/30 p-4 rounded-2xl">
                          <div className="flex space-x-1">
                            <motion.div
                              className="w-2 h-2 bg-golden rounded-full"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-golden rounded-full"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-golden rounded-full"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-border/20">
                  {!loading && !user ? (
                    /* Unauthorized State */
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="🔒 Please Login or Signup to start chatting with MuseMate"
                            disabled
                            className="h-12 pr-20 glass border-border/20 bg-muted/30 cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
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
                  ) : (
                    /* Authorized State */
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Type your message here..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="h-12 pr-20 glass border-border/20 focus:border-golden"
                          disabled={loading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          <EnhancedButton variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                            <Smile className="w-4 h-4" />
                          </EnhancedButton>
                          <EnhancedButton variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
                            <Mic className="w-4 h-4" />
                          </EnhancedButton>
                        </div>
                      </div>
                      <EnhancedButton
                        variant="hero"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || loading}
                        className="h-12 w-12"
                      >
                        <Send className="w-5 h-5" />
                      </EnhancedButton>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;