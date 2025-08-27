/* Simple static file server for Heroku */
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import compression from 'compression'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Enable gzip compression
app.use(compression())

// Enable CORS for all routes
app.use(cors())

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

// Serve static files from dist with caching
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false
}))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  })
})

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err)
      res.status(500).send('Internal Server Error')
    }
  })
})

app.listen(port, () => {
  console.log(`🚀 Bible Q&A Frontend server listening on port ${port}`)
  console.log(`📁 Serving static files from: ${distPath}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`)
  console.log(`🔗 API URL: ${process.env.VITE_API_URL || 'https://your-bible-qa-api-81c2e54b07f7.herokuapp.com'}`)
})
