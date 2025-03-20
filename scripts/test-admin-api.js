// 관리자 API를 테스트하는 스크립트
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// 환경 변수
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const API_BASE_URL = 'http://localhost:3000';

// 테스트할 솔로프리너 ID와 키워드
const solopreneurId = 1; // 테스트할 ID
const testKeywords = ['admin-test', 'api-test', 'service-role', `timestamp-${Date.now()}`];

// 관리자 API로 키워드 업데이트 테스트
async function testAdminKeywordsApi() {
  console.log('관리자 API 키워드 업데이트 테스트 시작...');
  console.log(`테스트 키워드: ${testKeywords.join(', ')}`);
  
  try {
    // API 엔드포인트 호출
    const response = await fetch(`${API_BASE_URL}/api/admin/keywords/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_PASSWORD}`
      },
      body: JSON.stringify({
        solopreneur_id: solopreneurId,
        keywords: testKeywords
      })
    });
    
    // 응답 처리
    const data = await response.json();
    
    if (response.ok) {
      console.log('API 호출 성공!');
      console.log('응답 데이터:', data);
      
      // 업데이트된 키워드와 테스트 키워드 비교
      const updatedKeywords = data.keywords || [];
      const allKeywordsPresent = testKeywords.every(k => 
        updatedKeywords.includes(k)
      );
      
      if (allKeywordsPresent) {
        console.log('✅ 모든 키워드가 성공적으로 업데이트되었습니다!');
      } else {
        console.log('⚠️ 일부 키워드만 업데이트되었습니다.');
        console.log('누락된 키워드:', testKeywords.filter(k => !updatedKeywords.includes(k)));
      }
      
    } else {
      console.error('API 호출 실패:', data);
      console.error('상태 코드:', response.status);
    }
    
  } catch (error) {
    console.error('API 테스트 중 오류 발생:', error.message);
  }
}

// API 테스트 실행
console.log('✨ 서버가 실행 중인지 확인하세요 (npm run dev)');
testAdminKeywordsApi(); 