import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('usuarios')
    .select('rol, nombre')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error fetching profile:', profileError);
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar userRole={profile?.rol} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userRole={profile?.rol} userName={profile?.nombre} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
      <div className="fixed bottom-4 right-6 pointer-events-none z-50">
        <span className="text-[10px] text-muted-foreground/30 font-medium">
          Desarrollado por FVC-2026
        </span>
      </div>
    </div>
  );
}
