import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 개발 환경에서 환경 변수 확인 로그
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key:', supabaseKey ? 'Set (not showing for security)' : 'Not set');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    // count() 대신 단순 select 쿼리 사용
    const { data, error } = await supabase
      .from('solopreneurs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase 연결 테스트 실패:', error);
      return { success: false, error };
    }
    
    console.log('Supabase 연결 테스트 성공:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase 연결 테스트 중 예외 발생:', error);
    return { success: false, error };
  }
};

// 이미지 URL 생성 함수
export const getImageUrl = (bucket: string, path: string) => {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}; 