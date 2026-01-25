import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase Environment Variables')
      return new Response(JSON.stringify({ error: 'Configuration Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Minimal database query
    const { data, error } = await supabase
      .from('health_check')
      .select('last_checked_at')
      .maybeSingle() // Use maybeSingle to avoid 406 if table is empty

    if (error) {
      console.error('Supabase Query Error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // If no data exists yet, that's fine for a health check
    
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
    console.error('Unhandled Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
