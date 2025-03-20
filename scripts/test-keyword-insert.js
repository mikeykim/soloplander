const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 테스트할 솔로프리너 ID
const solopreneurId = 1; // 테스트 할 ID
const testKeywords = ['test', 'keyword', 'update', 'test' + Date.now()];

// 기존 키워드 확인 함수
async function checkKeywords() {
  const { data, error } = await supabase
    .from('solopreneur_keywords')
    .select('*')
    .eq('solopreneur_id', solopreneurId);

  if (error) {
    console.error('키워드 조회 오류:', error.message);
    return [];
  }

  return data.map(row => row.keyword);
}

// 기존 키워드 삭제 함수
async function deleteKeywords() {
  const { error } = await supabase
    .from('solopreneur_keywords')
    .delete()
    .eq('solopreneur_id', solopreneurId);

  if (error) {
    console.error('키워드 삭제 오류:', error.message);
    return false;
  }

  return true;
}

// 새 키워드 추가 함수
async function insertKeywords(keywords) {
  const keywordData = keywords.map(keyword => ({
    solopreneur_id: solopreneurId,
    keyword
  }));

  const { error } = await supabase
    .from('solopreneur_keywords')
    .insert(keywordData);

  if (error) {
    console.error('키워드 추가 오류:', error.message);
    return false;
  }

  return true;
}

// 메인 테스트 함수
async function runTest() {
  try {
    // 1. 기존 키워드 확인
    const existingKeywords = await checkKeywords();
    console.log('기존 키워드:', existingKeywords);

    // 2. 기존 키워드 삭제
    console.log('기존 키워드 삭제 중...');
    const deleteResult = await deleteKeywords();
    if (!deleteResult) {
      console.log('키워드 삭제 실패, 테스트 종료');
      return;
    }
    console.log('기존 키워드 삭제 완료');

    // 3. 새 키워드 추가
    console.log('새 키워드 추가 중...');
    const insertResult = await insertKeywords(testKeywords);
    if (!insertResult) {
      console.log('키워드 추가 실패, 테스트 종료');
      return;
    }
    console.log('새 키워드 추가 완료');

    // 4. 추가 후 키워드 확인
    const updatedKeywords = await checkKeywords();
    console.log('업데이트된 키워드:', updatedKeywords);

  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
  }
}

// 테스트 실행
runTest().catch(error => {
  console.error('테스트 중 오류 발생:', error.message);
}); 