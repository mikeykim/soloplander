import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// 개발 환경에서 환경 변수 확인 로그
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key:', supabaseKey ? 'Set (not showing for security)' : 'Not set');
  console.log('Supabase Service Key:', supabaseServiceKey ? 'Set (not showing for security)' : 'Not set');
}

// 환경 변수 설정 여부 확인
const isSupabaseConfigured = supabaseUrl && supabaseKey;
const isServiceKeyConfigured = supabaseUrl && supabaseServiceKey;

// 실제 Supabase 클라이언트 생성
const realSupabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// 서비스 롤 키를 사용하는 Supabase 클라이언트 생성 (RLS 우회)
const serviceRoleSupabaseClient = isServiceKeyConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// 더미 Supabase 클라이언트 (환경 변수가 없을 때 사용)
const dummySupabaseClient = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      data: [],
      error: null,
      eq: (column: string, value: any) => ({
        data: [],
        error: null,
        single: () => ({ data: null, error: null }),
        limit: (limit: number) => ({ data: [], error: null }),
        order: (column: string, options: any) => ({
          data: [],
          error: null,
          limit: (limit: number) => ({ data: [], error: null }),
        }),
      }),
      limit: (limit: number) => ({ data: [], error: null }),
      order: (column: string, options: any) => ({
        data: [],
        error: null,
        limit: (limit: number) => ({ data: [], error: null }),
      }),
      single: () => ({ data: null, error: null }),
    }),
    insert: (values: any) => ({
      data: values,
      error: null,
      select: () => ({
        data: values,
        error: null,
        single: () => ({ data: values, error: null }),
      }),
    }),
    update: (values: any) => ({
      data: values,
      error: null,
      eq: (column: string, value: any) => ({ 
        data: values, 
        error: null,
        select: () => ({
          data: {
            id: typeof value === 'string' ? parseInt(value) : value,
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          error: null,
          single: () => ({ 
            data: {
              id: typeof value === 'string' ? parseInt(value) : value,
              ...values,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, 
            error: null 
          }),
        }),
      }),
    }),
    delete: () => ({
      data: null,
      error: null,
      eq: (column: string, value: any) => ({ data: null, error: null }),
    }),
    order: (column: string, options: any) => ({
      data: [],
      error: null,
      limit: (limit: number) => ({ data: [], error: null }),
    }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}` } }),
    }),
    listBuckets: async () => ({ data: [{ name: 'solopreneur-images' }], error: null }),
    createBucket: async (name: string) => ({ data: { name }, error: null }),
  },
};

// Supabase 클라이언트 내보내기
export const supabase = isSupabaseConfigured && realSupabaseClient ? realSupabaseClient : dummySupabaseClient;
export const serviceSupabase = isServiceKeyConfigured && serviceRoleSupabaseClient ? serviceRoleSupabaseClient : dummySupabaseClient;

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  // 환경 변수 로깅
  console.log('Supabase 환경 변수 확인:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '설정되지 않음');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음');
  
  // 환경 변수가 설정되지 않은 경우 즉시 실패 반환
  if (!isSupabaseConfigured) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 임시 데이터를 사용합니다.');
    return { success: false, error: new Error('Supabase 환경 변수가 설정되지 않았습니다.') };
  }

  try {
    console.log('Supabase 연결 테스트 시작...');
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
  if (!isSupabaseConfigured) {
    return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`;
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}; 