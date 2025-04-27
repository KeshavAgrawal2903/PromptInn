import React, { useState } from 'react';
import { MapPin, Star, Users, IndianRupee, DollarSign, Filter } from 'lucide-react';
import { useSearchStore, Hotel } from '../store/searchStore';
import { useFilterStore } from '../store/filterStore';
import { Filters } from './Filters';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResultsProps {
  onBookNow: (hotel: Hotel) => void;
}

export function SearchResults({ onBookNow }: SearchResultsProps) {
  const { results, loading } = useSearchStore();
  const [showFilters, setShowFilters] = useState(false);
  const { priceRange, rating, amenities, location } = useFilterStore();

  const formatPrice = (price: number, location: string) => {
    const isIndianLocation = location.toLowerCase().includes('india');
    return (
      <div className="flex items-center">
        {isIndianLocation ? <IndianRupee className="w-4 h-4 mr-1" /> : <DollarSign className="w-4 h-4 mr-1" />}
        <span className="font-bold">{isIndianLocation ? price.toLocaleString('en-IN') : price.toLocaleString('en-US')}</span>
      </div>
    );
  };

  const filteredResults = results.filter((hotel) => {
    const matchesPrice = hotel.price_per_night >= priceRange[0] && hotel.price_per_night <= priceRange[1];
    const matchesRating = hotel.rating >= rating;
    const matchesAmenities = amenities.length === 0 || amenities.every(a => hotel.amenities.includes(a));
    const matchesLocation = !location || hotel.location.toLowerCase().includes(location.toLowerCase());
    return matchesPrice && matchesRating && matchesAmenities && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filters Section */}
      <div className="md:w-1/4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg mb-4"
        >
          <Filter className="w-5 h-5" />
          <span>Toggle Filters</span>
        </button>
        <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
          <Filters />
        </div>
      </div>

      {/* Results Section */}
      <div className="md:w-3/4">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No hotels found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredResults.map((hotel) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105"
                >
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{hotel.name}</h3>
                    <div className="flex items-center mb-4 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{hotel.location}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="ml-1 font-semibold text-yellow-700 dark:text-yellow-300">{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                            +{hotel.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{hotel.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg">
                        {formatPrice(hotel.price_per_night, hotel.location)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">/night</span>
                      </div>
                      <button
                        onClick={() => onBookNow(hotel)}
                        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}