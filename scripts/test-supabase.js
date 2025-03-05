// CommonJS 방식으로 변경
const { createClient } = require('@supabase/supabase-js');

// Supabase 연결 정보
const supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.aM8fuEGJvni4RqFqWO1i9v9yhc2FdWDdIz5wJzKEDDE';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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