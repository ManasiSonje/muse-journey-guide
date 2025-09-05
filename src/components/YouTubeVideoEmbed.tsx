import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  isLive?: boolean;
}

interface YouTubeVideoEmbedProps {
  videos: YouTubeVideo[];
  query: string;
  loading: boolean;
  error?: string;
}

const YouTubeVideoEmbed = ({ videos, query, loading, error }: YouTubeVideoEmbedProps) => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  if (loading) {
    return (
      <Card className="glass border-border/20 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-golden rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-golden rounded-full animate-bounce delay-100"></div>
            <div className="w-4 h-4 bg-golden rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    const isConnectionError = error.includes('Unable to load video right now');
    const isNoResults = error.includes('No video available for this museum');
    const isFallbackContent = error.includes('Showing related museum content instead');
    
    return (
      <Card className="glass border-border/20 p-4">
        <div className="flex items-center justify-center min-h-[120px] text-muted-foreground">
          <div className="text-center space-y-3 max-w-sm">
            <AlertCircle className={`w-8 h-8 mx-auto ${isConnectionError ? 'text-amber-400' : 'opacity-60'}`} />
            <div className="space-y-2">
              <p className="text-sm font-medium">{error}</p>
              {isConnectionError && (
                <p className="text-xs opacity-80">Check your internet connection and try again.</p>
              )}
              {isNoResults && (
                <div className="space-y-2">
                  <p className="text-xs opacity-80">Try searching for:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <span className="text-xs bg-muted/30 px-2 py-1 rounded">Louvre</span>
                    <span className="text-xs bg-muted/30 px-2 py-1 rounded">MoMA</span>
                    <span className="text-xs bg-muted/30 px-2 py-1 rounded">British Museum</span>
                  </div>
                </div>
              )}
              {isFallbackContent && videos && videos.length > 0 && (
                <p className="text-xs opacity-80 text-golden">⬇️ Related content below</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card className="glass border-border/20 p-4">
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <div className="text-center space-y-2">
            <Play className="w-8 h-8 mx-auto opacity-60" />
            <p className="text-sm">No video found, please try another museum.</p>
          </div>
        </div>
      </Card>
    );
  }

  const mainVideo = selectedVideo || videos[0];
  const otherVideos = videos.filter(v => v.id !== mainVideo.id).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Main Video Player */}
      <Card className="glass border-border/20 overflow-hidden">
        <div className="relative">
          {/* Video iframe */}
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${mainVideo.id}?autoplay=0&rel=0`}
              title={mainVideo.title}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-t-lg"
            />
          </div>
          
          {/* Video Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                  {mainVideo.title}
                </h3>
              </div>
              {mainVideo.isLive && (
                <Badge variant="destructive" className="flex-shrink-0 text-xs">
                  🔴 LIVE
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-24">{mainVideo.channelTitle}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(mainVideo.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Other Videos */}
      <AnimatePresence>
        {otherVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-muted-foreground px-2">More videos:</h4>
            <div className="space-y-2">
              {otherVideos.map((video) => (
                <Card
                  key={video.id}
                  className="glass border-border/20 p-3 cursor-pointer hover:border-golden/40 transition-colors"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
                        <Play className="w-4 h-4 text-white opacity-80" />
                      </div>
                      {video.isLive && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1 py-0">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                        {video.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {video.channelTitle}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YouTubeVideoEmbed;
