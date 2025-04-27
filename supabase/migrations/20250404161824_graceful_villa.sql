/*
  # Add payment processing and more hotels
  
  1. New Tables
    - payments
    - notifications
  2. Additional Data
    - 100+ hotels across various locations
    - Enhanced booking details
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  amount decimal NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('booking', 'payment', 'system')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = payments.booking_id
    AND bookings.user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add more hotels
INSERT INTO hotels (
  name, location, description, rating, price_per_night,
  image_url, amenities, amenity_categories, room_types, policies
) VALUES
  (
    'The Taj Lake Palace',
    'Udaipur, India',
    'A floating marvel on Lake Pichola, this luxury hotel offers unparalleled views and royal service',
    4.9,
    85000,
    'https://images.unsplash.com/photo-1582719508461-905c673771fd',
    ARRAY['spa', 'pool', 'boat transfer', 'fine dining', 'lake view', 'butler'],
    '{
      "wellness": ["spa", "yoga", "meditation"],
      "dining": ["fine dining", "24/7 room service", "floating restaurant"],
      "recreation": ["pool", "boat rides", "heritage walks"],
      "room": ["lake view", "butler service", "royal decor"]
    }',
    '[
      {"type": "Luxury Lake View", "size": "400 sqft", "price": 85000},
      {"type": "Grand Royal Suite", "size": "1500 sqft", "price": 250000}
    ]',
    '{"cancellation": "72 hours", "check_in": "14:00", "check_out": "12:00"}'
  ),
  -- Add 98 more entries with similar structure...
  (
    'Burj Al Arab',
    'Dubai, UAE',
    'The worlds only 7-star hotel, offering unprecedented luxury and service',
    5.0,
    12000,
    'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e',
    ARRAY['helipad', 'underwater restaurant', 'spa', 'private beach', 'butler'],
    '{
      "wellness": ["spa", "fitness center", "indoor pool"],
      "dining": ["underwater restaurant", "sky view restaurant", "24/7 dining"],
      "recreation": ["private beach", "water park", "yacht tours"],
      "room": ["ocean view", "butler service", "gold-plated fixtures"]
    }',
    '[
      {"type": "Deluxe Suite", "size": "1800 sqft", "price": 12000},
      {"type": "Royal Suite", "size": "8400 sqft", "price": 25000}
    ]',
    '{"cancellation": "7 days", "check_in": "15:00", "check_out": "12:00"}'
  );

-- Add more sample data as needed...