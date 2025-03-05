const { createClient } = require('@supabase/supabase-js');

// Supabase 연결 정보
const supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.aM8fuEGJvni4RqFqWO1i9v9yhc2FdWDdIz5wJzKEDDE';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL 쿼리 정의
const createSolopreneursTable = `
CREATE TABLE IF NOT EXISTS solopreneurs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(50) NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  gender VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
`;

const createSolopreneurLinksTable = `
CREATE TABLE IF NOT EXISTS solopreneur_links (
  id SERIAL PRIMARY KEY,
  solopreneur_id INTEGER REFERENCES solopreneurs(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
`;

const createSolopreneurPreviewsTable = `
CREATE TABLE IF NOT EXISTS solopreneur_previews (
  id SERIAL PRIMARY KEY,
  solopreneur_id INTEGER REFERENCES solopreneurs(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
`;

async function createTables() {
  try {
    console.log('테이블 생성 시작...');
    
    // 1. solopreneurs 테이블 생성
    const { data: solopreneursData, error: solopreneursError } = await supabase
      .from('solopreneurs')
      .select('id')
      .limit(1);
    
    if (solopreneursError) {
      console.log('solopreneurs 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // SQL 쿼리 실행
      const { error } = await supabase.rpc('exec_sql', { sql: createSolopreneursTable });
      
      if (error) {
        console.error('solopreneurs 테이블 생성 오류:', error.message);
        console.log('다음 SQL 쿼리를 Supabase 대시보드에서 실행하세요:');
        console.log(createSolopreneursTable);
      } else {
        console.log('solopreneurs 테이블이 성공적으로 생성되었습니다.');
      }
    } else {
      console.log('solopreneurs 테이블이 이미 존재합니다.');
    }
    
    // 2. solopreneur_links 테이블 생성
    const { data: linksData, error: linksError } = await supabase
      .from('solopreneur_links')
      .select('id')
      .limit(1);
    
    if (linksError && linksError.message.includes('does not exist')) {
      console.log('solopreneur_links 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // SQL 쿼리 실행
      const { error } = await supabase.rpc('exec_sql', { sql: createSolopreneurLinksTable });
      
      if (error) {
        console.error('solopreneur_links 테이블 생성 오류:', error.message);
        console.log('다음 SQL 쿼리를 Supabase 대시보드에서 실행하세요:');
        console.log(createSolopreneurLinksTable);
      } else {
        console.log('solopreneur_links 테이블이 성공적으로 생성되었습니다.');
      }
    } else if (!linksError) {
      console.log('solopreneur_links 테이블이 이미 존재합니다.');
    }
    
    // 3. solopreneur_previews 테이블 생성
    const { data: previewsData, error: previewsError } = await supabase
      .from('solopreneur_previews')
      .select('id')
      .limit(1);
    
    if (previewsError && previewsError.message.includes('does not exist')) {
      console.log('solopreneur_previews 테이블이 존재하지 않습니다. 테이블을 생성합니다...');
      
      // SQL 쿼리 실행
      const { error } = await supabase.rpc('exec_sql', { sql: createSolopreneurPreviewsTable });
      
      if (error) {
        console.error('solopreneur_previews 테이블 생성 오류:', error.message);
        console.log('다음 SQL 쿼리를 Supabase 대시보드에서 실행하세요:');
        console.log(createSolopreneurPreviewsTable);
      } else {
        console.log('solopreneur_previews 테이블이 성공적으로 생성되었습니다.');
      }
    } else if (!previewsError) {
      console.log('solopreneur_previews 테이블이 이미 존재합니다.');
    }
    
    console.log('테이블 생성 작업 완료!');
    console.log('\n만약 테이블이 생성되지 않았다면, 다음 SQL 쿼리를 Supabase 대시보드에서 실행하세요:');
    console.log('\n--- solopreneurs 테이블 ---');
    console.log(createSolopreneursTable);
    console.log('\n--- solopreneur_links 테이블 ---');
    console.log(createSolopreneurLinksTable);
    console.log('\n--- solopreneur_previews 테이블 ---');
    console.log(createSolopreneurPreviewsTable);
  } catch (error) {
    console.error('예외 발생:', error);
  }
}

// 테이블 생성 실행
createTables()
  .catch(console.error)
  .finally(() => process.exit()); 