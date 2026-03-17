'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signOut() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    // Even if there is an error, we usually want to clear the local session and redirect
  }
  
  revalidatePath('/', 'layout');
  const message = encodeURIComponent('¡Gracias por usar NUTRIETIQ! Tu sesión ha sido cerrada correctamente.');
  redirect(`/login?message=${message}&type=success`);
}
