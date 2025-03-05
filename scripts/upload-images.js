const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 연결 정보
const supabaseUrl = 'https://seuttskwyxmznloukxog.supabase.co';
// 서비스 역할 키 사용 (RLS 정책 우회)
// 방법 2: 직접 키 입력 (개발 환경에서만 사용)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXR0c2t3eXhtem5sb3VreG9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA2ODI2MywiZXhwIjoyMDU2NjQ0MjYzfQ.gBuYdKp87nDx451c5dv7l3aZoU-EfbkwJopUoz6WIAI';

// 방법 1: 환경 변수 사용 (권장)
// 환경 변수 설정 후 실행: $env:SUPABASE_SERVICE_KEY="your_key"; node scripts/upload-images.js
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Supabase 클라이언트 생성 (서비스 역할 키 사용)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 이미지 폴더 경로
const imagesDir = path.join(__dirname, '../public/images');
const previewsDir = path.join(__dirname, '../public/images/previews');

// 버킷 이름
const BUCKET_NAME = 'solopreneur-images';

// 버킷 생성 함수
async function createBucket() {
  try {
    // 버킷이 이미 존재하는지 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('버킷 목록 조회 오류:', listError.message);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (bucketExists) {
      console.log(`'${BUCKET_NAME}' 버킷이 이미 존재합니다.`);
      return true;
    }
    
    // 버킷 생성
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true, // 공개 접근 가능하도록 설정
      fileSizeLimit: 10485760, // 10MB 제한 (필요에 따라 조정)
    });
    
    if (error) {
      console.error('버킷 생성 오류:', error.message);
      return false;
    }
    
    console.log(`'${BUCKET_NAME}' 버킷이 성공적으로 생성되었습니다.`);
    return true;
  } catch (error) {
    console.error('버킷 생성 중 예외 발생:', error);
    return false;
  }
}

// 폴더 생성 함수
async function createFolder(folderPath) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${folderPath}/.keep`, new Uint8Array(0), {
        upsert: true
      });
    
    if (error && error.message !== 'The resource already exists') {
      console.error(`'${folderPath}' 폴더 생성 오류:`, error.message);
      return false;
    }
    
    console.log(`'${folderPath}' 폴더가 준비되었습니다.`);
    return true;
  } catch (error) {
    console.error(`'${folderPath}' 폴더 생성 중 예외 발생:`, error);
    return false;
  }
}

// 이미지 업로드 함수
async function uploadImages() {
  try {
    console.log('이미지 업로드 시작...');
    
    // 서비스 키 확인
    if (!supabaseServiceKey) {
      console.error('Supabase 서비스 역할 키가 설정되지 않았습니다.');
      console.log('다음 방법 중 하나로 서비스 역할 키를 설정해주세요:');
      console.log('1. 스크립트에서 직접 supabaseServiceKey 변수 값을 수정');
      console.log('2. 환경 변수 SUPABASE_SERVICE_KEY 설정 후 스크립트 실행');
      console.log('   예: $env:SUPABASE_SERVICE_KEY="your_key"; node scripts/upload-images.js');
      return;
    }
    
    // 버킷 생성 확인
    const bucketCreated = await createBucket();
    if (!bucketCreated) {
      console.log('버킷 생성에 실패했습니다. 프로세스를 종료합니다.');
      return;
    }
    
    // 필요한 폴더 생성
    const profilesFolderCreated = await createFolder('profiles');
    const previewsFolderCreated = await createFolder('previews');
    
    if (!profilesFolderCreated || !previewsFolderCreated) {
      console.log('필요한 폴더를 생성할 수 없습니다. 프로세스를 종료합니다.');
      return;
    }
    
    // 솔로프리너 프로필 이미지 업로드
    if (fs.existsSync(imagesDir)) {
      const profileImages = fs.readdirSync(imagesDir).filter(file => 
        !fs.statSync(path.join(imagesDir, file)).isDirectory() && 
        (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
      );
      
      console.log(`${profileImages.length}개의 프로필 이미지를 업로드합니다.`);
      
      for (const image of profileImages) {
        const filePath = path.join(imagesDir, image);
        const fileContent = fs.readFileSync(filePath);
        const fileExt = path.extname(image).substring(1);
        
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(`profiles/${image}`, fileContent, {
            contentType: `image/${fileExt}`,
            upsert: true
          });
        
        if (error) {
          console.error(`${image} 업로드 오류:`, error.message);
        } else {
          console.log(`${image} 업로드 완료`);
        }
      }
    } else {
      console.log(`이미지 디렉토리 '${imagesDir}'가 존재하지 않습니다.`);
    }
    
    // 미리보기 이미지 업로드 (하위 폴더 탐색)
    async function uploadPreviewImages(dir, prefix = '') {
      if (!fs.existsSync(dir)) {
        console.log(`디렉토리 '${dir}'가 존재하지 않습니다.`);
        return;
      }
      
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // 하위 폴더 처리 (폴더 생성 후 재귀 호출)
          const folderName = file.toLowerCase();
          await createFolder(`previews/${prefix}${folderName}`);
          await uploadPreviewImages(filePath, `${prefix}${folderName}/`);
        } else if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
          // 이미지 파일 업로드
          const fileContent = fs.readFileSync(filePath);
          const fileExt = path.extname(file).substring(1);
          
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(`previews/${prefix}${file}`, fileContent, {
              contentType: `image/${fileExt}`,
              upsert: true
            });
          
          if (error) {
            console.error(`${prefix}${file} 업로드 오류:`, error.message);
          } else {
            console.log(`${prefix}${file} 업로드 완료`);
          }
        }
      }
    }
    
    // 미리보기 이미지 업로드 시작
    if (fs.existsSync(previewsDir)) {
      console.log('미리보기 이미지 업로드 시작...');
      await uploadPreviewImages(previewsDir);
    } else {
      console.log(`미리보기 디렉토리 '${previewsDir}'가 존재하지 않습니다.`);
    }
    
    console.log('이미지 업로드 완료!');
    
    // 업로드된 이미지 URL 출력
    console.log('\n업로드된 이미지 URL:');
    
    // 프로필 이미지 URL
    const { data: profileUrls, error: profileError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('profiles');
    
    if (profileError) {
      console.error('프로필 이미지 목록 조회 오류:', profileError.message);
    } else if (profileUrls && profileUrls.length > 0) {
      console.log('\n프로필 이미지:');
      profileUrls.forEach(item => {
        if (!item.id) return; // 폴더 제외
        
        const publicUrl = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`profiles/${item.name}`).data.publicUrl;
        console.log(`- ${item.name}: ${publicUrl}`);
      });
    } else {
      console.log('업로드된 프로필 이미지가 없습니다.');
    }
    
    // 미리보기 이미지 URL
    const { data: previewFolders, error: previewFoldersError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('previews');
    
    if (previewFoldersError) {
      console.error('미리보기 폴더 목록 조회 오류:', previewFoldersError.message);
    } else if (previewFolders && previewFolders.length > 0) {
      console.log('\n미리보기 이미지 (일부 예시):');
      
      // 첫 번째 폴더의 이미지만 예시로 출력
      for (const folder of previewFolders.slice(0, 2)) {
        if (folder.id) { // 폴더인 경우
          const { data: previewImages, error: previewImagesError } = await supabase.storage
            .from(BUCKET_NAME)
            .list(`previews/${folder.name}`);
          
          if (previewImagesError) {
            console.error(`'${folder.name}' 폴더 이미지 목록 조회 오류:`, previewImagesError.message);
          } else if (previewImages && previewImages.length > 0) {
            console.log(`\n${folder.name} 폴더:`);
            previewImages.slice(0, 3).forEach(item => { // 각 폴더에서 최대 3개만 출력
              if (!item.id) return; // 폴더 제외
              
              const publicUrl = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(`previews/${folder.name}/${item.name}`).data.publicUrl;
              console.log(`- ${item.name}: ${publicUrl}`);
            });
            
            if (previewImages.length > 3) {
              console.log(`  ... 외 ${previewImages.length - 3}개 더 있음`);
            }
          }
        }
      }
      
      if (previewFolders.length > 2) {
        console.log(`\n... 외 ${previewFolders.length - 2}개 폴더 더 있음`);
      }
    } else {
      console.log('업로드된 미리보기 이미지가 없습니다.');
    }
    
  } catch (error) {
    console.error('예외 발생:', error);
  }
}

// 이미지 업로드 실행
uploadImages()
  .catch(console.error)
  .finally(() => process.exit()); 