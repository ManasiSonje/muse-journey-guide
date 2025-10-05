import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Play, Search, MapPin, Calendar, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';
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
  const [flowService] = useState(() => new ChatbotFlowService());
  const [conversationState, setConversationState] = useState<ConversationState>(() => 
    flowService.getInitialState()
  );
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Trip planning state
  const [tripLocation, setTripLocation] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripHours, setTripHours] = useState('');
  
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
    try {
      const response = await flowService.processUserInput(inputValue, conversationState);
      
      if (response.redirectUrl) {
        window.open(response.redirectUrl, '_blank');
      }
      
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
  };

  const generateTrip = () => {
    if (!tripLocation || !tripDate || !tripHours) return;
    
    // Clear form
    setTripLocation('');
    setTripDate('');
    setTripHours('');
    
    // For now, just reset to menu - could integrate with flows later
    resetToMenu();
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
                        {flowService.getMenuOptions().map((option) => (
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
                        ))}
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
        </div>
      </div>
    </div>
  );
};

export default Chatbot;