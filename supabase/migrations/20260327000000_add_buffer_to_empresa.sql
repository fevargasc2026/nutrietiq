-- Agrega campos de preferencias del sistema (Buffer y Mark-up) a la configuración de la empresa
ALTER TABLE public.empresa
  ADD COLUMN IF NOT EXISTS buffer_pct NUMERIC(5,2) NOT NULL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS markup_factor NUMERIC(5,2) NOT NULL DEFAULT 3.0;

COMMENT ON COLUMN public.empresa.buffer_pct IS 'Porcentaje global de costo indirecto o buffer (%)';
COMMENT ON COLUMN public.empresa.markup_factor IS 'Factor global de mark-up para margen de comercialización';
