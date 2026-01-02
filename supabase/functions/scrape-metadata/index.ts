// supabase/functions/scrape-metadata/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

// Load environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  try {
    // 1. Parse the incoming webhook payload
    const payload = await req.json()
    const { record } = payload // 'record' is the new row inserted into 'items'

    if (!record || !record.original_url) {
      return new Response('No URL provided', { status: 400 })
    }

    console.log(`Processing: ${record.original_url}`)

    // 2. Fetch HTML (Pretending to be Chrome to avoid blocking)
    const response = await fetch(record.original_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    })

    if (!response.ok) {
        throw new Error(`Failed to load page: ${response.status}`)
    }

    const html = await response.text()

    // 3. Scrape Metadata
    const $ = cheerio.load(html)
    
    // Priorities: OG Tags > Twitter Cards > Standard HTML Tags
    const title = 
      $('meta[property="og:title"]').attr('content') || 
      $('title').text() || 
      'No Title'

    const description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      ''

    const imageUrl = 
      $('meta[property="og:image"]').attr('content') || 
      ''

    // 4. Update the row in Supabase
    const { error } = await supabase
      .from('items')
      .update({
        title: title,
        description: description,
        image_url: imageUrl,
        is_processed: true 
      })
      .eq('id', record.id)

    if (error) throw error

    console.log(`Success! Updated: ${title}`)
    
    return new Response(JSON.stringify({ success: true, title }), { 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    console.error("Scrape Error:", err.message)
    // Even if it fails, return 200 so Supabase doesn't keep retrying forever
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
})

