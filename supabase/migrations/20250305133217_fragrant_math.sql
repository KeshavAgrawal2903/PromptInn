/*
  # Create Search Functions for PromptInn

  1. New Functions
    - search_hotels: General purpose search across all fields
    - search_hotels_by_location: Location-specific search
    - search_hotels_by_rating: Rating-based search
    
  2. Security
    - Functions accessible to all authenticated users
*/

-- General search function
CREATE OR REPLACE FUNCTION search_hotels(search_query text)
RETURNS SETOF hotels
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM hotels
  WHERE 
    to_tsvector('english', name || ' ' || description || ' ' || location) @@ 
    plainto_tsquery('english', search_query)
    OR array_to_string(amenities, ' ') ILIKE '%' || search_query || '%';
END;
$$;

-- Location-based search
CREATE OR REPLACE FUNCTION search_hotels_by_location(location text)
RETURNS SETOF hotels
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM hotels
  WHERE 
    hotels.location ILIKE '%' || location || '%'
  ORDER BY 
    rating DESC,
    price_per_night ASC;
END;
$$;

-- Rating-based search
CREATE OR REPLACE FUNCTION search_hotels_by_rating(min_rating numeric)
RETURNS SETOF hotels
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM hotels
  WHERE rating >= min_rating
  ORDER BY 
    rating DESC,
    price_per_night ASC;
END;
$$;

-- Grant access to the functions
GRANT EXECUTE ON FUNCTION search_hotels(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_hotels_by_location(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_hotels_by_rating(numeric) TO authenticated;