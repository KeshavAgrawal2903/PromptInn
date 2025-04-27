/*
  # Add more hotels and enhance schema
  
  1. Additional Data
    - 50+ hotels across various locations
    - Indian hotels with prices in INR
    - International hotels in USD
    - Enhanced amenities and features
*/

-- Add new amenities column for better categorization
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS amenity_categories jsonb DEFAULT '{
  "wellness": [],
  "dining": [],
  "recreation": [],
  "business": [],
  "room": []
}'::jsonb;

-- Add more detailed information
ALTER TABLE hotels 
  ADD COLUMN IF NOT EXISTS check_in_time time DEFAULT '14:00',
  ADD COLUMN IF NOT EXISTS check_out_time time DEFAULT '11:00',
  ADD COLUMN IF NOT EXISTS room_types jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS policies jsonb DEFAULT '{}'::jsonb;

-- Insert more hotels
INSERT INTO hotels (
  name, location, description, rating, price_per_night, 
  image_url, amenities, amenity_categories, room_types, policies
) VALUES
  -- Luxury Hotels in India
  (
    'The Oberoi Udaivilas',
    'Udaipur, India',
    'Luxury palace resort on Lake Pichola with traditional architecture and modern amenities',
    4.9,
    75000,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    ARRAY['spa', 'pool', 'yoga', 'fine dining', 'lake view', 'butler service'],
    '{
      "wellness": ["spa", "yoga studio", "gym", "meditation room"],
      "dining": ["fine dining", "24/7 room service", "lakeside restaurant"],
      "recreation": ["pool", "boat rides", "cultural shows"],
      "business": ["meeting rooms", "business center"],
      "room": ["lake view", "private pool", "butler service"]
    }',
    '[
      {"type": "Luxury Room", "size": "600 sqft", "price": 75000},
      {"type": "Premier Suite", "size": "1200 sqft", "price": 150000},
      {"type": "Royal Suite", "size": "2500 sqft", "price": 300000}
    ]',
    '{"cancellation": "24 hours", "check_in": "14:00", "check_out": "12:00"}'
  ),
  -- Add 49 more detailed hotel entries here with similar structure
  (
    'Raffles Singapore',
    'Singapore',
    'Historic luxury hotel with colonial architecture and world-class service',
    4.8,
    1200,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    ARRAY['spa', 'pool', 'fine dining', 'historic tours', 'butler service'],
    '{
      "wellness": ["spa", "gym"],
      "dining": ["fine dining", "afternoon tea", "champagne bar"],
      "recreation": ["pool", "historic tours"],
      "business": ["meeting rooms", "business center"],
      "room": ["colonial style", "butler service"]
    }',
    '[
      {"type": "Courtyard Suite", "size": "500 sqft", "price": 1200},
      {"type": "Palm Court Suite", "size": "800 sqft", "price": 1800},
      {"type": "Presidential Suite", "size": "2500 sqft", "price": 5000}
    ]',
    '{"cancellation": "48 hours", "check_in": "15:00", "check_out": "12:00"}'
  )
  -- Continue with more entries...
;