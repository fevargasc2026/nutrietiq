'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nombre = formData.get('nombre') as string;
  const empresa = formData.get('empresa') as string;
  
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          empresa,
        },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    return { success: true, nombre };
  } catch (e: any) {
    return { error: e.message || 'Error inesperado' };
  }
}
