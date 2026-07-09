import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { readAutopilotStatus } from './src/data/autopilotStatus'
import { buildBusinessCommandResponse } from './src/server/commandRouteApi'
import { getProjectedSection } from './src/server/personalProjectionApi'

const dashboardRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  server: {
    fs: {
      allow: [dashboardRoot, '/Users/shika/.openclaw/workspace/PunkRecords'],
    },
  },
  plugins: [
    react(),
    {
      name: 'punkrecords-projection-api',
      configureServer(server) {
        const personalRoutes = ['vessel', 'identity', 'systems', 'ventures', 'career', 'knowledge', 'wealth', 'education', 'relationships'] as const
        for (const key of personalRoutes) {
          server.middlewares.use(`/api/personal/${key}`, (_req, res) => {
            const section = getProjectedSection(key)
            if (!section) {
              res.statusCode = 404
              res.end('Not found')
              return
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(section))
          })
        }
        server.middlewares.use('/api/autopilot/status', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readAutopilotStatus()))
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
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(buildBusinessCommandResponse(payload)))
          })
        })
      },
    },
  ],
})
