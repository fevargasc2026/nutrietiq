'use client';

import { useState } from 'react';
import { Search, Edit2, Eye } from 'lucide-react';
import Link from 'next/link';
import { DeleteRecipeButton } from './DeleteRecipeButton';

interface Recipe {
  id: string;
  nombre: string;
  categoria: string | null;
  porciones: number;
  peso_final: number;
  fecha_creacion: string;
  usuarios: {
    nombre: string | null;
  } | null;
}

interface RecipeListProps {
  initialRecipes: Recipe[];
}

export function RecipeList({ initialRecipes }: RecipeListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = initialRecipes.filter((recipe) =>
    recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.categoria?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center px-3 py-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full max-w-sm">
          <Search className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
          <input 
            placeholder="Buscar receta..." 
            className="flex h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoría</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Peso Final (g)</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Porciones</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Creador</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredRecipes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm border-b">
                    {searchTerm ? 'No se encontraron recetas con ese nombre.' : 'No tienes recetas creadas aún.'}
                  </td>
                </tr>
              ) : (
                filteredRecipes.map((receta) => (
                  <tr key={receta.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{receta.nombre}</td>
                    <td className="p-4 align-middle">{receta.categoria || '-'}</td>
                    <td className="p-4 align-middle">{receta.peso_final}</td>
                    <td className="p-4 align-middle">{receta.porciones}</td>
                    <td className="p-4 align-middle">{receta.usuarios?.nombre || 'Desconocido'}</td>
                    <td className="p-4 align-middle">{new Date(receta.fecha_creacion).toLocaleDateString('es-CL')}</td>
                    <td className="p-4 align-middle">
                       <div className="flex items-center justify-center gap-2">
                         <Link 
                           href={`/simulador/${receta.id}`} 
                           title="Ver etiqueta nutricional"
                           className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-blue-600"
                         >
                           <Eye className="h-4 w-4" />
                         </Link>
                          <Link 
                            href={`/recetas/${receta.id}/editar`} 
                            title="Editar receta"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <DeleteRecipeButton id={receta.id} recipeName={receta.nombre} />
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
