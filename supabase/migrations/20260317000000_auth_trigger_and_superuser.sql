-- Migration: Add SuperUsuario and Auth Trigger
-- Description: Adds 'SuperUsuario' to user_role enum and creates a trigger for automatic profile creation in public.usuarios.

-- 1. Add 'SuperUsuario' to user_role enum
-- Note: PostgreSQL doesn't support adding enum values inside a transaction easily in some versions, 
-- but Supabase usually handles this. If it fails, we might need a different approach.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'SuperUsuario';

-- 2. Create the trigger function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_nombre TEXT;
    v_empresa TEXT;
    v_rol user_role;
BEGIN
    -- Extract metadata from auth.users (if provided during signUp)
    v_nombre := COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario Nuevo');
    v_empresa := COALESCE(new.raw_user_meta_data->>'empresa', 'Sin Empresa');
    
    -- Designate SuperUsuario by email
    IF new.email = 'fvargas@fvcconsult.cl' THEN
        v_rol := 'SuperUsuario';
        v_nombre := 'Francisco Vargas Calderón';
    ELSE
        -- Default role for others could be Administrador or Operador depending on requirements
        -- Based on existing code, we'll default to Administrador for now if registered via web
        v_rol := 'Administrador';
    END IF;

    -- Ensure the company exists in the empresa table to avoid FK violation
    INSERT INTO public.empresa (empresa, rut, direccion, resolucion, fecha_res)
    VALUES (v_empresa, 'S/R', 'Sin Dirección', '0', CURRENT_DATE)
    ON CONFLICT (empresa) DO NOTHING;

    INSERT INTO public.usuarios (id, nombre, email, rol, empresa)
    VALUES (new.id, v_nombre, new.email, v_rol, v_empresa);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update RLS Policies for SuperUsuario access

-- Policy for 'usuarios' table: SuperUsuario can do everything
CREATE POLICY "SuperUsuarios pueden gestionar todos los usuarios" ON public.usuarios
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'SuperUsuario')
);

-- Update existing policies for other tables to include SuperUsuario
-- Note: We add OR EXISTS (...) AND rol = 'SuperUsuario' to existing logic

-- Ingredientes
DROP POLICY IF EXISTS "Usuarios pueden gestionar ingredientes" ON ingredientes;
CREATE POLICY "Usuarios pueden gestionar ingredientes" ON ingredientes
FOR ALL TO authenticated USING (
    TRUE -- Existing was TRUE, so SuperUsuario is covered
);

-- Recetas
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias recetas" ON recetas;
CREATE POLICY "Usuarios pueden actualizar sus propias recetas" ON recetas
FOR UPDATE TO authenticated USING (
    auth.uid() = usuario_creador OR 
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Administrador', 'SuperUsuario'))
);

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias recetas" ON recetas;
CREATE POLICY "Usuarios pueden eliminar sus propias recetas" ON recetas
FOR DELETE TO authenticated USING (
    auth.uid() = usuario_creador OR 
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Administrador', 'SuperUsuario'))
);

-- Receta Ingredientes
DROP POLICY IF EXISTS "Usuarios pueden gestionar receta_ingredientes" ON receta_ingredientes;
CREATE POLICY "Usuarios pueden gestionar receta_ingredientes" ON receta_ingredientes
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM recetas WHERE id = receta_id AND (
        usuario_creador = auth.uid() OR 
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Administrador', 'SuperUsuario'))
    ))
);

-- Calculos Nutricionales
DROP POLICY IF EXISTS "Usuarios pueden gestionar calculos" ON calculos_nutricionales;
CREATE POLICY "Usuarios pueden gestionar calculos" ON calculos_nutricionales
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM recetas WHERE id = receta_id AND (
        usuario_creador = auth.uid() OR 
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('Administrador', 'SuperUsuario'))
    ))
);
