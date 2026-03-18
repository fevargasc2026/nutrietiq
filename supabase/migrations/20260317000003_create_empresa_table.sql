-- Migration: Create Empresa table and link to Usuarios
-- Description: Creates the 'empresa' table and adds a foreign key constraint to 'usuarios.empresa'.

-- 1. Create 'empresa' table
CREATE TABLE IF NOT EXISTS public.empresa (
    empresa TEXT PRIMARY KEY,
    rut TEXT NOT NULL,
    direccion TEXT NOT NULL,
    resolucion TEXT NOT NULL,
    fecha_res DATE NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Insert existing companies from usuarios table to avoid FK violations
-- This ensures that any company name already in use by a user exists in the empresa table.
INSERT INTO public.empresa (empresa, rut, direccion, resolucion, fecha_res)
SELECT DISTINCT empresa, 'S/R', 'Sin Dirección', '0', CURRENT_DATE
FROM public.usuarios
WHERE empresa IS NOT NULL
ON CONFLICT (empresa) DO NOTHING;

-- 3. Add Foreign Key constraint to usuarios table
-- Note: This ensures integrity. If there are users with other empresa names, they must exist in the empresa table first.
ALTER TABLE public.usuarios 
ADD CONSTRAINT fk_usuarios_empresa 
FOREIGN KEY (empresa) 
REFERENCES public.empresa(empresa) 
ON UPDATE CASCADE;

-- 4. Set up RLS for 'empresa' table
ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;

-- 4.1. Select policy: Users can see the company they belong to
CREATE POLICY "Usuarios pueden ver su propia empresa" ON public.empresa
FOR SELECT TO authenticated
USING (
    empresa = (SELECT empresa FROM public.usuarios WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'SuperUsuario')
);

-- 4.2. All policy: SuperUsuario has full control
CREATE POLICY "SuperUsuarios tienen control total sobre empresa" ON public.empresa
FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'SuperUsuario')
);
