import { useState, useEffect, useMemo } from 'react';

export interface Museum {
  id: number;
  name: string;
  city: string;
  established?: string;
  type: string;
  description: string;
  address?: string;
  timings?: string;
  entry_fee?: string;
  contact?: string;
  website?: string;
}

interface MuseumsData {
  museums: Museum[];
}

export const useMuseums = () => {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Fetch museums data
  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const response = await fetch('/data/museums.json');
        if (!response.ok) {
          throw new Error('Failed to fetch museums');
        }
        const data: MuseumsData = await response.json();
        setMuseums(data.museums);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMuseums();
  }, []);

  // Get unique cities and types for filters
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(museums.map(museum => museum.city))];
    return uniqueCities.sort();
  }, [museums]);

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(museums.map(museum => museum.type))];
    return uniqueTypes.sort();
  }, [museums]);

  // Filter museums based on search query and filters
  const filteredMuseums = useMemo(() => {
    return museums.filter(museum => {
      const matchesSearch = !searchQuery || 
        museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        museum.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        museum.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        museum.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === 'all' || museum.city === selectedCity;
      const matchesType = selectedType === 'all' || museum.type === selectedType;

      return matchesSearch && matchesCity && matchesType;
    });
  }, [museums, searchQuery, selectedCity, selectedType]);

  return {
    museums: filteredMuseums,
    allMuseums: museums,
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
  };
};