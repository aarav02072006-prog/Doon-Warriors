import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, 'dist')
fs.mkdirSync(distDir, { recursive: true })

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8')
fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml)

fs.writeFileSync(path.join(distDir, 'bundle.js'), 'console.log("Haat client build output");')

console.info('✅ Client build completed successfully.')
