/*
  # Initial Schema Setup for PromptInn

  1. New Tables
    - `hotels`
      - Basic hotel information including name, location, description
      - Pricing and rating information
      - Image URLs and amenities list
    - `bookings`
      - Booking records linking users and hotels
      - Check-in/out dates and guest information
      - Status tracking for bookings

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public read access to hotels
      - Authenticated user access to their own bookings
*/

-- Create hotels table
CREATE TABLE hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  rating numeric(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  price_per_night decimal NOT NULL CHECK (price_per_night > 0),
  image_url text NOT NULL,
  amenities text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  hotel_id uuid NOT NULL REFERENCES hotels(id),
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL CHECK (guests > 0),
  total_price decimal NOT NULL CHECK (total_price > 0),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- Enable RLS
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for hotels
CREATE POLICY "Hotels are viewable by everyone"
  ON hotels
  FOR SELECT
  TO public
  USING (true);

-- Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add some sample hotels
INSERT INTO hotels (name, location, description, rating, price_per_night, image_url, amenities)
VALUES
  (
    'Luxury Paris Hotel',
    'Paris, France',
    'Elegant 5-star hotel with stunning views of the Eiffel Tower',
    4.8,
    450,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ARRAY['Pool', 'Spa', 'Restaurant', 'Room Service', 'WiFi']
  ),
  (
    'Downtown NYC Suite',
    'New York, USA',
    'Modern luxury in the heart of Manhattan',
    4.6,
    380,
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    ARRAY['Gym', 'Business Center', 'Bar', 'WiFi']
  ),
  (
    'Beachfront Resort',
    'Maldives',
    'Paradise found at this exclusive beachfront resort',
    4.9,
    850,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    ARRAY['Private Beach', 'Spa', 'Water Sports', 'Multiple Restaurants', 'Pool']
  );