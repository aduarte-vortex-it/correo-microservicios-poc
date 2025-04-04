-- Crear la extensión uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear función uuid_generate_v7
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID AS $$
DECLARE
  v_time TIMESTAMP WITH TIME ZONE := CURRENT_TIMESTAMP;
  v_secs BIGINT;
  v_usec BIGINT;
  v_timestamp BIGINT;
  v_timestamp_hex VARCHAR;
  v_random VARCHAR;
  v_uuid VARCHAR;
BEGIN
  -- Extract seconds and microseconds
  v_secs := EXTRACT(EPOCH FROM v_time);
  v_usec := EXTRACT(MICROSECONDS FROM v_time) % 1000000;
  
  -- Convert time to milliseconds 
  v_timestamp := v_secs * 1000 + v_usec / 1000;
  
  -- Convert to hex with padding to 16 characters
  v_timestamp_hex := lpad(to_hex(v_timestamp), 16, '0');
  
  -- Generate 16 random hex characters
  v_random := encode(gen_random_bytes(8), 'hex');
  
  -- Format as UUIDv7
  v_uuid := substring(v_timestamp_hex, 1, 8) || '-' ||
            substring(v_timestamp_hex, 9, 4) || '-' ||
            '7' || substring(v_timestamp_hex, 13, 3) || '-' ||
            substring('8', 1, 1) || substring(v_random, 2, 3) || '-' ||
            substring(v_random, 5, 12);
            
  RETURN v_uuid::UUID;
END;
$$ LANGUAGE plpgsql;

-- Crear el esquema users si no existe
CREATE SCHEMA IF NOT EXISTS users;

-- Crear la tabla users
CREATE TABLE users.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_users_email ON users.users(email);
CREATE INDEX idx_users_status ON users.users(status); 