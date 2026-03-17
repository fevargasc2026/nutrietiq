import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { UserTable } from '@/components/usuarios/UserTable';

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

      <UserTable 
        users={users || []} 
        currentUserId={user.id} 
        updateRole={updateRole} 
        deleteUser={deleteUser} 
      />
    </div>
  );
}
