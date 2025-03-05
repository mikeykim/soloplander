import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 관리자 경로 패턴
const ADMIN_ROUTE_PATTERN = /^\/admin(\/.*)?$/

// 로그인 페이지 경로
const LOGIN_PATH = '/admin/login'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 관리자 로그인 페이지는 항상 접근 가능
  if (pathname === LOGIN_PATH) {
    return NextResponse.next()
  }
  
  // 관리자 페이지 접근 제한
  if (ADMIN_ROUTE_PATTERN.test(pathname)) {
    // 세션 쿠키 확인
    const isAuthenticated = request.cookies.has('admin_authenticated')
    
    // 인증되지 않은 경우 로그인 페이지로 리디렉션
    if (!isAuthenticated) {
      const loginUrl = new URL(LOGIN_PATH, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // 콘텐츠 보안 정책 설정
  const response = NextResponse.next()
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )
  
  return response
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
} 