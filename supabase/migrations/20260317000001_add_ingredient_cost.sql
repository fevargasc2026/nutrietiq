ALTER TABLE public.ingredientes 
ADD COLUMN costo_unitario NUMERIC DEFAULT 0,
ADD COLUMN unidad_medida_costo TEXT DEFAULT 'kg';

COMMENT ON COLUMN public.ingredientes.costo_unitario IS 'Costo del ingrediente por la unidad de medida especificada.';
COMMENT ON COLUMN public.ingredientes.unidad_medida_costo IS 'Unidad de medida a la que aplica el costo (ej: kg, litro, unidad).';
