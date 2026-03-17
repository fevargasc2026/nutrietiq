import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Trash2, Shield, User } from 'lucide-react';

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify SuperUsuario role
  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profile?.rol !== 'SuperUsuario') {
    redirect('/');
  }

  // Fetch all users
  const { data: users, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  const updateRole = async (formData: FormData) => {
    'use server';
    const userId = formData.get('userId') as string;
    const newRole = formData.get('role') as string;

    const supabase = await createClient();
    const { error } = await supabase
      .from('usuarios')
      .update({ rol: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
    }
    revalidatePath('/usuarios');
  };

  const deleteUser = async (formData: FormData) => {
    'use server';
    const userId = formData.get('userId') as string;

    const supabase = await createClient();
    // In a real app, you might want to call an edge function to also delete from auth.users
    // For now, RLS/FK cascade handles public.usuarios if auth.users is deleted,
    // but here we are deleting from public.usuarios. 
    // Usually admin would delete via supabase.auth.admin.deleteUser(id)
    
    // NOTE: Deleting from auth.users requires service_role key.
    // For this MVP, we'll just remove the profile or restrict app access.
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId);

    if (error) {
       console.error('Error deleting user profile:', error);
    }
    revalidatePath('/usuarios');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra los accesos y roles de la plataforma.</p>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 transition-colors">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Empresa</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rol</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users?.map((u) => (
                <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">{u.nombre}</td>
                  <td className="p-4 align-middle text-muted-foreground">{u.email}</td>
                  <td className="p-4 align-middle">{u.empresa || '-'}</td>
                  <td className="p-4 align-middle">
                    <form action={updateRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select 
                        name="role" 
                        defaultValue={u.rol}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onChange={(e) => e.target.form?.requestSubmit()}
                      >
                        <option value="SuperUsuario">SuperUsuario</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Nutricionista">Nutricionista</option>
                        <option value="Operador">Operador</option>
                      </select>
                    </form>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button 
                          type="submit"
                          disabled={u.rol === 'SuperUsuario' && user.id === u.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-red-500 disabled:opacity-50"
                          title="Eliminar usuario"
                          onClick={(e) => {
                            if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
