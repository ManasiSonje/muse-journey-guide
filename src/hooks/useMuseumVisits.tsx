import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Museum } from './useMuseums';

export const useMuseumVisits = (userId: string | undefined) => {
  const [visitedMuseums, setVisitedMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);

  // Track a museum visit
  const trackMuseumVisit = async (museumId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase.rpc('track_museum_visit', {
        p_museum_id: museumId
      });

      if (error) {
        console.error('Error tracking museum visit:', error);
      } else {
        // Refresh visited museums
        fetchVisitedMuseums();
      }
    } catch (error) {
      console.error('Error in trackMuseumVisit:', error);
    }
  };

  // Fetch visited museums
  const fetchVisitedMuseums = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data: visits, error: visitsError } = await supabase
        .from('museum_visits')
        .select('museum_id, visited_at')
        .eq('user_id', userId)
        .order('visited_at', { ascending: false })
        .limit(6);

      if (visitsError) throw visitsError;

      if (visits && visits.length > 0) {
        const museumIds = visits.map(v => v.museum_id);
        
        const { data: museums, error: museumsError } = await supabase
          .from('museums')
          .select('*, detailed_timings, reviews, pricing, booking_link')
          .in('id', museumIds);

        if (museumsError) throw museumsError;

        // Sort museums by visit order
        const sortedMuseums = museums?.sort((a, b) => {
          const aIndex = museumIds.indexOf(a.id);
          const bIndex = museumIds.indexOf(b.id);
          return aIndex - bIndex;
        }) || [];

        setVisitedMuseums(sortedMuseums);
      } else {
        setVisitedMuseums([]);
      }
    } catch (error) {
      console.error('Error fetching visited museums:', error);
      setVisitedMuseums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitedMuseums();
  }, [userId]);

  return {
    visitedMuseums,
    loading,
    trackMuseumVisit
  };
};
