import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  price_per_night: number;
  image_url: string;
  amenities: string[];
}

interface SearchState {
  query: string;
  results: Hotel[];
  loading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  search: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  loading: false,
  error: null,
  setQuery: (query) => set({ query }),
  search: async () => {
    const query = get().query.toLowerCase();
    set({ loading: true, error: null });

    try {
      let rpc = 'search_hotels';
      let queryParams = { search_query: query };

      // Check for specific search patterns
      if (query.includes('near')) {
        rpc = 'search_hotels_by_location';
        const location = query.split('near')[1].trim();
        queryParams = { location };
      } else if (query.includes('star')) {
        rpc = 'search_hotels_by_rating';
        const rating = parseInt(query.match(/\d+/)?.[0] || '0');
        queryParams = { min_rating: rating };
      }

      const { data, error } = await supabase
        .rpc(rpc, queryParams)
        .select('*');

      if (error) throw error;

      // Process and rank results based on relevance
      const processedResults = (data as Hotel[]).map(hotel => ({
        ...hotel,
        relevance: calculateRelevance(hotel, query)
      }));

      // Sort by relevance
      const sortedResults = processedResults
        .sort((a: any, b: any) => b.relevance - a.relevance)
        .map(({ relevance, ...hotel }: any) => hotel);

      set({ results: sortedResults, loading: false });
    } catch (error) {
      console.error('Search error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during search',
        loading: false 
      });
    }
  },
}));

function calculateRelevance(hotel: Hotel, query: string): number {
  let score = 0;

  // Check name match
  if (hotel.name.toLowerCase().includes(query)) score += 5;
  
  // Check location match
  if (hotel.location.toLowerCase().includes(query)) score += 4;
  
  // Check description match
  if (hotel.description.toLowerCase().includes(query)) score += 3;
  
  // Check amenities match
  const matchingAmenities = hotel.amenities.filter(amenity => 
    query.includes(amenity.toLowerCase())
  );
  score += matchingAmenities.length * 2;

  // Price range hints
  if (query.includes('luxury') && hotel.price_per_night > 300) score += 2;
  if (query.includes('budget') && hotel.price_per_night < 150) score += 2;
  if (query.includes('affordable') && hotel.price_per_night < 200) score += 2;

  return score;
}