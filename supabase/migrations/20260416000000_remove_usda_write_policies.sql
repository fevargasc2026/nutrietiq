-- Seguridad: Eliminar políticas de escritura en usda_alimentos
-- El endpoint API ya no escribe en esta tabla, solo lee

-- Eliminar política de INSERT (ya no se usa)
DROP POLICY IF EXISTS "Permitir inserción de alimentos generados por IA" ON usda_alimentos;

-- Eliminar política de UPDATE (ya no se usa)
DROP POLICY IF EXISTS "Permitir actualización de alimentos USDA" ON usda_alimentos;