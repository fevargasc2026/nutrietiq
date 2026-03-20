-- Habilitar permisos de inserción y actualización para usuarios autenticados
-- Esto permite que la "caché" de ingredientes generados por IA funcione correctamente
-- incluso cuando no se dispone de la service_role_key en producción.

-- Política para permitir INSERT
CREATE POLICY "Permitir inserción de alimentos generados por IA"
    ON usda_alimentos FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para permitir UPDATE (necesaria para el sistema de aprendizaje de alérgenos)
CREATE POLICY "Permitir actualización de alimentos USDA"
    ON usda_alimentos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
