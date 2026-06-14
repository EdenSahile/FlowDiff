/**
 * Serveur local pour tester les routes /api/ sans vercel dev.
 * Usage : npm run dev:api
 * Le --watch de tsx détecte les changements dans ce fichier ET api/aidenia.ts
 * car le handler est importé statiquement (pas dynamiquement).
 */
import http from 'http'
import { URL } from 'url'
import handler from '../api/aidenia.js'

const PORT = 4000

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (url.pathname === '/api/aidenia' && req.method === 'POST') {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', async () => {
      try {
        const mockReq = {
          method: req.method,
          headers: req.headers,
          body: JSON.parse(body || '{}'),
        }
        const mockRes = {
          _status: 200,
          status(code: number) { this._status = code; return this },
          json(data: unknown) {
            res.writeHead(this._status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data))
          },
        }

        await handler(mockReq as never, mockRes as never)
      } catch (err) {
        console.error('[local-api]', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Erreur serveur local' }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`✅ API locale sur http://localhost:${PORT}`)
  console.log('   /api/aidenia — prêt')
})
