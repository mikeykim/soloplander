import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/utils/supabase';

export async function GET() {
  console.log('GET /api/test-supabase 요청 받음');
  
  try {
    // Supabase 연결 테스트
    const connectionTest = await testSupabaseConnection();
    
    // 환경 변수 로깅
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '설정되지 않음',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨 (보안상 표시하지 않음)' : '설정되지 않음',
    };
    
    return NextResponse.json({
      success: connectionTest.success,
      message: connectionTest.success ? 'Supabase 연결 성공' : 'Supabase 연결 실패',
      error: connectionTest.error ? (connectionTest.error as Error).message : null,
      environmentVariables: envVars,
    });
  } catch (error) {
    console.error('Supabase 테스트 중 오류 발생:', error);
    return NextResponse.json({
      success: false,
      message: 'Supabase 테스트 중 오류 발생',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }, { status: 500 });
  }
} 