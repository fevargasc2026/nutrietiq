'use client';

import { Trash2 } from 'lucide-react';

interface User {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  rol: string;
}

interface UserTableProps {
  users: User[];
  currentUserId: string;
  updateRole: (formData: FormData) => Promise<void>;
  deleteUser: (formData: FormData) => Promise<void>;
}

export function UserTable({ users, currentUserId, updateRole, deleteUser }: UserTableProps) {
  return (
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
                    <form action={deleteUser} onSubmit={(e) => {
                      if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                        e.preventDefault();
                      }
                    }}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button 
                        type="submit"
                        disabled={u.rol === 'SuperUsuario' && currentUserId === u.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-red-500 disabled:opacity-50"
                        title="Eliminar usuario"
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
  );
}
