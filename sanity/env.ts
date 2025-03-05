/**
 * Sanity 환경 설정
 * 프로젝트 ID, 데이터셋, API 버전 등 Sanity 관련 환경 변수 관리
 */

// 필수 환경 변수 확인 함수
function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage);
  }
  
  return value;
}

// 환경 변수에서 프로젝트 ID 가져오기
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Sanity project ID is not set in environment variables'
);

// 환경 변수에서 데이터셋 가져오기
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  'Sanity dataset is not set in environment variables'
);

// API 버전 설정
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';

// 프로덕션 모드 확인
export const isProduction = process.env.NODE_ENV === 'production';

export const useCdn = false

// Supabase 연결 정보
export const supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.aM8fuEGJvni4RqFqWO1i9v9yhc2FdWDdIz5wJzKEDDE';
export const databaseUrl = 'postgresql://postgres:Alsrjsdl0450!@seuttskwyxmznloukxog.supabase.co:5432/postgres';
