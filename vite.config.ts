import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildIdentityData, buildSystemsData, buildVesselData, buildVenturesData } from './src/data/punkProjection'

export default defineConfig({
  server: {
    fs: {
      allow: ['/Users/shika/.openclaw/workspace/PunkRecords'],
    },
  },
  plugins: [
    react(),
    {
      name: 'punkrecords-projection-api',
      configureServer(server) {
        server.middlewares.use('/api/personal/vessel', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(buildVesselData()))
        })
        server.middlewares.use('/api/personal/identity', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(buildIdentityData()))
        })
        server.middlewares.use('/api/personal/systems', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(buildSystemsData()))
        })
        server.middlewares.use('/api/personal/ventures', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(buildVenturesData()))
        })
        server.middlewares.use('/api/command/route', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method not allowed')
            return
          }

          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            const payload = JSON.parse(body || '{}')
            const route = payload.route || {}
            const summary = payload.summary || {}
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              ok: true,
              route: route.route || 'unknown',
              intent: route.intent || 'general_command',
              message: `Routed to ${route.route || 'unknown'} with ${summary.approvalsPending ?? 0} pending approvals and ${summary.publishedToday ?? 0} publications today.`,
              nextAction: route.nextAction || 'Hand off to the assistant/runtime backend.',
            }))
          })
        })
      },
    },
  ],
})
