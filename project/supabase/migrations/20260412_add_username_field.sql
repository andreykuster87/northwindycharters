-- Add username (@handle) field to clients, sailors, and companies tables

ALTER TABLE clients   ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE sailors   ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS username text;

-- Optional: add unique index so @handles are unique per table
-- (Uncomment if uniqueness is desired across each user type)
-- CREATE UNIQUE INDEX IF NOT EXISTS clients_username_idx   ON clients(username)   WHERE username IS NOT NULL;
-- CREATE UNIQUE INDEX IF NOT EXISTS sailors_username_idx   ON sailors(username)   WHERE sailors IS NOT NULL;
-- CREATE UNIQUE INDEX IF NOT EXISTS companies_username_idx ON companies(username) WHERE username IS NOT NULL;
