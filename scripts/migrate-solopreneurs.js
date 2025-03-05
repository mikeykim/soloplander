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

async function migrateSolopreneurs() {
  try {
    console.log('솔로프리너 데이터 마이그레이션 시작...');

    // 데이터 파일 읽기
    const fileContent = fs.readFileSync(solopreneursDataPath, 'utf8');
    
    // TypeScript 파일에서 데이터 추출 (간단한 방법)
    const dataStartIndex = fileContent.indexOf('[');
    const dataEndIndex = fileContent.lastIndexOf(']');
    const dataString = fileContent.substring(dataStartIndex, dataEndIndex + 1);
    
    // 데이터 문자열을 JavaScript 객체로 변환 (eval 사용 - 실제 프로덕션에서는 권장하지 않음)
    // 더 안전한 방법으로는 ts-node를 사용하여 TypeScript 파일을 직접 실행하는 방법이 있습니다.
    const solopreneursData = eval(dataString);

    // 각 솔로프리너 데이터 처리
    for (const solopreneur of solopreneursData) {
      console.log(`${solopreneur.name} 데이터 처리 중...`);
      
      // 1. 솔로프리너 기본 정보 삽입
      const { data: insertedSolopreneur, error: insertError } = await supabase
        .from('solopreneurs')
        .insert({
          name: solopreneur.name,
          region: solopreneur.region,
          image: solopreneur.image,
          description: solopreneur.description,
          gender: solopreneur.gender,
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error(`${solopreneur.name} 삽입 오류:`, insertError.message);
        continue;
      }
      
      const solopreneurId = insertedSolopreneur.id;
      console.log(`${solopreneur.name} 기본 정보 삽입 완료 (ID: ${solopreneurId})`);
      
      // 2. 소셜 미디어 링크 삽입
      const links = solopreneur.links;
      const linkEntries = Object.entries(links).filter(([key, value]) => 
        typeof value === 'string' && key !== 'previews'
      );
      
      for (const [platform, url] of linkEntries) {
        const { error: linkError } = await supabase
          .from('solopreneur_links')
          .insert({
            solopreneur_id: solopreneurId,
            platform,
            url,
          });
        
        if (linkError) {
          console.error(`${solopreneur.name}의 ${platform} 링크 삽입 오류:`, linkError.message);
        } else {
          console.log(`${solopreneur.name}의 ${platform} 링크 삽입 완료`);
        }
      }
      
      // 3. 미리보기 이미지 삽입
      if (links.previews) {
        const previewEntries = Object.entries(links.previews);
        
        for (const [platform, imageUrl] of previewEntries) {
          if (imageUrl) {
            const { error: previewError } = await supabase
              .from('solopreneur_previews')
              .insert({
                solopreneur_id: solopreneurId,
                platform,
                image_url: imageUrl,
              });
            
            if (previewError) {
              console.error(`${solopreneur.name}의 ${platform} 미리보기 삽입 오류:`, previewError.message);
            } else {
              console.log(`${solopreneur.name}의 ${platform} 미리보기 삽입 완료`);
            }
          }
        }
      }
    }

    console.log('솔로프리너 데이터 마이그레이션 완료!');
  } catch (error) {
    console.error('예외 발생:', error);
  }
}

// 마이그레이션 실행
migrateSolopreneurs()
  .catch(console.error)
  .finally(() => process.exit()); 