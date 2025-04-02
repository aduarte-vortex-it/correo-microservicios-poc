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

-- Configuramos la secuencia para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER TABLE users.users ALTER COLUMN id SET DEFAULT uuid_generate_v4(); 