// 서비스 롤 키를 사용하여 키워드를 직접 업데이트하는 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 환경 변수
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// 환경 변수가 로드되지 않으면 하드코딩된 값 사용
if (!supabaseUrl) {
  console.log('환경 변수를 찾을 수 없어 하드코딩된 값을 사용합니다.');
  supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
  supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA2ODI2MywiZXhwIjoyMDU2NjQ0MjYzfQ.JmRGeFKNvXrNs0VwbHzqTDdcJoLzU-6qsRXnDx_JbsY';
}

// 서비스 롤로 Supabase 클라이언트 생성
console.log('수파베이스 URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 솔로프리너 키워드 업데이트 함수
 * @param {number} solopreneruId - 솔로프리너 ID
 * @param {string[]} keywords - 새 키워드 목록
 */
async function updateKeywords(solopreneruId, keywords) {
  console.log(`[관리자] ID ${solopreneruId}의 키워드를 업데이트합니다...`);
  console.log(`새 키워드: ${keywords.join(', ')}`);
  
  try {
    // 1. 기존 키워드 삭제
    console.log('기존 키워드 삭제 중...');
    const { error: deleteError } = await supabase
      .from('solopreneur_keywords')
      .delete()
      .eq('solopreneur_id', solopreneruId);
    
    if (deleteError) {
      console.error('키워드 삭제 오류:', deleteError);
      return { success: false, error: deleteError };
    }
    
    console.log('기존 키워드 삭제 완료');
    
    // 키워드가 없는 경우 여기서 종료
    if (!keywords || keywords.length === 0) {
      console.log('새 키워드가 없습니다. 업데이트 완료.');
      return { success: true, keywords: [] };
    }
    
    // 유효한 키워드만 필터링
    const validKeywords = keywords
      .map(k => typeof k === 'string' ? k.trim() : String(k).trim())
      .filter(k => k.length > 0);
    
    // 중복 제거
    const uniqueKeywords = [...new Set(validKeywords)];
    
    // 2. 새 키워드 추가
    console.log(`${uniqueKeywords.length}개의 새 키워드 추가 중...`);
    
    const keywordInserts = uniqueKeywords.map(keyword => ({
      solopreneur_id: solopreneruId,
      keyword
    }));
    
    const { data, error: insertError } = await supabase
      .from('solopreneur_keywords')
      .insert(keywordInserts)
      .select();
    
    if (insertError) {
      console.error('키워드 추가 오류:', insertError);
      return { success: false, error: insertError };
    }
    
    console.log('키워드 추가 완료');
    console.log('업데이트된 키워드:', data.map(item => item.keyword));
    
    return { success: true, keywords: data.map(item => item.keyword) };
    
  } catch (error) {
    console.error('업데이트 중 오류 발생:', error);
    return { success: false, error };
  }
}

// 명령줄 인자로 테스트
const args = process.argv.slice(2);
const testMode = args.includes('--test');

if (testMode) {
  // 테스트 모드로 실행
  const testId = 1; // 테스트용 솔로프리너 ID
  const testKeywords = ['test', 'admin', 'service', 'role', `timestamp-${Date.now()}`];
  
  console.log('==== 테스트 모드로 실행 중 ====');
  updateKeywords(testId, testKeywords)
    .then(result => {
      console.log('테스트 결과:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('테스트 실패:', error);
      process.exit(1);
    });
} else {
  // 모듈로 사용
  module.exports = { updateKeywords };
  console.log('키워드 업데이트 모듈이 로드되었습니다.');
  console.log('사용법: node admin-update-keywords.js --test');
} 