import React from 'react';
import { Star, X } from 'lucide-react';
import { useFilterStore } from '../store/filterStore';

export function Filters() {
  const {
    priceRange,
    rating,
    amenities,
    location,
    setPriceRange,
    setRating,
    toggleAmenity,
    setLocation,
    resetFilters,
  } = useFilterStore();

  const commonAmenities = [
    'spa',
    'pool',
    'gym',
    'wifi',
    'restaurant',
    'bar',
    'room service',
    'parking',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
        >
          <X className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Price Range
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
            className="w-24 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="w-24 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Minimum Rating
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className={`p-2 rounded ${
                rating >= value
                  ? 'text-yellow-500'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              <Star className="w-5 h-5" fill={rating >= value ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city or country"
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amenities
        </label>
        <div className="grid grid-cols-2 gap-2">
          {commonAmenities.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span className="capitalize">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}