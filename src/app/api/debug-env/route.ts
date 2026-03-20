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
    timestamp: new Date().toISOString()
  })
}
