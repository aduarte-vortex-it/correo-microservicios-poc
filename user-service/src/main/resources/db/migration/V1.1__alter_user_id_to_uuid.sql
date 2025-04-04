-- Primero, eliminamos la restricción de clave primaria
ALTER TABLE users.users DROP CONSTRAINT users_pkey;

-- Luego, eliminamos la columna id actual
ALTER TABLE users.users DROP COLUMN id;

-- Agregamos la nueva columna id como UUID
ALTER TABLE users.users ADD COLUMN id UUID;

-- Hacemos la columna id NOT NULL
ALTER TABLE users.users ALTER COLUMN id SET NOT NULL;

-- Agregamos la restricción de clave primaria
ALTER TABLE users.users ADD PRIMARY KEY (id);

-- Verificamos que la función uuid_generate_v7 existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'uuid_generate_v7'
    ) THEN
        -- Crear función uuid_generate_v7 si no existe
        EXECUTE '
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
          v_timestamp_hex := lpad(to_hex(v_timestamp), 16, ''0'');
          
          -- Generate 16 random hex characters
          v_random := encode(gen_random_bytes(8), ''hex'');
          
          -- Format as UUIDv7
          v_uuid := substring(v_timestamp_hex, 1, 8) || ''-'' ||
                    substring(v_timestamp_hex, 9, 4) || ''-'' ||
                    ''7'' || substring(v_timestamp_hex, 13, 3) || ''-'' ||
                    substring(''8'', 1, 1) || substring(v_random, 2, 3) || ''-'' ||
                    substring(v_random, 5, 12);
                    
          RETURN v_uuid::UUID;
        END;
        $$ LANGUAGE plpgsql;
        ';
    END IF;
END
$$;

-- Configuramos la secuencia para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER TABLE users.users ALTER COLUMN id SET DEFAULT uuid_generate_v7(); 