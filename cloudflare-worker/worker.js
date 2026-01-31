/**
 * Cloudflare Worker to proxy Anthropic API requests
 * This solves CORS issues for frontend-only apps
 *
 * Deploy instructions:
 * 1. Sign up at cloudflare.com
 * 2. Go to Workers & Pages
 * 3. Create a new Worker
 * 4. Copy this code
 * 5. Deploy
 * 6. Get your Worker URL (e.g., https://prepwise-api.yourdomain.workers.dev)
 */

export default {
  async fetch(request, env, ctx) {
    // CORS headers to include in all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      )
    }

    try {
      // Get API key from request header
      const apiKey = request.headers.get('x-api-key')

      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key required' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            }
          }
        )
      }

      // Get request body
      const body = await request.text()

      // Forward request to Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: body,
      })

      // Get response
      const data = await response.text()

      // Return response with CORS headers
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      })
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      )
    }
  },
}
