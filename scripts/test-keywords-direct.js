require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경 변수 로드 상태 확인
console.log('환경 변수 확인 중...');
console.log('현재 작업 디렉토리:', process.cwd());

// 환경 변수 파일 존재 여부 확인
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);
console.log('.env.local 파일 존재 여부:', envExists ? '존재함' : '존재하지 않음');

// 직접 환경 변수 파일 읽기 시도
if (envExists) {
  try {
    const envContents = fs.readFileSync(envPath, 'utf8');
    console.log('.env.local 파일 읽기 성공');
    
    // 내용 로깅 (비밀 정보는 일부만 표시)
    const lines = envContents.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          const maskedValue = value.length > 10 ? value.substring(0, 5) + '...' + value.substring(value.length - 5) : value;
          console.log(`${key}: ${maskedValue}`);
        }
      }
    }
  } catch (e) {
    console.error('.env.local 파일 읽기 오류:', e.message);
  }
}

// 환경 변수에서 직접 읽기
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('환경 변수에서 읽은 값:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : '설정되지 않음');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : '설정되지 않음');

// 하드코딩된 값으로 대체 (테스트용)
if (!supabaseUrl || !supabaseServiceKey) {
  console.log('환경 변수에서 값을 가져올 수 없어 .env.local 파일의 값을 직접 사용합니다.');
  
  try {
    const envContents = fs.readFileSync(envPath, 'utf8');
    const lines = envContents.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.substring('NEXT_PUBLIC_SUPABASE_URL='.length).trim();
      } else if (line.startsWith('SUPABASE_SERVICE_KEY=')) {
        supabaseServiceKey = line.substring('SUPABASE_SERVICE_KEY='.length).trim();
      }
    }
    
    console.log('파일에서 직접 읽은 값:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : '설정되지 않음');
    console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : '설정되지 않음');
  } catch (e) {
    console.error('수동 환경 변수 추출 오류:', e.message);
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL 또는 서비스 키를 가져올 수 없습니다.');
  process.exit(1);
}

// 매개변수 처리
const solopreneurId = 1; // Alex Hormozi
const keywords = ['business', 'entrepreneurship', 'marketing', 'motivation', 'finance'];

async function main() {
  console.log(`[테스트] 솔로프리너 ID ${solopreneurId}의 키워드 관리 테스트`);
  
  try {
    // Supabase 클라이언트 생성
    console.log('Supabase 클라이언트 생성 중...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase 클라이언트 생성 완료');
    
    // 1단계: 기존 키워드 삭제
    console.log('기존 키워드 삭제 중...');
    const { error: deleteError } = await supabase
      .from('solopreneur_keywords')
      .delete()
      .eq('solopreneur_id', solopreneurId);
    
    if (deleteError) {
      console.error('키워드 삭제 오류:', deleteError);
    } else {
      console.log('기존 키워드 삭제 성공');
    }
    
    // 2단계: 새 키워드 추가
    console.log(`${keywords.length}개 키워드 추가 중...`);
    
    // 키워드 하나씩 추가
    for (const keyword of keywords) {
      console.log(`키워드 "${keyword}" 추가 시도...`);
      const { error: insertError } = await supabase
        .from('solopreneur_keywords')
        .insert({
          solopreneur_id: solopreneurId,
          keyword: keyword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error(`키워드 "${keyword}" 추가 오류:`, insertError);
      } else {
        console.log(`키워드 "${keyword}" 추가 성공`);
      }
    }
    
    // 3단계: 결과 확인
    console.log('결과 확인 중...');
    const { data: resultKeywords, error: fetchError } = await supabase
      .from('solopreneur_keywords')
      .select('id, keyword')
      .eq('solopreneur_id', solopreneurId);
    
    if (fetchError) {
      console.error('키워드 조회 오류:', fetchError);
    } else {
      console.log('저장된 키워드:', resultKeywords.map(k => k.keyword).join(', '));
      console.log(`총 ${resultKeywords.length}개 키워드 확인됨`);
    }
    
  } catch (error) {
    console.error('테스트 중 예외 발생:', error);
  }
}

main(); 