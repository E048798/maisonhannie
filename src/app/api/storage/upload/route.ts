import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = String(form.get('folder') || 'products')
    const bucket = String(form.get('bucket') || 'Images')
    if (!file) return new Response(JSON.stringify({ error: 'Missing file' }), { status: 400 })

    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string
    if (!url || !serviceKey) return new Response(JSON.stringify({ error: 'Server configuration error', details: { url: !!url, key: !!serviceKey } }), { status: 500 })
    const admin = createClient(url, serviceKey)

    const ext = file.name.split('.').pop() || 'bin'
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const bucketInfo = await admin.storage.getBucket(bucket)
    if (!bucketInfo?.data) {
      await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: '50MB' })
    }

    const ab = await file.arrayBuffer()
    const bytes = new Uint8Array(ab)
    let { error } = await admin.storage.from(bucket).upload(path, bytes, { upsert: false, contentType: file.type || 'application/octet-stream' })
    if (error) {
      const alt = await admin.storage.from('images').upload(path, bytes, { upsert: false, contentType: file.type || 'application/octet-stream' })
      if (alt.error) {
        return new Response(JSON.stringify({ error: alt.error.message || error.message }), { status: 400 })
      }
      const { data } = admin.storage.from('images').getPublicUrl(path)
      return new Response(JSON.stringify({ url: data.publicUrl }), { status: 200 })
    }
    const { data } = admin.storage.from(bucket).getPublicUrl(path)
    return new Response(JSON.stringify({ url: data.publicUrl }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || 'Server error') }), { status: 500 })
  }
}
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'