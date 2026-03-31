-- Elimina el campo redundante resolucion_sanitaria de la tabla empresa
ALTER TABLE public.empresa
  DROP COLUMN IF EXISTS resolucion_sanitaria;
