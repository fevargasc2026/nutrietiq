-- Tabla de alimentos USDA para búsqueda local
CREATE TABLE usda_alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fdc_id INTEGER UNIQUE NOT NULL,
    description TEXT NOT NULL,
    description_es TEXT,
    data_type TEXT,
    category TEXT,
    -- Nutrientes por 100g
    energia_kcal NUMERIC(10, 2),
    proteina_g NUMERIC(10, 2),
    grasa_total_g NUMERIC(10, 2),
    grasa_saturada_g NUMERIC(10, 2),
    carbohidratos_g NUMERIC(10, 2),
    fibra_g NUMERIC(10, 2),
    azucares_g NUMERIC(10, 2),
    sodio_mg NUMERIC(10, 2),
    -- Metadatos
    alergenos TEXT[] DEFAULT '{}',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Índice para búsqueda por nombre
CREATE INDEX idx_usda_alimentos_description ON usda_alimentos USING gin(to_tsvector('spanish', description));

-- Índice para búsqueda por nombre en español
CREATE INDEX idx_usda_alimentos_description_es ON usda_alimentos USING gin(to_tsvector('spanish', description_es));

-- Índice para búsqueda por fdc_id
CREATE INDEX idx_usda_alimentos_fdc_id ON usda_alimentos(fdc_id);

-- Habilitar RLS (opcional - puede ser pública para búsquedas)
ALTER TABLE usda_alimentos ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para búsquedas
CREATE POLICY "Permitir lectura pública de alimentos USDA"
    ON usda_alimentos FOR SELECT
    TO authenticated
    USING (true);