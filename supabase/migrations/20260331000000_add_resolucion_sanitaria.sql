-- Agrega el campo resolucion_sanitaria a la tabla empresa
ALTER TABLE public.empresa
  ADD COLUMN IF NOT EXISTS resolucion_sanitaria TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.empresa.resolucion_sanitaria IS 'Texto o detalle de la Resolución Sanitaria';
