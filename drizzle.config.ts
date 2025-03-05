import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL 또는 API 키가 설정되지 않았습니다.')
  process.exit(1)
}

// Supabase URL에서 호스트 추출
const hostMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
if (!hostMatch) {
  console.error('Supabase URL 형식이 올바르지 않습니다.')
  process.exit(1)
}

const host = `${hostMatch[1]}.supabase.co`

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    // 환경 변수를 사용하여 연결 문자열 구성
    connectionString: `postgresql://postgres:${supabaseKey}@${host}:5432/postgres`,
  },
} as Config 