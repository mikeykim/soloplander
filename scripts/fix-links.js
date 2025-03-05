const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 연결 정보
const supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.aM8fuEGJvni4RqFqWO1i9v9yhc2FdWDdIz5wJzKEDDE';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 솔로프리너 데이터 파일 경로
const solopreneursDataPath = path.join(__dirname, '../data/solopreneurs.ts');

// 테이블 생성 SQL 쿼리
const createLinksTableSQL = `
CREATE TABLE IF NOT EXISTS solopreneur_links (
  id SERIAL PRIMARY KEY,
  solopreneur_id INTEGER REFERENCES solopreneurs(id) ON DELETE CASCADE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
`;

async function createLinksTable() {
  try {
    console.log('solopreneur_links 테이블 생성 시도 중...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: createLinksTableSQL });
    
    if (error) {
      console.error('테이블 생성 오류:', error.message);
      console.log('Supabase 대시보드에서 다음 SQL을 실행해주세요:');
      console.log(createLinksTableSQL);
      return false;
    }
    
    console.log('solopreneur_links 테이블 생성 완료!');
    return true;
  } catch (error) {
    console.error('테이블 생성 중 예외 발생:', error);
    console.log('Supabase 대시보드에서 다음 SQL을 실행해주세요:');
    console.log(createLinksTableSQL);
    return false;
  }
}

async function checkTableExists() {
  try {
    // 테이블이 존재하는지 확인
    const { data, error } = await supabase
      .from('solopreneur_links')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') { // 테이블이 존재하지 않는 경우
      console.log('solopreneur_links 테이블이 존재하지 않습니다.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('테이블 확인 중 오류 발생:', error);
    return false;
  }
}

async function fixLinks() {
  try {
    console.log('솔로프리너 링크 수정 시작...');

    // 테이블 존재 여부 확인 및 생성
    const tableExists = await checkTableExists();
    if (!tableExists) {
      const tableCreated = await createLinksTable();
      if (!tableCreated) {
        console.log('테이블 생성에 실패했습니다. 프로세스를 종료합니다.');
        return;
      }
    }

    // 데이터 파일 읽기
    const fileContent = fs.readFileSync(solopreneursDataPath, 'utf8');
    
    // TypeScript 파일에서 데이터 추출 (간단한 방법)
    const dataStartIndex = fileContent.indexOf('[');
    const dataEndIndex = fileContent.lastIndexOf(']');
    const dataString = fileContent.substring(dataStartIndex, dataEndIndex + 1);
    
    // 데이터 문자열을 JavaScript 객체로 변환
    const solopreneursData = eval(dataString);

    // 모든 솔로프리너 조회
    const { data: solopreneurs, error: fetchError } = await supabase
      .from('solopreneurs')
      .select('*');
    
    if (fetchError) {
      console.error('솔로프리너 조회 오류:', fetchError.message);
      return;
    }

    // 각 솔로프리너에 대해 링크 수정
    for (const solopreneur of solopreneurs) {
      console.log(`${solopreneur.name} 링크 수정 중...`);
      
      // 원본 데이터에서 해당 솔로프리너 찾기
      const originalData = solopreneursData.find(s => s.name === solopreneur.name);
      
      if (!originalData) {
        console.log(`${solopreneur.name}에 대한 원본 데이터를 찾을 수 없습니다.`);
        continue;
      }
      
      // 링크 데이터 추출
      const links = originalData.links || {};
      const linkEntries = Object.entries(links).filter(([key, value]) => 
        typeof value === 'string' && key !== 'previews'
      );
      
      // 기존 링크 삭제
      const { error: deleteError } = await supabase
        .from('solopreneur_links')
        .delete()
        .eq('solopreneur_id', solopreneur.id);
      
      if (deleteError) {
        console.error(`${solopreneur.name}의 기존 링크 삭제 오류:`, deleteError.message);
      }
      
      // 새 링크 추가
      for (const [platform, url] of linkEntries) {
        if (!url) {
          console.log(`${solopreneur.name}의 ${platform} 링크가 비어있습니다. 건너뜁니다.`);
          continue;
        }
        
        const { error: linkError } = await supabase
          .from('solopreneur_links')
          .insert({
            solopreneur_id: solopreneur.id,
            platform,
            url,
          });
        
        if (linkError) {
          console.error(`${solopreneur.name}의 ${platform} 링크 삽입 오류:`, linkError.message);
        } else {
          console.log(`${solopreneur.name}의 ${platform} 링크 삽입 완료`);
        }
      }
    }

    console.log('솔로프리너 링크 수정 완료!');
  } catch (error) {
    console.error('예외 발생:', error);
  }
}

// 링크 수정 실행
fixLinks()
  .catch(console.error)
  .finally(() => process.exit()); 