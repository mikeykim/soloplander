import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/utils/supabase';

export async function GET() {
  // 환경 설정 가리기
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Supabase 연결 테스트
  const connectionTest = await testSupabaseConnection();
  
  return NextResponse.json({
    environment: process.env.NODE_ENV || 'unknown',
    supabaseConfigured: supabaseUrl.length > 0 && supabaseKey.length > 0,
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : 'Not set',
    supabaseKey: supabaseKey ? 'Set (hidden for security)' : 'Not set',
    connectionTest: {
      success: connectionTest.success,
      error: connectionTest.error ? `${connectionTest.error}` : null
    },
    timestamp: new Date().toISOString()
  });
} 