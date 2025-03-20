const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 연결 정보
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.aM8fuEGJvni4RqFqWO1i9v9yhc2FdWDdIz5wJzKEDDE';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSolopreneursApi() {
  try {
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key 설정됨:', supabaseKey ? '예' : '아니오');
    
    // 솔로프리너 데이터 가져오기
    console.log('\n솔로프리너 데이터 가져오기 시도...');
    const { data: solopreneurs, error } = await supabase
      .from('solopreneurs')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('솔로프리너 데이터 가져오기 오류:', error.message);
      return;
    }
    
    console.log(`${solopreneurs.length}명의 솔로프리너 데이터 가져오기 성공!`);
    
    // API 엔드포인트 테스트
    console.log('\n/api/solopreneurs 엔드포인트 테스트...');
    
    try {
      const response = await fetch(`http://localhost:3000/api/solopreneurs`);
      const apiData = await response.json();
      
      if (!response.ok) {
        console.error('API 요청 오류:', response.status, apiData);
        return;
      }
      
      console.log('API 응답 성공:', {
        solopreneurs: apiData.solopreneurs ? apiData.solopreneurs.length : 0,
        sample: apiData.solopreneurs ? apiData.solopreneurs[0] : null
      });
      
      // 키워드 데이터 확인
      if (apiData.solopreneurs && apiData.solopreneurs.length > 0) {
        const hasKeywords = apiData.solopreneurs.some(s => s.keywords && s.keywords.length > 0);
        
        console.log('키워드 데이터 포함 여부:', hasKeywords ? '있음' : '없음');
        
        if (hasKeywords) {
          console.log('키워드 샘플:');
          apiData.solopreneurs.slice(0, 3).forEach(s => {
            console.log(`- ${s.name}: ${(s.keywords || []).join(', ')}`);
          });
        }
      }
    } catch (apiError) {
      console.error('API 요청 실패:', apiError.message);
      console.log('참고: 이 스크립트는 로컬 개발 서버가 실행 중일 때만 API 엔드포인트를 테스트할 수 있습니다.');
      console.log('먼저 "npm run dev" 명령으로 개발 서버를 실행하세요.');
    }
  } catch (e) {
    console.error('예외 발생:', e.message);
  }
}

testSolopreneursApi().catch(console.error); 