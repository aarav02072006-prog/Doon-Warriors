import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2))
  process.exit(1)
}

export const env = result.data
