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
import { useMuseumData } from '@/hooks/useMuseumData';
import chatbotAvatar from '@/assets/chatbot-avatar.png';
import { ChatbotFlowService, ConversationState } from '@/services/chatbotFlows';

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
  const { getMuseumByName, generateMuseumResponse } = useMuseumData();
  const [flowService] = useState(() => new ChatbotFlowService());
  const [conversationState, setConversationState] = useState<ConversationState>({ 
    currentFlow: 'menu', 
    awaitingInput: null 
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm MuseMate, your personal museum booking assistant. I can help you with:\n\n🎫 **Museum Booking** - Get booking links for museums\n🏛️ **View Museum Details** - See detailed information about museums\n⏰ **Check Available Time Slots** - View museum opening hours and availability\n🗺️ **Suggest Museums** - Find museums in your preferred city\n\nJust type what you'd like to do, or ask me anything about museums!",
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

  const simulateBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      // First, try to process with structured conversation flows
      const flowResponse = await flowService.processUserInput(userMessage, conversationState);
      
      if (flowResponse.message) {
        // Update conversation state
        setConversationState(flowResponse.nextState);
        
        const botMessage: Message = {
          id: Date.now().toString(),
          content: flowResponse.message,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }

      // If no structured flow matched, try database search
      const databaseResponse = await searchDatabaseForAnswer(userMessage);
      
      if (databaseResponse) {
        const botMessage: Message = {
          id: Date.now().toString(),
          content: databaseResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }

      // If no database results, perform web search
      console.log('No database results found, performing web search...');
      const webSearchResponse = await performWebSearch(userMessage);
      
      const botMessage: Message = {
        id: Date.now().toString(),
        content: webSearchResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating bot response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an issue while searching for information. Please try rephrasing your question!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const searchDatabaseForAnswer = async (query: string): Promise<string | null> => {
    try {
      // Check for specific museum mentions first
      const museumKeywords = ['museum', 'gallery', 'exhibition', 'art', 'history', 'culture'];
      const hasMuseumContext = museumKeywords.some(keyword => 
        query.toLowerCase().includes(keyword)
      );

      if (hasMuseumContext) {
        // Try to find a specific museum by name
        const museum = await getMuseumByName(query);
        if (museum) {
          return generateMuseumResponse(museum, query);
        }

        // If no specific museum found, search all museums for relevant information
        const { data: museums } = await supabase
          .from('museums')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%,type.ilike.%${query}%`)
          .limit(3);

        if (museums && museums.length > 0) {
          const museumList = museums.map(museum => 
            `**${museum.name}** (${museum.city}) - ${museum.description?.substring(0, 100)}...`
          ).join('\n\n');
          
          return `I found some museums related to your query:\n\n${museumList}\n\nWould you like to know more about any specific museum, including timings, ticket prices, or reviews?`;
        }
      }

      // Check for general queries about museum services
      const serviceKeywords = {
        'booking': 'You can book museum tickets through our platform! I can help you find museums and their booking links.',
        'timing': 'Most museums are open from 10 AM to 6 PM, but timings vary. Which specific museum are you interested in?',
        'price': 'Museum ticket prices vary by location and type. Which museum would you like pricing information for?',
        'review': 'I can show you visitor reviews for any museum! Which one interests you?'
      };

      for (const [keyword, response] of Object.entries(serviceKeywords)) {
        if (query.toLowerCase().includes(keyword)) {
          return response;
        }
      }

      return null; // No database match found
    } catch (error) {
      console.error('Error searching database:', error);
      return null;
    }
  };

  const performWebSearch = async (query: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('web-search', {
        body: { query }
      });

      if (error) {
        console.error('Web search error:', error);
        throw error;
      }

      return data.answer || "I couldn't find specific information about that. Could you try rephrasing your question?";
    } catch (error) {
      console.error('Error performing web search:', error);
      return "I'm having trouble searching for that information right now. Please try asking about museum timings, reviews, or ticket prices, or try again later.";
    }
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