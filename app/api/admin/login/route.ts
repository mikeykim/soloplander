import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 환경 변수에서 관리자 비밀번호를 가져오거나 기본값 사용
// 실제 환경에서는 .env 파일에 ADMIN_PASSWORD를 설정하세요
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body
    
    // 비밀번호 검증
    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }
    
    // 비밀번호 일치 여부 확인
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }
    
    // 인증 성공 시 쿠키 설정
    const cookieStore = cookies()
    
    // 쿠키 만료 시간 설정 (24시간)
    const expiresIn = 24 * 60 * 60 * 1000
    const expires = new Date(Date.now() + expiresIn)
    
    // 인증 쿠키 설정
    cookieStore.set('admin_authenticated', 'true', {
      expires,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    
    return NextResponse.json({
      success: true,
      message: '로그인에 성공했습니다.'
    })
  } catch (error) {
    console.error('관리자 로그인 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 