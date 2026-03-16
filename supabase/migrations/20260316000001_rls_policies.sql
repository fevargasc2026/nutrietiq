-- RLS Policies

-- Usuarios
CREATE POLICY "Usuarios pueden ver todos los usuarios" ON usuarios
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Ingredientes
CREATE POLICY "Usuarios pueden ver ingredientes" ON ingredientes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios pueden gestionar ingredientes" ON ingredientes
FOR ALL TO authenticated USING (true);

-- Recetas
CREATE POLICY "Usuarios pueden ver recetas" ON recetas
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios pueden crear recetas" ON recetas
FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_creador);

CREATE POLICY "Usuarios pueden actualizar sus propias recetas" ON recetas
FOR UPDATE TO authenticated USING (auth.uid() = usuario_creador OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Administrador'));

CREATE POLICY "Usuarios pueden eliminar sus propias recetas" ON recetas
FOR DELETE TO authenticated USING (auth.uid() = usuario_creador OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Administrador'));

-- Receta Ingredientes
CREATE POLICY "Usuarios pueden ver receta_ingredientes" ON receta_ingredientes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios pueden gestionar receta_ingredientes" ON receta_ingredientes
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM recetas WHERE id = receta_id AND (usuario_creador = auth.uid() OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Administrador')))
);

-- Calculos Nutricionales
CREATE POLICY "Usuarios pueden ver calculos" ON calculos_nutricionales
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios pueden gestionar calculos" ON calculos_nutricionales
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM recetas WHERE id = receta_id AND (usuario_creador = auth.uid() OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'Administrador')))
);

-- Storage (if used)
insert into storage.buckets (id, name, public) values ('labels', 'labels', true) ON CONFLICT DO NOTHING;
insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', false) ON CONFLICT DO NOTHING;
