-- Add professional cost management columns to recetas table
ALTER TABLE recetas 
ADD COLUMN IF NOT EXISTS costo_indirecto_pct NUMERIC(5, 2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS markup_factor NUMERIC(5, 2) DEFAULT 3.0;

-- Update existing recipes if any (though default covers it)
COMMENT ON COLUMN recetas.costo_indirecto_pct IS 'Porcentaje de costos ocultos/indirectos (sal, condimentos, etc)';
COMMENT ON COLUMN recetas.markup_factor IS 'Factor multiplicador para cubrir costos operacionales y utilidad';
