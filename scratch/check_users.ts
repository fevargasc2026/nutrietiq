
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/francisco/Documentos/FVC-personales/DESARROLLO-2026/NUTRIETIQ/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUsers() {
  console.log('--- Checking auth.users ---');
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  console.log(`Found ${users.length} users in auth.`);

  console.log('\n--- Checking public.usuarios ---');
  const { data: profiles, error: profileError } = await supabase
    .from('usuarios')
    .select('*');

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }

  console.log(`Found ${profiles.length} profiles in public.usuarios.`);

  const profileMap = new Map(profiles.map(p => [p.id, p]));

  console.log('\n--- Comparison ---');
  users.forEach(user => {
    const profile = profileMap.get(user.id);
    if (profile) {
      console.log(`[OK]   ${user.email} (ID: ${user.id}) - Role in profile: ${profile.rol}`);
    } else {
      console.log(`[MISSING] ${user.email} (ID: ${user.id}) - NO PROFILE!`);
      if (user.user_metadata) {
        console.log(`      Metadata: ${JSON.stringify(user.user_metadata)}`);
      }
    }
  });
}

checkUsers();
