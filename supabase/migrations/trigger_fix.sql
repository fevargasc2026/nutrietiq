-- Final Robust Trigger Fix
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
AS $$
DECLARE
    v_nombre TEXT;
    v_empresa TEXT;
    v_rol public.user_role;
BEGIN
    -- Set defaults from metadata
    v_nombre := COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario Nuevo');
    v_empresa := COALESCE(new.raw_user_meta_data->>'empresa', 'Sin Empresa');
    
    -- Designate SuperUsuario by email
    IF new.email = 'fvargas@fvcconsult.cl' THEN
        v_rol := 'SuperUsuario'::public.user_role;
        v_nombre := 'Francisco Vargas Calderón';
    ELSE
        v_rol := 'Administrador'::public.user_role;
    END IF;

    -- Use INSERT ... ON CONFLICT to prevent "Database error" if row already exists
    INSERT INTO public.usuarios (id, nombre, email, rol, empresa)
    VALUES (new.id, v_nombre, new.email, v_rol, v_empresa)
    ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        email = EXCLUDED.email,
        rol = EXCLUDED.rol,
        empresa = EXCLUDED.empresa;
    
    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- If everything fails, still return new so the Auth user is created
    -- The profile can be fixed manually later if needed
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
