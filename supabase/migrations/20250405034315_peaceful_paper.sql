/*
  # Add Transactions Table and Functions
  
  1. New Tables
    - transactions: Store all financial transactions
    
  2. New Functions
    - convert_currency: Handle currency conversion
    
  3. Security
    - Enable RLS
    - Add policies for transaction access
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric NOT NULL CHECK (amount > 0),
  source_currency text NOT NULL,
  target_currency text NOT NULL,
  conversion_rate numeric NOT NULL,
  converted_amount numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  type text NOT NULL CHECK (type IN ('debit', 'credit', 'conversion')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = transactions.booking_id
    AND bookings.user_id = auth.uid()
  ));

-- Create currency conversion function
CREATE OR REPLACE FUNCTION convert_currency(
  amount numeric,
  from_currency text,
  to_currency text
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rate numeric;
BEGIN
  -- In a real application, you would fetch live rates from an external service
  -- For demo purposes, we'll use hardcoded rates
  CASE
    WHEN from_currency = 'USD' AND to_currency = 'INR' THEN rate := 75;
    WHEN from_currency = 'INR' AND to_currency = 'USD' THEN rate := 1.0/75;
    WHEN from_currency = 'EUR' AND to_currency = 'INR' THEN rate := 85;
    WHEN from_currency = 'INR' AND to_currency = 'EUR' THEN rate := 1.0/85;
    ELSE rate := 1;
  END CASE;
  
  RETURN amount * rate;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION convert_currency(numeric, text, text) TO authenticated;

-- Add trigger to automatically create transaction records for bookings
CREATE OR REPLACE FUNCTION create_booking_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO transactions (
    booking_id,
    amount,
    source_currency,
    target_currency,
    conversion_rate,
    converted_amount,
    status,
    type,
    description
  ) VALUES (
    NEW.id,
    NEW.total_price,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM hotels 
        WHERE id = NEW.hotel_id 
        AND location ILIKE '%india%'
      ) THEN 'INR'
      ELSE 'USD'
    END,
    'INR',
    1,
    NEW.total_price,
    'completed',
    'debit',
    'Hotel booking payment'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER booking_transaction_trigger
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION create_booking_transaction();