// supabase/functions/scrape-metadata/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'npm:cheerio@1.0.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Resolves relative paths (/assets/og.jpg) into full URLs (https://example.com/assets/og.jpg)
function resolveUrl(relativeUrl: string | undefined | null, baseUrl: string): string {
  if (!relativeUrl) return ''
  try {
    return new URL(relativeUrl, baseUrl).href
  } catch {
    return relativeUrl
  }
}

Deno.serve(async (req) => {
  let record: any = null

  try {
    const payload = await req.json()
    record = payload.record

    if (!record || !record.original_url) {
      return new Response('No URL provided', { status: 400 })
    }

    const url = record.original_url.trim()
    console.log(`Processing: ${url}`)

    let title = ''
    let description = ''
    let imageUrl = ''

    // --- STRATEGY 1: YOUTUBE (oEmbed + High-Res Fallback) ---
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        console.log('Fetching YouTube oEmbed...')
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        const ytRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) })

        if (ytRes.ok) {
          const ytData = await ytRes.json()
          title = ytData.title
          description = `YouTube video by ${ytData.author_name}`

          const idMatch = url.match(/(?:youtu\.be\/|watch\?v=|\/embed\/|\/v\/)([\w-]{11})/)
          imageUrl = idMatch ? `https://i.ytimg.com/vi/${idMatch[1]}/hqdefault.jpg` : ytData.thumbnail_url
        }
      } catch (e) {
        console.log('YouTube failed:', (e as Error).message)
      }
    }

    // --- STRATEGY 2: TIKTOK (Official Free oEmbed) ---
    else if (url.includes('tiktok.com')) {
      try {
        console.log('Fetching TikTok oEmbed...')
        const ttRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
          signal: AbortSignal.timeout(5000),
        })
        if (ttRes.ok) {
          const ttData = await ttRes.json()
          title = ttData.title || `TikTok by ${ttData.author_name}`
          description = `TikTok by ${ttData.author_name}`
          imageUrl = ttData.thumbnail_url
        }
      } catch (e) {
        console.log('TikTok failed:', (e as Error).message)
      }
    }

    // --- STRATEGY 3: X / TWITTER (FxTwitter API) ---
    else if (url.includes('x.com') || url.includes('twitter.com')) {
      try {
        console.log('Fetching X/Twitter post...')
        const tweetMatch = url.match(/status\/(\d+)/)
        const tweetId = tweetMatch ? tweetMatch[1] : null

        if (tweetId) {
          const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
            signal: AbortSignal.timeout(5000),
          })

          if (res.ok) {
            const data = await res.json()
            if (data.tweet) {
              const author = data.tweet.author
              title = `Post by ${author.name} (@${author.screen_name})`
              description = data.tweet.text || ''

              if (data.tweet.media?.photos?.length > 0) {
                imageUrl = data.tweet.media.photos[0].url
              } else if (data.tweet.media?.videos?.length > 0) {
                imageUrl = data.tweet.media.videos[0].thumbnail_url
              } else if (author.avatar_url) {
                imageUrl = author.avatar_url
              }
            }
          }
        }
      } catch (e) {
        console.log('Twitter failed:', (e as Error).message)
      }
    }

    // --- STRATEGY 4: INSTAGRAM (Embed Frame Bypass) ---
    else if (url.includes('instagram.com')) {
      try {
        console.log('Scraping Instagram via embed frame...')
        const postMatch = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/)
        const embedUrl = postMatch
          ? `https://www.instagram.com/${postMatch[1]}/${postMatch[2]}/embed/captioned/`
          : url

        const response = await fetch(embedUrl, {
          signal: AbortSignal.timeout(5000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        })

        if (response.ok) {
          const html = await response.text()
          const $ = cheerio.load(html)

          imageUrl = $('img.EmbeddedMediaImage').attr('src') || $('meta[property="og:image"]').attr('content') || ''
          description = $('.Caption').text() || $('meta[property="og:description"]').attr('content') || ''
          title = description ? description.slice(0, 60) + '...' : 'Instagram Post'
        }
      } catch (e) {
        console.log('Instagram failed:', (e as Error).message)
      }
    }

    // --- STRATEGY: LEETCODE (Problems & User Profiles) ---
    else if (url.includes('leetcode.com')) {
      try {
        console.log('Detected LeetCode link, running specialized scraper...')

        const parsedUrl = new URL(url)
        const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)

        // 1. PROBLEM URL: /problems/:slug
        if (pathSegments[0] === 'problems' && pathSegments[1]) {
          const slug = pathSegments[1]

          const gqlRes = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            signal: AbortSignal.timeout(5000),
            headers: {
              'Content-Type': 'application/json',
              'Referer': `https://leetcode.com/problems/${slug}/`,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: JSON.stringify({
              query: `
                query getQuestionDetails($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                    title
                    difficulty
                    categoryTitle
                  }
                }
              `,
              variables: { titleSlug: slug },
            }),
          })

          if (gqlRes.ok) {
            const gqlData = await gqlRes.json()
            const q = gqlData.data?.question
            if (q) {
              title = `${q.title} (${q.difficulty}) - LeetCode`
              description = `Difficulty: ${q.difficulty} | Category: ${q.categoryTitle || 'Algorithms'}. Practice this problem on LeetCode.`
              imageUrl = 'https://leetcode.com/static/images/LeetCode_Sharing.png'
            }
          }
        }

        // 2. USER PROFILE URL: /u/:username OR /:username
        else {
          const reservedRoutes = ['problems', 'contest', 'explore', 'discuss', 'studyplan', 'playground', 'subscribe', 'company']
          
          let username = ''
          if (pathSegments[0] === 'u' && pathSegments[1]) {
            username = pathSegments[1]
          } else if (pathSegments[0] && !reservedRoutes.includes(pathSegments[0])) {
            username = pathSegments[0]
          }

          if (username) {
            const userRes = await fetch('https://leetcode.com/graphql', {
              method: 'POST',
              signal: AbortSignal.timeout(5000),
              headers: {
                'Content-Type': 'application/json',
                'Referer': `https://leetcode.com/u/${username}/`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
              body: JSON.stringify({
                query: `
                  query getUserProfile($username: String!) {
                    matchedUser(username: $username) {
                      username
                      profile {
                        realName
                        userAvatar
                        ranking
                      }
                      submitStatsGlobal {
                        acSubmissionNum {
                          difficulty
                          count
                        }
                      }
                    }
                  }
                `,
                variables: { username },
              }),
            })

            if (userRes.ok) {
              const userData = await userRes.json()
              const user = userData.data?.matchedUser

              if (user) {
                const displayName = user.profile?.realName || user.username
                const rank = user.profile?.ranking ? `#${user.profile.ranking.toLocaleString()}` : 'N/A'
                
                // Total solved is the "All" difficulty entry in acSubmissionNum
                const totalSolved = user.submitStatsGlobal?.acSubmissionNum?.find(
                  (item: { difficulty: string; count: number }) => item.difficulty === 'All'
                )?.count || 0

                title = `${displayName} (@${user.username}) on LeetCode`
                description = `Solved: ${totalSolved} problems | Global Ranking: ${rank}`
                imageUrl = user.profile?.userAvatar || 'https://leetcode.com/static/images/LeetCode_Sharing.png'
              }
            }
          }
        }

        // 3. Fallback to Twitterbot if GraphQL yields nothing (e.g., contest or study plan pages)
        if (!title) {
          const twRes = await fetch(url, {
            signal: AbortSignal.timeout(5000),
            headers: {
              'User-Agent': 'Twitterbot/1.0',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          })

          if (twRes.ok) {
            const html = await twRes.text()
            const $ = cheerio.load(html)
            title = $('meta[property="og:title"]').attr('content') || $('title').text() || ''
            description = $('meta[property="og:description"]').attr('content') || ''
            imageUrl = $('meta[property="og:image"]').attr('content') || 'https://leetcode.com/static/images/LeetCode_Sharing.png'
          }
        }
      } catch (e) {
        console.log('LeetCode scraper failed:', (e as Error).message)
      }
    }

    // --- STRATEGY 5: GENERAL FALLBACK (Social Bot User-Agent) ---
    if (!title) {
      try {
        console.log('Running general metadata scraper...')
        const response = await fetch(url, {
          signal: AbortSignal.timeout(6000),
          headers: {
            'User-Agent': 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        })

        if (response.ok) {
          const html = await response.text()
          const $ = cheerio.load(html)

          title =
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('title').text() || $('h1').first().text() ||
            ''

          description =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            ''

          const rawImage =
            $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('link[rel="image_src"]').attr('href') ||
            ''

          imageUrl = resolveUrl(rawImage, url)
        }
      } catch (e) {
        console.log('General scraper failed:', (e as Error).message)
      }
    }

    // --- CLEANUP & DATABASE UPDATE ---
    const cleanedTitle = title.replace(/\s+/g, ' ').trim() || new URL(url).hostname
    const cleanedDescription = description.replace(/\s+/g, ' ').trim()
    const cleanedImage = imageUrl ? resolveUrl(imageUrl, url) : ''

    await supabase
      .from('items')
      .update({
        title: cleanedTitle,
        description: cleanedDescription || null,
        image_url: cleanedImage || null,
        is_processed: true,
      })
      .eq('id', record.id)

    console.log(`Saved [${record.id}]: ${cleanedTitle}`)

    return new Response(JSON.stringify({ success: true, title: cleanedTitle }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Fatal Edge Function Error:', (err as Error).message)

    if (record?.id) {
      await supabase
        .from('items')
        .update({
          title: record.original_url || 'Untitled Link',
          is_processed: true,
        })
        .eq('id', record.id)
    }

    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})