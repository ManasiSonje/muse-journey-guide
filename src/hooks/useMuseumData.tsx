import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Museum, Review, DetailedTimings, Pricing } from './useMuseums';

export const useMuseumData = () => {
  // Get museum availability for a specific day
  const getMuseumAvailability = (museum: Museum, dayName: string): string => {
    if (!museum.detailed_timings) return 'Timings not available';
    
    const timings = museum.detailed_timings as DetailedTimings;
    const day = dayName.toLowerCase() as keyof DetailedTimings;
    return timings[day] || 'Closed';
  };

  // Get museum reviews
  const getMuseumReviews = (museum: Museum): Review[] => {
    return (museum.reviews as Review[]) || [];
  };

  // Get average rating
  const getAverageRating = (museum: Museum): number => {
    const reviews = (museum.reviews as Review[]) || [];
    if (reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  // Get museum pricing
  const getMuseumPricing = (museum: Museum): Pricing => {
    return (museum.pricing as Pricing) || { adult: 'Price not available', child: 'Price not available' };
  };

  // Get booking link
  const getBookingLink = (museum: Museum): string => {
    return museum.booking_link || `https://bookmyshow.com/${museum.name.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Check if museum is open today
  const isOpenToday = (museum: Museum): boolean => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayTimings = getMuseumAvailability(museum, today);
    return todayTimings !== 'Closed' && todayTimings !== 'Timings not available';
  };

  // Get museum by name (for chatbot queries)
  const getMuseumByName = async (museumName: string): Promise<Museum | null> => {
    try {
      const { data, error } = await supabase
        .from('museums')
        .select('*')
        .ilike('name', `%${museumName}%`)
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching museum:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getMuseumByName:', error);
      return null;
    }
  };

  // Enhanced chatbot response generator
  const generateMuseumResponse = (museum: Museum, query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('timing') || lowerQuery.includes('hours') || lowerQuery.includes('open')) {
      const timings = museum.detailed_timings as DetailedTimings;
      if (timings) {
        return `${museum.name} is open:\n` +
          `Monday: ${timings.monday}\n` +
          `Tuesday: ${timings.tuesday}\n` +
          `Wednesday: ${timings.wednesday}\n` +
          `Thursday: ${timings.thursday}\n` +
          `Friday: ${timings.friday}\n` +
          `Saturday: ${timings.saturday}\n` +
          `Sunday: ${timings.sunday}`;
      }
      return `Sorry, timing information is not available for ${museum.name}.`;
    }

    if (lowerQuery.includes('review') || lowerQuery.includes('rating')) {
      const reviews = (museum.reviews as Review[]) || [];
      const avgRating = getAverageRating(museum);
      
      if (reviews.length === 0) {
        return `${museum.name} doesn't have any reviews yet. Be the first to visit and share your experience!`;
      }

      let response = `${museum.name} has an average rating of ${avgRating.toFixed(1)}/5 based on ${reviews.length} reviews:\n\n`;
      reviews.forEach((review, index) => {
        response += `${review.user}: ${review.rating}/5 - "${review.comment}"\n`;
        if (index < reviews.length - 1) response += '\n';
      });
      
      return response;
    }

    if (lowerQuery.includes('price') || lowerQuery.includes('ticket') || lowerQuery.includes('cost')) {
      const pricing = museum.pricing as Pricing;
      if (pricing) {
        return `${museum.name} ticket prices:\n` +
          `Adult: ${pricing.adult}\n` +
          `Child: ${pricing.child}\n\n` +
          `You can book tickets at: ${getBookingLink(museum)}`;
      }
      return `Sorry, pricing information is not available for ${museum.name}.`;
    }

    if (lowerQuery.includes('book') || lowerQuery.includes('ticket')) {
      const pricing = museum.pricing as Pricing;
      return `You can book tickets for ${museum.name} at: ${getBookingLink(museum)}\n\n` +
        `Ticket Prices:\n` +
        `Adult: ${pricing?.adult || 'Price not available'}\n` +
        `Child: ${pricing?.child || 'Price not available'}`;
    }

    // General museum information
    return `${museum.name} is located in ${museum.city}. ${museum.description || 'A wonderful place to explore culture and history.'}\n\n` +
      `Current status: ${isOpenToday(museum) ? 'Open today' : 'Closed today'}\n` +
      `Average rating: ${getAverageRating(museum).toFixed(1)}/5\n\n` +
      `Would you like to know about timings, reviews, or book tickets?`;
  };

  return {
    getMuseumAvailability,
    getMuseumReviews,
    getAverageRating,
    getMuseumPricing,
    getBookingLink,
    isOpenToday,
    getMuseumByName,
    generateMuseumResponse
  };
};