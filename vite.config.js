import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const AUTH_SECRET = process.env.DASHBOARD_AUTH_SECRET || crypto.randomBytes(32).toString('hex')

function toBase64Url(value) {
  return Buffer.from(value).toString('base64url')
}

function createToken(payload) {
  const body = toBase64Url(JSON.stringify(payload))
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  return `${body}.${signature}`
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null
  const [body, signature] = token.split('.')

  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (payload.exp && Date.now() > payload.exp) return null
  return payload
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(data))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

async function readJsonFile(relativePath) {
  const filePath = path.resolve(process.cwd(), relativePath)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

function dashboardApiPlugin() {
  return {
    name: 'dashboard-api-plugin',
    configureServer(server) {
      const getAuthorizedUser = (req, res) => {
        const authHeader = req.headers.authorization || ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
        const auth = verifyToken(token)

        if (!auth) {
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return null
        }

        return auth
      }

      const restrictByRole = (rows, auth) => {
        if (auth.role !== 'manager') return rows
        return rows.filter((item) => item.department === auth.department)
      }

      server.middlewares.use('/api/auth/login', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const { email = '', password = '' } = await readBody(req)
          const usersDb = await readJsonFile('dummy-db/users.json')
          const user = usersDb.users?.find(
            (entry) => entry.email.toLowerCase() === String(email).trim().toLowerCase(),
          )

          if (!user) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid email or password' }))
            return
          }

          const passwordHash = crypto
            .createHash('sha256')
            .update(String(password))
            .digest('hex')

          if (passwordHash !== user.passwordHash) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid email or password' }))
            return
          }

          const token = createToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            department: user.department || null,
            exp: Date.now() + 1000 * 60 * 60 * 8,
          })

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department || null,
              },
            }),
          )
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Bad Request' }))
        }
      })

      server.middlewares.use('/api/auth/me', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        const authHeader = req.headers.authorization || ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
        const payload = verifyToken(token)

        if (!payload) {
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Unauthorized' }))
          return
        }

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            user: {
              id: payload.sub,
              name: payload.name,
              email: payload.email,
              role: payload.role,
              department: payload.department,
            },
          }),
        )
      })

      server.middlewares.use('/api/dashboard', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const auth = getAuthorizedUser(req, res)
          if (!auth) return

          const payload = await readJsonFile('dummy-db/dashboard.json')
          const departments =
            auth.role === 'manager'
              ? (payload.departments ?? []).filter((item) => item.name === auth.department)
              : payload.departments ?? []

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              departments,
              meta: {
                source: 'dummy-db',
                generatedAt: new Date().toISOString(),
                role: auth.role,
              },
            }),
          )
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Failed to read dummy database file',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })

      server.middlewares.use('/api/employees', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const auth = getAuthorizedUser(req, res)
          if (!auth) return

          const payload = await readJsonFile('dummy-db/employees.json')
          const employees = restrictByRole(payload.employees ?? [], auth)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ employees }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Failed to read employee data',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })

      server.middlewares.use('/api/payroll', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const auth = getAuthorizedUser(req, res)
          if (!auth) return

          const payload = await readJsonFile('dummy-db/payroll.json')
          const payroll = restrictByRole(payload.payroll ?? [], auth)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ payroll }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Failed to read payroll data',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })

      server.middlewares.use('/api/attendance', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const auth = getAuthorizedUser(req, res)
          if (!auth) return

          const payload = await readJsonFile('dummy-db/attendance.json')
          const attendance = restrictByRole(payload.attendance ?? [], auth)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ attendance }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Failed to read attendance data',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })

      server.middlewares.use('/api/compliance', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const auth = getAuthorizedUser(req, res)
          if (!auth) return

          const payload = await readJsonFile('dummy-db/compliance.json')
          const compliance = restrictByRole(payload.compliance ?? [], auth)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ compliance }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Failed to read compliance data',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })

      server.middlewares.use('/api/reports', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const auth = getAuthorizedUser(req, res)
          if (!auth) return

          const payload = await readJsonFile('dummy-db/reports.json')
          const reports = payload.reports ?? []

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ reports }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Failed to read reports data',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })

      server.middlewares.use('/api/approvals', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const auth = getAuthorizedUser(req, res)
          if (!auth) return

          const payload = await readJsonFile('dummy-db/approvals.json')
          const approvals = restrictByRole(payload.approvals ?? [], auth)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ approvals }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'Failed to read approvals data',
              details: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dashboardApiPlugin()],
})
