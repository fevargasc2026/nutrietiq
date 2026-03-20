import { NextResponse } from 'next/server'

export async function GET() {
  const envKeys = Object.keys(process.env)
  const supabaseKeys = envKeys.filter(key => 
    key.includes('SUPABASE') || 
    key.includes('KEY') || 
    key.includes('URL') || 
    key.includes('SERVICE')
  )
  
  return NextResponse.json({
    message: "Debugging environment variables (Keys only)",
    present_keys: supabaseKeys,
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'not-vercel',
    timestamp: new Date().toISOString(),
    tip: "If you don't see SUPABASE_SERVICE_ROLE_KEY, make sure it's added to Vercel Settings > Environment Variables and marked for all environments (Production, Preview, Development)."
  })
}
