const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Supabase 연결 정보
const supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
// 서비스 역할 키 사용 (RLS 정책 우회)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA2ODI2MywiZXhwIjoyMDU2NjQ0MjYzfQ.gBuYdKp87nDx451c5dv7l3aZoU-EfbkwJopUoz6WIAI';

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 버킷 이름
const BUCKET_NAME = 'solopreneur-images';

// 이미지 URL 업데이트 함수
async function updateImageUrls() {
  try {
    console.log('데이터베이스 이미지 URL 업데이트 시작...');
    
    // 모든 솔로프리너 조회
    const { data: solopreneurs, error: fetchError } = await supabase
      .from('solopreneurs')
      .select('*');
    
    if (fetchError) {
      console.error('솔로프리너 데이터 조회 오류:', fetchError.message);
      return;
    }
    
    console.log(`${solopreneurs.length}명의 솔로프리너 데이터를 업데이트합니다.`);
    
    // 프로필 이미지 URL 목록 가져오기
    const { data: profileFiles, error: profileError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('profiles');
    
    if (profileError) {
      console.error('프로필 이미지 목록 조회 오류:', profileError.message);
      return;
    }
    
    // 각 솔로프리너의 이미지 URL 업데이트
    for (const solopreneur of solopreneurs) {
      // 현재 이미지 파일명 추출 (URL에서 마지막 부분)
      const currentImageUrl = solopreneur.image;
      let imageName = '';
      
      if (currentImageUrl) {
        // URL에서 파일명 추출
        const urlParts = currentImageUrl.split('/');
        imageName = urlParts[urlParts.length - 1];
      } else {
        console.log(`솔로프리너 ID ${solopreneur.id}의 이미지 URL이 없습니다. 건너뜁니다.`);
        continue;
      }
      
      // 해당 이미지가 업로드되었는지 확인
      const matchingFile = profileFiles.find(file => file.name === imageName);
      
      if (matchingFile) {
        // 새 이미지 URL 생성
        const newImageUrl = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`profiles/${imageName}`).data.publicUrl;
        
        // 데이터베이스 업데이트
        const { data, error: updateError } = await supabase
          .from('solopreneurs')
          .update({ image: newImageUrl })
          .eq('id', solopreneur.id);
        
        if (updateError) {
          console.error(`솔로프리너 ID ${solopreneur.id} 이미지 URL 업데이트 오류:`, updateError.message);
        } else {
          console.log(`솔로프리너 ID ${solopreneur.id} 이미지 URL 업데이트 완료: ${newImageUrl}`);
        }
      } else {
        console.log(`솔로프리너 ID ${solopreneur.id}의 이미지 ${imageName}가 Storage에 없습니다.`);
      }
    }
    
    // 미리보기 이미지 URL 업데이트
    console.log('\n미리보기 이미지 URL 업데이트 시작...');
    
    // 모든 미리보기 데이터 조회
    const { data: previews, error: previewsError } = await supabase
      .from('solopreneur_previews')
      .select('*');
    
    if (previewsError) {
      console.error('미리보기 데이터 조회 오류:', previewsError.message);
      return;
    }
    
    console.log(`${previews ? previews.length : 0}개의 미리보기 데이터를 업데이트합니다.`);
    
    // 각 미리보기의 이미지 URL 업데이트
    if (previews && previews.length > 0) {
      for (const preview of previews) {
        // 현재 이미지 URL에서 파일명 추출
        const currentImageUrl = preview.image_url;
        
        if (!currentImageUrl) {
          console.log(`미리보기 ID ${preview.id}의 이미지 URL이 없습니다. 건너뜁니다.`);
          continue;
        }
        
        // URL에서 파일명과 플랫폼(폴더명) 추출
        const urlParts = currentImageUrl.split('/');
        const imageName = urlParts[urlParts.length - 1];
        const platform = preview.platform.toLowerCase();
        
        // 새 이미지 URL 생성 (플랫폼 폴더 사용)
        const newImageUrl = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`previews/${platform}/${imageName}`).data.publicUrl;
        
        // 데이터베이스 업데이트
        const { data, error: updateError } = await supabase
          .from('solopreneur_previews')
          .update({ image_url: newImageUrl })
          .eq('id', preview.id);
        
        if (updateError) {
          console.error(`미리보기 ID ${preview.id} 이미지 URL 업데이트 오류:`, updateError.message);
        } else {
          console.log(`미리보기 ID ${preview.id} 이미지 URL 업데이트 완료: ${newImageUrl}`);
        }
      }
    } else {
      console.log('업데이트할 미리보기 데이터가 없습니다.');
    }
    
    console.log('\n데이터베이스 이미지 URL 업데이트 완료!');
    
  } catch (error) {
    console.error('예외 발생:', error);
  }
}

// 이미지 URL 업데이트 실행
updateImageUrls()
  .catch(console.error)
  .finally(() => process.exit()); 