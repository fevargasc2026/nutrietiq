-- Migration: Security Fixes
-- Description: Refines RLS policies for 'usuarios' and 'ingredientes' tables.

-- 1. Usuarios table: Limit visibility
DROP POLICY IF EXISTS "Usuarios pueden ver todos los usuarios" ON public.usuarios;
CREATE POLICY "Usuarios pueden ver su propia empresa o perfil" ON public.usuarios
FOR SELECT TO authenticated 
USING (
    auth.uid() = id OR 
    empresa = (SELECT empresa FROM public.usuarios WHERE id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'SuperUsuario')
);

-- 2. Ingredientes table: Refine permissions
DROP POLICY IF EXISTS "Usuarios pueden gestionar ingredientes" ON public.ingredientes;

-- Allow SELECT for all authenticated
-- This is already handled by "Usuarios pueden ver ingredientes" policy in 20260316000001_rls_policies.sql
-- but let's ensure it's robust if needed.

-- Allow INSERT for cache/IA (all authenticated)
CREATE POLICY "Usuarios pueden crear ingredientes" ON public.ingredientes
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow UPDATE for Administrador and SuperUsuario
CREATE POLICY "Administradores pueden actualizar ingredientes" ON public.ingredientes
FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol IN ('Administrador', 'SuperUsuario'))
);

-- Allow DELETE only for SuperUsuario
CREATE POLICY "SuperUsuarios pueden eliminar ingredientes" ON public.ingredientes
FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'SuperUsuario')
);
