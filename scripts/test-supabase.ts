import { supabase } from '../utils/supabase';

async function testSupabaseConnection() {
  try {
    console.log('Supabase 연결 테스트 시작...');
    
    // 간단한 쿼리 실행
    const { data, error } = await supabase.from('solopreneurs').select('*').limit(1);
    
    if (error) {
      console.error('Supabase 연결 오류:', error.message);
      return;
    }
    
    console.log('Supabase 연결 성공!');
    console.log('데이터:', data);
  } catch (error) {
    console.error('예외 발생:', error);
  }
}

// 테스트 실행
testSupabaseConnection()
  .catch(console.error)
  .finally(() => process.exit()); 