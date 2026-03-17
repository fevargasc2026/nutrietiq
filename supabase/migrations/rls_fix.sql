-- Fix: Remove circular RLS policy on 'usuarios' table
DROP POLICY IF EXISTS "SuperUsuarios pueden gestionar todos los usuarios" ON public.usuarios;

-- 1. Allow any authenticated user to see THEIR OWN profile
CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON public.usuarios
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 2. Allow SuperUsuarios to manage ALL users (using email check to avoid recursion on the same table)
CREATE POLICY "SuperUsuarios gestion total" 
ON public.usuarios
FOR ALL 
TO authenticated 
USING (
    (auth.jwt() ->> 'email' = 'fvargas@fvcconsult.cl')
);

-- 3. Also allow any SuperUsuario (by role) to see others, 
-- but we must be careful. For now, the email check is safest and direct for your account.
