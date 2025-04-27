import { create } from 'zustand';

interface FilterState {
  priceRange: [number, number];
  rating: number;
  amenities: string[];
  location: string;
  setPriceRange: (range: [number, number]) => void;
  setRating: (rating: number) => void;
  toggleAmenity: (amenity: string) => void;
  setLocation: (location: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  priceRange: [0, 1000000],
  rating: 0,
  amenities: [],
  location: '',
  setPriceRange: (range) => set({ priceRange: range }),
  setRating: (rating) => set({ rating }),
  toggleAmenity: (amenity) =>
    set((state) => ({
      amenities: state.amenities.includes(amenity)
        ? state.amenities.filter((a) => a !== amenity)
        : [...state.amenities, amenity],
    })),
  setLocation: (location) => set({ location }),
  resetFilters: () =>
    set({
      priceRange: [0, 1000000],
      rating: 0,
      amenities: [],
      location: '',
    }),
}));