import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const certificateSettingsPlugin = () => ({
  name: 'certificate-settings-writer',
  configureServer(server) {
    server.middlewares.use('/__save-certificate-settings', (request, response, next) => {
      if (request.method !== 'POST') {
        next()
        return
      }

      const schoolId = new URL(request.url || '/', 'http://localhost').searchParams.get('schoolId')
      if (!schoolId || !/^[a-zA-Z0-9_-]{1,80}$/.test(schoolId)) {
        response.statusCode = 400
        response.end(JSON.stringify({ message: 'A valid schoolId is required.' }))
        return
      }

      let body = ''
      request.on('data', (chunk: Buffer) => {
        body += chunk.toString()
        if (body.length > 1024 * 1024) {
          response.statusCode = 413
          response.end(JSON.stringify({ message: 'Settings payload is too large.' }))
          request.destroy()
        }
      })

      request.on('end', async () => {
        try {
          const settings = JSON.parse(body)
          if (!Array.isArray(settings.subjects) || !Array.isArray(settings.points)
            || !settings.subjects.every((value: unknown) => typeof value === 'string')
            || !settings.points.every((value: unknown) => typeof value === 'string')) {
            throw new Error('Invalid certificate settings.')
          }

          const filePath = resolve(process.cwd(), 'public', `certi-settings-school-${schoolId}.json`)
          await mkdir(resolve(process.cwd(), 'public'), { recursive: true })
          await writeFile(filePath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8')
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ saved: true, fileName: `certi-settings-school-${schoolId}.json` }))
        } catch (error) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ message: error instanceof Error ? error.message : 'Could not save settings.' }))
        }
      })
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), certificateSettingsPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  }
})
