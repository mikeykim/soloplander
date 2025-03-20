const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 파일 직접 로드
console.log('환경 변수 확인 중...');
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('환경 변수 파일 경로:', envPath);
console.log('파일 존재 여부:', fs.existsSync(envPath) ? '존재함' : '존재하지 않음');

// 환경 변수 직접 설정
let supabaseUrl = '';
let supabaseKey = '';

// 하드코딩된 값을 사용 (주의: 실제 프로덕션 코드에서는 사용하지 마세요)
supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA2ODI2MywiZXhwIjoyMDU2NjQ0MjYzfQ.JmRGeFKNvXrNs0VwbHzqTDdcJoLzU-6qsRXnDx_JbsY';

// 콘솔에 마스킹된 정보 출력
console.log('SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : '없음');
console.log('API_KEY:', supabaseKey ? `${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}` : '없음');

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 컴맨드 라인 인자 처리
const args = process.argv.slice(2);
const solopreneurId = parseInt(args[0] || '1'); // 기본값: 1
const keywordsText = args[1] || 'marketing,business,entrepreneurship,sales';
const keywords = keywordsText.split(',').map(k => k.trim()).filter(Boolean);

console.log(`솔로프리너 ID: ${solopreneurId}`);
console.log(`키워드 (${keywords.length}개): ${keywords.join(', ')}`);

async function main() {
  // Supabase 클라이언트 생성
  console.log('Supabase 클라이언트 생성 중...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. 솔로프리너 존재 확인
    console.log(`솔로프리너 ID ${solopreneurId} 확인 중...`);
    const { data: solopreneur, error: solopreneurError } = await supabase
      .from('solopreneurs')
      .select('id, name')
      .eq('id', solopreneurId)
      .single();
    
    if (solopreneurError) {
      console.error('솔로프리너 조회 오류:', solopreneurError.message);
      console.error('오류 세부 정보:', solopreneurError.details || '없음');
      process.exit(1);
    }
    
    console.log(`솔로프리너 확인됨: ${solopreneur.name} (ID: ${solopreneur.id})`);
    
    // 2. 기존 키워드 조회
    console.log('기존 키워드 조회 중...');
    const { data: existingKeywords, error: keywordFetchError } = await supabase
      .from('solopreneur_keywords')
      .select('id, keyword')
      .eq('solopreneur_id', solopreneurId);
    
    if (keywordFetchError) {
      console.error('키워드 조회 오류:', keywordFetchError.message);
      console.error('오류 세부 정보:', keywordFetchError.details || '없음');
    } else {
      const keywordList = existingKeywords.map(k => k.keyword).join(', ');
      console.log(`기존 키워드 (${existingKeywords.length}개): ${keywordList || '없음'}`);
    }
    
    // 3. 기존 키워드 삭제
    console.log('기존 키워드 삭제 중...');
    const { error: deleteError } = await supabase
      .from('solopreneur_keywords')
      .delete()
      .eq('solopreneur_id', solopreneurId);
    
    if (deleteError) {
      console.error('키워드 삭제 오류:', deleteError.message);
      console.error('오류 세부 정보:', deleteError.details || '없음');
      
      console.log('삭제 오류 발생, 계속 진행합니다...');
    } else {
      console.log('기존 키워드 삭제 성공');
    }
    
    // 4. 새 키워드 추가
    console.log(`${keywords.length}개 키워드 추가 중...`);
    
    let successCount = 0;
    let failureCount = 0;
    let errorDetails = [];
    
    for (const keyword of keywords) {
      console.log(`키워드 '${keyword}' 추가 중...`);
      
      try {
        const { error: insertError } = await supabase
          .from('solopreneur_keywords')
          .insert({
            solopreneur_id: solopreneurId,
            keyword,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`키워드 '${keyword}' 추가 오류:`, insertError.message);
          console.error('오류 세부 정보:', insertError.details || '없음');
          
          errorDetails.push({ keyword, error: insertError.message });
          failureCount++;
        } else {
          console.log(`키워드 '${keyword}' 추가 성공`);
          successCount++;
        }
      } catch (e) {
        console.error(`키워드 '${keyword}' 추가 중 예외 발생:`, e.message);
        failureCount++;
      }
    }
    
    console.log(`결과: ${successCount}개 성공, ${failureCount}개 실패`);
    
    if (errorDetails.length > 0) {
      console.log('발생한 오류 요약:');
      errorDetails.forEach(detail => {
        console.log(`- 키워드 '${detail.keyword}': ${detail.error}`);
      });
    }
    
    // 5. 결과 확인
    console.log('최종 키워드 조회 중...');
    const { data: resultKeywords, error: resultFetchError } = await supabase
      .from('solopreneur_keywords')
      .select('id, keyword')
      .eq('solopreneur_id', solopreneurId);
    
    if (resultFetchError) {
      console.error('최종 키워드 조회 오류:', resultFetchError.message);
      console.error('오류 세부 정보:', resultFetchError.details || '없음');
    } else {
      const finalKeywords = resultKeywords.map(k => k.keyword).join(', ');
      console.log(`최종 키워드 (${resultKeywords.length}개): ${finalKeywords || '없음'}`);
    }
    
    console.log('테스트 완료!');
  } catch (error) {
    console.error('테스트 중 예외 발생:', error);
  }
}

main(); 