import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface DetailedTimings {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Pricing {
  adult: string;
  child: string;
}

export interface Museum {
  id: number;
  name: string;
  city: string | null;
  established?: string | null;
  type: string | null;
  description: string | null;
  address?: string | null;
  timings?: string | null;
  entry_fee?: string | null;
  contact?: string | null;
  website?: string | null;
  created_at?: string;
  updated_at?: string;
  detailed_timings?: any; // JSON data from database
  reviews?: any; // JSON data from database
  pricing?: any; // JSON data from database
  booking_link?: string;
}

export const useMuseums = () => {
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Fetch museums data from Supabase
  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const { data, error } = await supabase
          .from('museums')
          .select('*, detailed_timings, reviews, pricing, booking_link')
          .order('name');

        if (error) {
          throw error;
        }

        setMuseums(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching museums:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMuseums();
  }, []);

  // Get unique cities and types for filters
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(museums.map(museum => museum.city).filter(Boolean))]
      .sort();
    return uniqueCities;
  }, [museums]);

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(museums.map(museum => museum.type).filter(Boolean))]
      .sort();
    return uniqueTypes;
  }, [museums]);

  // Filter museums based on search query and filters
  const filteredMuseums = useMemo(() => {
    return museums.filter(museum => {
      const matchesSearch = !searchQuery || 
        (museum.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (museum.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (museum.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (museum.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === 'all' || museum.city === selectedCity;
      const matchesType = selectedType === 'all' || museum.type === selectedType;

      return matchesSearch && matchesCity && matchesType;
    });
  }, [museums, searchQuery, selectedCity, selectedType]);

  // Advanced search function for future use
  const searchMuseums = async (searchName?: string, searchCity?: string, searchType?: string) => {
    try {
      const { data, error } = await supabase
        .rpc('search_museums', {
          search_name: searchName || null,
          search_city: searchCity || null,
          search_type: searchType || null
        });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error in advanced search:', err);
      return [];
    }
  };

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
    types,
    searchMuseums
  };
};