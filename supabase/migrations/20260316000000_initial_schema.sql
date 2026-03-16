-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Types
CREATE TYPE user_role AS ENUM ('Administrador', 'Nutricionista', 'Operador');

-- Table: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol user_role NOT NULL DEFAULT 'Operador',
    empresa TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: ingredientes
CREATE TABLE ingredientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    energia_kcal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    proteina_g NUMERIC(10, 2) NOT NULL DEFAULT 0,
    grasa_total_g NUMERIC(10, 2) NOT NULL DEFAULT 0,
    grasa_saturada_g NUMERIC(10, 2) NOT NULL DEFAULT 0,
    carbohidratos_g NUMERIC(10, 2) NOT NULL DEFAULT 0,
    azucares_g NUMERIC(10, 2) NOT NULL DEFAULT 0,
    sodio_mg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    fibra_g NUMERIC(10, 2) NOT NULL DEFAULT 0,
    added_sugars BOOLEAN NOT NULL DEFAULT false,
    added_saturated_fats BOOLEAN NOT NULL DEFAULT false,
    alergenos TEXT[] DEFAULT '{}',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: recetas
CREATE TABLE recetas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    categoria TEXT,
    peso_bruto NUMERIC(10, 2) NOT NULL DEFAULT 0,
    peso_final NUMERIC(10, 2) NOT NULL DEFAULT 0,
    factor_rendimiento NUMERIC(5, 4) NOT NULL DEFAULT 1.0,
    porciones INTEGER NOT NULL DEFAULT 1,
    usuario_creador UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    version INTEGER NOT NULL DEFAULT 1
);

-- Table: receta_ingredientes
CREATE TABLE receta_ingredientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
    ingrediente_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE RESTRICT,
    peso_gramos NUMERIC(10, 2) NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0,
    UNIQUE(receta_id, ingrediente_id)
);

-- Table: calculos_nutricionales
CREATE TABLE calculos_nutricionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    energia_100g NUMERIC(10, 2) NOT NULL,
    proteina_100g NUMERIC(10, 2) NOT NULL,
    grasa_total_100g NUMERIC(10, 2) NOT NULL,
    carbohidratos_100g NUMERIC(10, 2) NOT NULL,
    azucares_100g NUMERIC(10, 2) NOT NULL,
    sodio_100g NUMERIC(10, 2) NOT NULL,
    energia_porcion NUMERIC(10, 2) NOT NULL,
    proteina_porcion NUMERIC(10, 2) NOT NULL,
    grasa_porcion NUMERIC(10, 2) NOT NULL,
    carbohidratos_porcion NUMERIC(10, 2) NOT NULL,
    azucares_porcion NUMERIC(10, 2) NOT NULL,
    sodio_porcion NUMERIC(10, 2) NOT NULL,
    sello_calorias BOOLEAN NOT NULL DEFAULT false,
    sello_sodio BOOLEAN NOT NULL DEFAULT false,
    sello_azucar BOOLEAN NOT NULL DEFAULT false,
    sello_grasa BOOLEAN NOT NULL DEFAULT false,
    fecha_calculo TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS for all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculos_nutricionales ENABLE ROW LEVEL SECURITY;
