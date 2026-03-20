-- Tabla de alimentos USDA para búsqueda local
-- Ejecutar este SQL desde el Dashboard de Supabase (SQL Editor)

CREATE TABLE IF NOT EXISTS usda_alimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fdc_id INTEGER UNIQUE NOT NULL,
    description TEXT NOT NULL,
    description_es TEXT,
    data_type TEXT,
    category TEXT,
    energia_kcal NUMERIC(10, 2),
    proteina_g NUMERIC(10, 2),
    grasa_total_g NUMERIC(10, 2),
    grasa_saturada_g NUMERIC(10, 2),
    carbohidratos_g NUMERIC(10, 2),
    fibra_g NUMERIC(10, 2),
    azucares_g NUMERIC(10, 2),
    sodio_mg NUMERIC(10, 2),
    alergenos TEXT[] DEFAULT '{}',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usda_alimentos_description ON usda_alimentos USING gin(to_tsvector('spanish', description));
CREATE INDEX IF NOT EXISTS idx_usda_alimentos_description_es ON usda_alimentos USING gin(to_tsvector('spanish', description_es));
CREATE INDEX IF NOT EXISTS idx_usda_alimentos_fdc_id ON usda_alimentos(fdc_id);

-- RLS
ALTER TABLE usda_alimentos ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Permitir lectura pública de alimentos USDA"
    ON usda_alimentos FOR SELECT
    TO authenticated
    USING (true);