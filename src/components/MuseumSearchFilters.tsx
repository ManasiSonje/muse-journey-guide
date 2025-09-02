import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MuseumSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  cities: string[];
  types: string[];
  resultsCount: number;
}

const MuseumSearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  selectedType,
  onTypeChange,
  cities,
  types,
  resultsCount
}: MuseumSearchFiltersProps) => {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
        <Input
          placeholder="Search museums by name, city, type, or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-16 pl-16 pr-6 text-lg rounded-2xl glass border-border/20 focus:border-golden focus:glow-golden bg-card/50"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="w-full sm:w-48 glass border-border/20">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent className="glass border-border/20 bg-background/95">
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger className="w-full sm:w-48 glass border-border/20">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="glass border-border/20 bg-background/95">
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {resultsCount} museum{resultsCount !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCity && selectedCity !== 'all' || selectedType && selectedType !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {selectedCity && selectedCity !== 'all' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-strong text-xs font-medium px-3 py-1 rounded-full text-golden border border-golden/20 flex items-center gap-2"
            >
              <span>City: {selectedCity}</span>
              <button
                onClick={() => onCityChange('all')}
                className="text-golden/60 hover:text-golden"
              >
                ×
              </button>
            </motion.div>
          )}
          {selectedType && selectedType !== 'all' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-strong text-xs font-medium px-3 py-1 rounded-full text-teal border border-teal/20 flex items-center gap-2"
            >
              <span>Type: {selectedType}</span>
              <button
                onClick={() => onTypeChange('all')}
                className="text-teal/60 hover:text-teal"
              >
                ×
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MuseumSearchFilters;