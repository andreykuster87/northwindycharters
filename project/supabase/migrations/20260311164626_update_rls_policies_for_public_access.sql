/*
  # Update RLS Policies for Public Access
  
  ## Overview
  Updates all RLS policies to allow public access for marketplace functionality.
  The application handles authorization at the application level.
  
  ## Changes
  - Updates sailors, boats, trips, bookings, and clients tables
  - Replaces restrictive policies with public access policies
  - Allows SELECT, INSERT, UPDATE, DELETE for all users
*/

-- ══════════════════════════════════════════════════════════════
-- SAILORS: PUBLIC FULL ACCESS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Public can view verified sailors" ON sailors;
DROP POLICY IF EXISTS "Authenticated users can view all sailors" ON sailors;
DROP POLICY IF EXISTS "Anyone can insert sailor registration" ON sailors;
DROP POLICY IF EXISTS "Sailors can update own profile" ON sailors;
DROP POLICY IF EXISTS "Public full access to sailors" ON sailors;

CREATE POLICY "Public full access to sailors"
  ON sailors FOR ALL
  USING (true)
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- BOATS: PUBLIC FULL ACCESS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Public can view active boats" ON boats;
DROP POLICY IF EXISTS "Authenticated users can manage boats" ON boats;
DROP POLICY IF EXISTS "Anyone can insert boats" ON boats;
DROP POLICY IF EXISTS "Public full access to boats" ON boats;

CREATE POLICY "Public full access to boats"
  ON boats FOR ALL
  USING (true)
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- TRIPS: PUBLIC FULL ACCESS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Public can view active trips" ON trips;
DROP POLICY IF EXISTS "Authenticated users can manage trips" ON trips;
DROP POLICY IF EXISTS "Anyone can insert trips" ON trips;
DROP POLICY IF EXISTS "Public full access to trips" ON trips;

CREATE POLICY "Public full access to trips"
  ON trips FOR ALL
  USING (true)
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- BOOKINGS: PUBLIC FULL ACCESS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Public can view bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Public full access to bookings" ON bookings;

CREATE POLICY "Public full access to bookings"
  ON bookings FOR ALL
  USING (true)
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- CLIENTS: PUBLIC FULL ACCESS
-- ══════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Public can view active clients" ON clients;
DROP POLICY IF EXISTS "Anyone can register as client" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
DROP POLICY IF EXISTS "Public full access to clients" ON clients;

CREATE POLICY "Public full access to clients"
  ON clients FOR ALL
  USING (true)
  WITH CHECK (true);