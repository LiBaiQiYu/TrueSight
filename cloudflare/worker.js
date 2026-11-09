const DOWNLOAD_FILES = new Set([
  'TrueSight-Setup-0.1.0-x64.exe',
  'TrueSight-Portable-0.1.0-x64.exe'
])

async function download(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' }
    })
  }

  const url = new URL(request.url)
  const name = decodeURIComponent(url.pathname.slice('/downloads/'.length))
  if (!DOWNLOAD_FILES.has(name)) {
    return new Response('Not Found', { status: 404 })
  }

  const object = await env.DOWNLOADS.get(name)
  if (!object) {
    return new Response('Not Found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Content-Type', 'application/octet-stream')
  headers.set('Content-Disposition', `attachment; filename="${name}"`)
  headers.set('Content-Length', String(object.size))
  headers.set('Cache-Control', 'public, max-age=3600')
  headers.set('ETag', object.httpEtag)

  return new Response(request.method === 'HEAD' ? null : object.body, { headers })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/downloads/')) {
      return download(request, env)
    }
    return env.ASSETS.fetch(request)
  }
}
