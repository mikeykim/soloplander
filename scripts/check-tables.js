const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 연결 정보
// 스크립트에서 직접 하드코딩하거나 .env 파일에서 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seuttskwyxmznloukxog.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjgyNjMsImV4cCI6MjA1NjY0NDI2M30.aM8fuEGJvni4RqFqWO1i9v9yhc2FdWDdIz5wJzKEDDE';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key 설정됨:', supabaseKey ? '예' : '아니오');
  
  try {
    // 연결 테스트
    console.log('\nSupabase 연결 테스트 중...');
    
    // 테이블 목록을 가져오기 위해 정보 스키마 쿼리
    const { data: tableListData, error: tableListError } = await supabase
      .from('solopreneurs')
      .select('*')
      .limit(1);
    
    if (tableListError) {
      console.error('solopreneurs 테이블 조회 오류:', tableListError.message);
    } else {
      console.log('solopreneurs 테이블이 존재합니다. 샘플 데이터:', tableListData);
    }
    
    // 다른 테이블도 확인
    const { data: linksData, error: linksError } = await supabase
      .from('solopreneur_links')
      .select('*')
      .limit(1);
    
    if (linksError) {
      console.error('solopreneur_links 테이블 조회 오류:', linksError.message);
    } else {
      console.log('solopreneur_links 테이블이 존재합니다. 샘플 데이터:', linksData);
    }
    
    // previews 테이블 확인
    const { data: previewsData, error: previewsError } = await supabase
      .from('solopreneur_previews')
      .select('*')
      .limit(1);
    
    if (previewsError) {
      console.error('solopreneur_previews 테이블 조회 오류:', previewsError.message);
    } else {
      console.log('solopreneur_previews 테이블이 존재합니다. 샘플 데이터:', previewsData);
    }
    
    // keywords 테이블 확인
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('solopreneur_keywords')
      .select('*')
      .limit(1);
    
    if (keywordsError) {
      console.error('solopreneur_keywords 테이블 조회 오류:', keywordsError.message);
    } else {
      console.log('solopreneur_keywords 테이블이 존재합니다. 샘플 데이터:', keywordsData);
    }
  } catch (e) {
    console.error('예외 발생:', e.message);
  }
}

checkTables().catch(console.error); 