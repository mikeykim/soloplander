const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 연결 정보
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.DqZC-2vTWUQImZTGYYgB2O3HEnVazjNi6NE5E0yrU9o';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

async function createKeywordsTable() {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key 설정됨:', supabaseKey ? '예' : '아니오');
  
  try {
    console.log('\nsolopreneur_keywords 테이블 생성 시도...');
    
    // SQL 쿼리로 테이블 생성
    const { data, error } = await supabase.rpc('create_keywords_table');
    
    if (error) {
      console.error('RPC 호출 오류:', error.message);
      console.log('\nSQL 쿼리를 직접 실행하여 테이블 생성 시도...');
      
      // SQL 쿼리 직접 실행
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.solopreneur_keywords (
          id SERIAL PRIMARY KEY,
          solopreneur_id INTEGER NOT NULL REFERENCES public.solopreneurs(id) ON DELETE CASCADE,
          keyword VARCHAR(100) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
        );
      `;
      
      const { data: sqlData, error: sqlError } = await supabase.rpc('exec_sql', { sql_query: createTableQuery });
      
      if (sqlError) {
        console.error('SQL 직접 실행 오류:', sqlError.message);
        console.log('\n참고: SQL 실행 및 테이블 생성은 관리자 권한이 필요할 수 있습니다.');
        console.log('Supabase Studio에서 직접 테이블을 생성해야 할 수 있습니다.');
        console.log('실행할 SQL 쿼리:');
        console.log(createTableQuery);
      } else {
        console.log('SQL 쿼리 실행 성공:', sqlData);
        console.log('solopreneur_keywords 테이블이 성공적으로 생성되었습니다!');
      }
    } else {
      console.log('테이블 생성 성공:', data);
      console.log('solopreneur_keywords 테이블이 성공적으로 생성되었습니다!');
    }
    
    // 테이블이 생성됐는지 확인
    const { data: checkData, error: checkError } = await supabase
      .from('solopreneur_keywords')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('테이블 확인 오류:', checkError.message);
    } else {
      console.log('solopreneur_keywords 테이블이 존재합니다. 데이터:', checkData);
    }
  } catch (e) {
    console.error('예외 발생:', e.message);
  }
}

createKeywordsTable().catch(console.error); 