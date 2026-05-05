const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')

const root = __dirname
const PORT = Number(process.env.PORT) || 8000

function loadEnvFile () {
  const envPath = path.join(root, '.env')
  if (!fs.existsSync(envPath)) {
    return
  }
  const text = fs.readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const eq = trimmed.indexOf('=')
    if (eq === -1) {
      continue
    }
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    const existing = process.env[key]
    if (existing === undefined || existing === '') {
      process.env[key] = val
    }
  }
}

loadEnvFile()

const subscribeHandler = require('./api/subscribe.js')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml'
}

function sendFile (res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const type = MIME[ext] || 'application/octet-stream'
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = err.code === 'ENOENT' ? 404 : 500
      res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error')
      return
    }
    res.setHeader('Content-Type', type)
    res.end(data)
  })
}

function parseJsonBody (req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function createMockRes (nodeRes) {
  const mock = {
    setHeader: (k, v) => nodeRes.setHeader(k, v),
    status (code) {
      mock._status = code
      return mock
    },
    json (body) {
      nodeRes.statusCode = mock._status
      if (!nodeRes.getHeader('Content-Type')) {
        nodeRes.setHeader('Content-Type', 'application/json')
      }
      nodeRes.end(JSON.stringify(body))
    }
  }
  mock._status = 200
  return mock
}

function resolveStaticPath (pathname) {
  if (pathname === '/' || pathname === '') {
    return path.join(root, 'index.html')
  }
  if (pathname === '/guide' || pathname === '/guide/') {
    return path.join(root, 'guide.html')
  }
  const rel = pathname.replace(/^\//, '')
  if (!rel || rel.includes('..')) {
    return null
  }
  const filePath = path.resolve(root, rel)
  const rootResolved = path.resolve(root)
  if (!filePath.startsWith(rootResolved + path.sep) && filePath !== rootResolved) {
    return null
  }
  return filePath
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`
  const url = new URL(req.url || '/', `http://${host}`)

  if (url.pathname === '/api/subscribe') {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }
    try {
      const body = await parseJsonBody(req)
      const mockReq = { method: 'POST', body }
      const mockRes = createMockRes(res)
      await subscribeHandler(mockReq, mockRes)
    } catch (_) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Invalid JSON body.' }))
    }
    return
  }

  const filePath = resolveStaticPath(url.pathname)
  if (!filePath) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.statusCode = 404
      res.end('Not Found')
      return
    }
    sendFile(res, filePath)
  })
})

server.listen(PORT, () => {
  console.log(`Landing dev: http://localhost:${PORT}/ (static + POST /api/subscribe)`)
})
