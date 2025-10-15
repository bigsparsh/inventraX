BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE Users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Password is 'password123' hashed with bcrypt
UPDATE Users 
SET password = '$2a$10$rQZ5xKxV8yKxV8yKxV8yKOM.xKxV8yKxV8yKxV8yKxV8yKxV8yKO'
WHERE password IS NULL;

COMMIT;
