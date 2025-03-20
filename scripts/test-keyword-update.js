require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// ID와 키워드 매개변수 처리
const args = process.argv.slice(2);
const solopreneurId = args[0] || '1'; // 기본값: 1 (Alex Hormozi)
const keywordsArg = args[1] || 'business,marketing,entrepreneurship'; // 기본 키워드

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  process.exit(1);
}

console.log('테스트 시작: 키워드 업데이트');
console.log(`솔로프리너 ID: ${solopreneurId}`);
console.log(`키워드: ${keywordsArg}`);

async function testKeywordUpdate() {
  try {
    // 서비스 롤 클라이언트 생성
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase 서비스 롤 클라이언트 생성됨');

    // 솔로프리너 정보 확인
    const { data: solopreneur, error: fetchError } = await serviceClient
      .from('solopreneurs')
      .select('id, name, region')
      .eq('id', solopreneurId)
      .single();

    if (fetchError) {
      console.error('솔로프리너 조회 오류:', fetchError.message);
      process.exit(1);
    }

    console.log(`솔로프리너 정보: ID=${solopreneur.id}, 이름=${solopreneur.name}, 지역=${solopreneur.region}`);

    // 1. 기존 키워드 조회
    const { data: existingKeywords, error: keywordFetchError } = await serviceClient
      .from('solopreneur_keywords')
      .select('id, keyword')
      .eq('solopreneur_id', solopreneurId);

    if (keywordFetchError) {
      console.error('기존 키워드 조회 오류:', keywordFetchError.message);
    } else {
      console.log(`기존 키워드 (${existingKeywords.length}개):`, 
        existingKeywords.map(k => k.keyword).join(', ') || '없음');
    }

    // 2. 기존 키워드 삭제
    const { error: deleteError } = await serviceClient
      .from('solopreneur_keywords')
      .delete()
      .eq('solopreneur_id', solopreneurId);

    if (deleteError) {
      console.error('키워드 삭제 오류:', deleteError.message);
      console.log('삭제 오류가 발생했지만 계속 진행합니다.');
    } else {
      console.log('기존 키워드 삭제 성공');
    }

    // 3. 새 키워드 처리
    const keywords = keywordsArg.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    console.log(`추가할 키워드 (${keywords.length}개):`, keywords.join(', '));

    // 4. 새 키워드 추가
    const keywordInserts = keywords.map(keyword => ({
      solopreneur_id: solopreneurId,
      keyword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // 전체 추가 시도
    const { error: batchInsertError } = await serviceClient
      .from('solopreneur_keywords')
      .insert(keywordInserts);

    if (batchInsertError) {
      console.error('키워드 일괄 추가 오류:', batchInsertError.message);
      
      // 개별 추가 시도
      console.log('키워드를 개별적으로 추가합니다...');
      let successCount = 0;
      
      for (const keyword of keywords) {
        const { error: singleInsertError } = await serviceClient
          .from('solopreneur_keywords')
          .insert({
            solopreneur_id: solopreneurId,
            keyword,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (singleInsertError) {
          console.error(`키워드 "${keyword}" 추가 실패:`, singleInsertError.message);
        } else {
          successCount++;
          console.log(`키워드 "${keyword}" 추가 성공`);
        }
      }
      
      console.log(`${successCount}/${keywords.length} 키워드 추가 성공`);
    } else {
      console.log(`모든 키워드 (${keywordInserts.length}개) 일괄 추가 성공`);
    }

    // 5. 결과 확인
    const { data: resultKeywords, error: resultFetchError } = await serviceClient
      .from('solopreneur_keywords')
      .select('keyword')
      .eq('solopreneur_id', solopreneurId);

    if (resultFetchError) {
      console.error('결과 키워드 조회 오류:', resultFetchError.message);
    } else {
      console.log(`최종 키워드 (${resultKeywords.length}개):`, 
        resultKeywords.map(k => k.keyword).join(', ') || '없음');
    }

    console.log('테스트 완료!');

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

testKeywordUpdate(); 