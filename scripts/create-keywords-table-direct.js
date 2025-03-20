const fetch = require('node-fetch');
require('dotenv').config();

// Supabase 연결 정보 - 서비스 역할 키 사용 필요
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA2ODI2MywiZXhwIjoyMDU2NjQ0MjYzfQ.gBPZYa-XNEzDJtUppvmqoY0E9fT1WRjNHS5tWz-J_oM';

async function createKeywordsTableDirect() {
  console.log('Supabase URL:', supabaseUrl);
  console.log('서비스 키 설정됨:', supabaseServiceKey ? '예' : '아니오');
  
  if (!supabaseServiceKey) {
    console.error('테이블을 생성하려면 Supabase 서비스 역할 키가 필요합니다.');
    console.log('환경 변수를 통해 설정하거나 코드에 직접 추가하세요.');
    return;
  }

  try {
    console.log('\nSQL API를 통해 solopreneur_keywords 테이블 생성 시도...');
    
    // SQL 쿼리 작성
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.solopreneur_keywords (
        id SERIAL PRIMARY KEY,
        solopreneur_id INTEGER NOT NULL REFERENCES public.solopreneurs(id) ON DELETE CASCADE,
        keyword VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
      );
    `;
    
    // REST API를 통해 SQL 실행
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        sql_query: createTableQuery
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('SQL 실행 중 오류 발생:', response.status, result);
      
      if (response.status === 404) {
        console.log('\n참고: "exec_sql" 함수가 없을 수 있습니다.');
        console.log('이 경우 Supabase Studio에서 직접 다음 SQL 쿼리를 실행해야 합니다:');
        console.log(createTableQuery);
      }
      
      return;
    }
    
    console.log('테이블 생성 결과:', result);
    console.log('solopreneur_keywords 테이블이 성공적으로 생성되었습니다!');
    
    // 테이블에 초기 데이터 추가 (WorldMap.tsx의 하드코딩된 데이터 기반)
    await insertInitialKeywords();
    
  } catch (e) {
    console.error('예외 발생:', e.message);
  }
}

async function insertInitialKeywords() {
  console.log('\n초기 키워드 데이터 추가...');
  
  // WorldMap.tsx에서 하드코딩된 키워드 데이터
  const keywordData = {
    "Alex Hormozi": ["business", "marketing", "content"],
    "Pat Walls": ["business", "content"],
    "Pieter Levels": ["tech", "development", "business"],
    "Marc Lou": ["tech", "development", "business"],
    "Ruri Ohama": ["content", "business"],
    "Ara Koh": ["design", "content", "business"],
    "Kei Fujikawa": ["tech", "development"],
    "Richard Lim": ["data", "ai", "education"],
    "Wes Mcdowell": ["marketing", "business"],
    "Charlie Chang": ["finance", "content"],
    "Noah Kagan": ["business", "marketing", "tech"],
    "Ben AI": ["ai", "tech", "content"],
    "Greg Isenberg": ["business", "marketing"],
    "Phoebe Yu": ["business", "content"],
    "Stefanovic": ["content", "education"],
    "Timo Nikolai": ["ai", "marketing", "tech"],
    "David Ondrej": ["ai", "tech", "development"]
  };
  
  try {
    // 솔로프리너 목록 가져오기
    const response = await fetch(`${supabaseUrl}/rest/v1/solopreneurs?select=id,name`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    
    const solopreneurs = await response.json();
    
    if (!response.ok) {
      console.error('솔로프리너 조회 중 오류 발생:', response.status, solopreneurs);
      return;
    }
    
    console.log(`${solopreneurs.length}명의 솔로프리너를 불러왔습니다.`);
    
    // 각 솔로프리너에 대해 키워드 삽입
    for (const solopreneur of solopreneurs) {
      const keywords = keywordData[solopreneur.name] || [];
      
      if (keywords.length === 0) {
        console.log(`${solopreneur.name}에 대한 키워드가 없습니다. 건너뜁니다.`);
        continue;
      }
      
      console.log(`${solopreneur.name}에 대한 키워드 추가 중: ${keywords.join(', ')}`);
      
      // 각 키워드에 대해 데이터 삽입
      for (const keyword of keywords) {
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/solopreneur_keywords`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            solopreneur_id: solopreneur.id,
            keyword: keyword
          })
        });
        
        if (!insertResponse.ok) {
          const error = await insertResponse.json();
          console.error(`${solopreneur.name}의 키워드 "${keyword}" 추가 중 오류:`, error);
        }
      }
    }
    
    console.log('모든 초기 키워드 데이터가 성공적으로 추가되었습니다!');
  } catch (e) {
    console.error('키워드 데이터 추가 중 오류 발생:', e.message);
  }
}

createKeywordsTableDirect().catch(console.error); 