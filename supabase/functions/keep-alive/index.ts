import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Only allow GET requests to strictly follow "read-only" intent, though not strictly enforced by RLS for the function itself
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase Environment Variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Minimal database query
    const { data, error } = await supabase
      .from('health_check')
      .select('last_checked_at')
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        status: 'alive', 
        timestamp: new Date().toISOString(),
        check: 'success'
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
