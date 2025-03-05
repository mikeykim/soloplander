import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // 쿠키 스토어 접근
    const cookieStore = cookies()
    
    // 인증 쿠키 삭제
    cookieStore.delete('admin_authenticated')
    
    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.'
    })
  } catch (error) {
    console.error('관리자 로그아웃 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 