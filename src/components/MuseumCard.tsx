import { motion } from 'framer-motion';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';

interface MuseumCardProps {
  id: string;
  name: string;
  city: string | null;
  established?: string | null;
  type: string | null;
  description: string | null;
  address?: string | null;
  timings?: string | null;
  entry_fee?: string | null;
  onViewMore: (id: string) => void;
  onBookTicket: (id: string) => void;
}

const MuseumCard = ({ 
  id, name, city, established, type, description, address, timings, entry_fee, onViewMore, onBookTicket 
}: MuseumCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative overflow-hidden rounded-2xl bg-card/50 glass border border-border/20 shadow-premium hover:shadow-elevated"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-golden/20 via-teal/10 to-accent/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="glass-strong text-xs font-medium px-3 py-1 rounded-full text-golden border border-golden/20">
            {type || 'General Museum'}
          </span>
        </div>
        
        {/* Established Year */}
        {established && (
          <div className="absolute top-4 right-4 flex items-center space-x-1 glass-strong px-2 py-1 rounded-full">
            <span className="text-sm font-medium text-foreground">Est. {established}</span>
          </div>
        )}

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-golden via-transparent to-teal" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-golden transition-smooth">
            {name}
          </h3>
          <div className="flex items-center space-x-2 mt-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{city || 'Location not specified'}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {description || 'No description available'}
        </p>

        <div className="space-y-2">
          {timings && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{timings}</span>
            </div>
          )}
          
          {entry_fee && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span className="w-4 h-4 text-center text-xs">₹</span>
              <span className="text-sm">{entry_fee}</span>
            </div>
          )}

          {address && (
            <div className="flex items-start space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm line-clamp-2">{address}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <EnhancedButton
            variant="museum"
            size="sm"
            onClick={() => onViewMore(id)}
            className="flex-1"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-2" />
          </EnhancedButton>
          
          <EnhancedButton
            variant="hero"
            size="sm"
            onClick={() => onBookTicket(id)}
            className="flex-1"
          >
            Book Ticket
          </EnhancedButton>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none">
        <div className="absolute inset-0 rounded-2xl ring-1 ring-golden/30 glow-golden" />
      </div>
    </motion.div>
  );
};

export default MuseumCard;