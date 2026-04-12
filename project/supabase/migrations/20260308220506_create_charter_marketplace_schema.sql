/*
  # NorthWindy Charter Marketplace Schema
  
  ## Overview
  Complete database schema for a boat charter marketplace connecting users with professional sailors
  
  ## New Tables
  
  ### sailors
  - `id` (uuid, primary key) - Unique sailor identifier
  - `name` (text) - Sailor's full name
  - `verified` (boolean) - Verification status
  - `phone` (text) - Contact phone number
  - `photo_url` (text, nullable) - Profile photo URL
  - `created_at` (timestamptz) - Registration timestamp
  
  ### boats
  - `id` (uuid, primary key) - Unique boat identifier
  - `sailor_id` (uuid, foreign key) - Reference to sailor
  - `name` (text) - Boat model/name
  - `photo_url` (text) - Main boat photo
  - `capacity` (integer) - Maximum passenger capacity
  - `price_per_hour` (numeric) - Hourly rate in currency
  - `marina_location` (text) - Embarkation point
  - `safety_equipment` (text) - Safety features description
  - `cancellation_policy` (text) - Weather/cancellation rules
  - `description` (text) - Detailed boat description
  - `created_at` (timestamptz) - Listing creation date
  
  ### bookings
  - `id` (uuid, primary key) - Unique booking identifier
  - `boat_id` (uuid, foreign key) - Reference to boat
  - `customer_name` (text) - Guest name
  - `customer_phone` (text) - Guest WhatsApp contact
  - `booking_date` (date) - Selected date
  - `time_slot` (text) - Time slot (morning/afternoon/sunset)
  - `status` (text) - Booking status (pending/confirmed/completed/cancelled)
  - `total_price` (numeric) - Final booking price
  - `created_at` (timestamptz) - Booking creation timestamp
  
  ## Security
  - RLS enabled on all tables
  - Public read access for boats and sailors (marketplace catalog)
  - Authenticated users can create bookings
  - Admin users can manage all records
*/

-- Create sailors table
CREATE TABLE IF NOT EXISTS sailors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  verified boolean DEFAULT true,
  phone text NOT NULL,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create boats table
CREATE TABLE IF NOT EXISTS boats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sailor_id uuid REFERENCES sailors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  photo_url text NOT NULL,
  capacity integer NOT NULL,
  price_per_hour numeric(10,2) NOT NULL,
  marina_location text NOT NULL,
  safety_equipment text NOT NULL,
  cancellation_policy text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boat_id uuid REFERENCES boats(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  status text DEFAULT 'pending',
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sailors ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Sailors policies (public read)
CREATE POLICY "Anyone can view verified sailors"
  ON sailors FOR SELECT
  USING (verified = true);

CREATE POLICY "Authenticated users can manage sailors"
  ON sailors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Boats policies (public catalog)
CREATE POLICY "Anyone can view boats"
  ON boats FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage boats"
  ON boats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bookings policies (public create, authenticated manage)
CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_boats_sailor_id ON boats(sailor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_boat_id ON bookings(boat_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);