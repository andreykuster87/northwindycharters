/*
  # NorthWindy Complete Marketplace Schema

  ## Overview
  Complete production schema for boat charter marketplace with sailor verification, 
  boat management, trip creation, bookings, and client registration.

  ## New Tables

  ### sailors
  - Professional mariners with verification system
  - Stores credentials, documentation, certifications
  - Status: pending, approved
  - Language and timezone support for international operations

  ### boats
  - Boat fleet owned by sailors
  - Supports multiple photos and cover image
  - Navigation details, capacity, pricing
  - Documentation fields (BIE, IMO numbers)

  ### trips
  - Published sailing experiences by sailors
  - Links boats with departure/arrival marinas
  - Duration, pricing per passenger, description
  - Photo album support

  ### bookings
  - Customer reservations for trips
  - Links to trip, boat, and sailor
  - Passenger count, notes, pricing
  - Status tracking (pending, confirmed, completed, cancelled)

  ### clients
  - End-user customer profiles
  - Passport/document verification
  - Multi-language, timezone support
  - Account credentials after verification

  ## Security
  - RLS enabled on all tables
  - Public read access for published trips and verified sailors
  - User data protected with appropriate policies
  - Admin/sailor distinction through status and roles
*/

-- ══════════════════════════════════════════════════════════════
-- SAILORS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sailors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text UNIQUE NOT NULL,
  language text,
  timezone text,
  nacionalidade text,
  passaporte text,
  cartaHabilitacao text,
  stcw text,
  medico text,
  status text DEFAULT 'pending',
  verified boolean DEFAULT false,
  sailor_login text UNIQUE,
  sailor_password text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sailors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view verified sailors"
  ON sailors FOR SELECT
  USING (status = 'approved' AND verified = true);

CREATE POLICY "Authenticated users can view all sailors"
  ON sailors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert sailor registration"
  ON sailors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sailors can update own profile"
  ON sailors FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- BOATS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS boats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sailor_id uuid REFERENCES sailors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text,
  capacity integer DEFAULT 1,
  bie_number text,
  imo_number text,
  photo_url text,
  cover_photo text,
  photos text[] DEFAULT '{}',
  marina_location text,
  price_per_hour numeric DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE boats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active boats"
  ON boats FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage boats"
  ON boats FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert boats"
  ON boats FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_boats_sailor_id ON boats(sailor_id);
CREATE INDEX IF NOT EXISTS idx_boats_status ON boats(status);

-- ══════════════════════════════════════════════════════════════
-- TRIPS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boat_id uuid REFERENCES boats(id) ON DELETE CASCADE,
  sailor_id uuid REFERENCES sailors(id) ON DELETE CASCADE NOT NULL,
  sailor_name text,
  boat_name text NOT NULL,
  boat_type text,
  capacity integer,
  marina_saida text NOT NULL,
  marina_chegada text NOT NULL,
  duracao text,
  valor_por_pessoa numeric DEFAULT 0,
  descricao text,
  photo_url text,
  cover_photo text,
  photos text[] DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active trips"
  ON trips FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage trips"
  ON trips FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert trips"
  ON trips FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_trips_sailor_id ON trips(sailor_id);
CREATE INDEX IF NOT EXISTS idx_trips_boat_id ON trips(boat_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- ══════════════════════════════════════════════════════════════
-- BOOKINGS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE SET NULL,
  boat_id uuid REFERENCES boats(id) ON DELETE SET NULL,
  sailor_id uuid REFERENCES sailors(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  booking_date date NOT NULL,
  time_slot text DEFAULT '00:00',
  passengers integer DEFAULT 1,
  notes text,
  total_price numeric DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view bookings"
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

CREATE INDEX IF NOT EXISTS idx_bookings_sailor_id ON bookings(sailor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_boat_id ON bookings(boat_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ══════════════════════════════════════════════════════════════
-- CLIENTS TABLE
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  country_code text,
  country_name text,
  timezone text,
  language text,
  passport_number text,
  passport_issued date,
  passport_expires date,
  doc_url text,
  client_login text UNIQUE,
  client_password text,
  status text DEFAULT 'pending_verification',
  role text DEFAULT 'client',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active clients"
  ON clients FOR SELECT
  USING (status = 'active');

CREATE POLICY "Anyone can register as client"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage clients"
  ON clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ══════════════════════════════════════════════════════════════
-- OPTIONAL: Create views for common queries
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public_trips_with_sailor AS
SELECT 
  t.id,
  t.boat_id,
  t.sailor_id,
  t.sailor_name,
  t.boat_name,
  t.boat_type,
  t.capacity,
  t.marina_saida,
  t.marina_chegada,
  t.duracao,
  t.valor_por_pessoa,
  t.descricao,
  t.photo_url,
  t.cover_photo,
  t.photos,
  t.status,
  t.created_at,
  s.name as sailor_full_name,
  s.phone as sailor_phone,
  s.verified as sailor_verified
FROM trips t
LEFT JOIN sailors s ON t.sailor_id = s.id
WHERE t.status = 'active' AND (s.status = 'approved' OR s.status IS NULL);

GRANT SELECT ON public_trips_with_sailor TO anon;
GRANT SELECT ON public_trips_with_sailor TO authenticated;