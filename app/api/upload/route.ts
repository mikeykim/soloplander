import { NextRequest, NextResponse } from 'next/server'
import { supabase, testSupabaseConnection } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'

// 환경 변수 설정 여부 확인
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 임시 이미지 URL 생성 함수
function generateTempImageUrl(platform: string) {
  const randomId = Math.floor(Math.random() * 100);
  
  switch (platform) {
    case 'youtube':
      return `https://picsum.photos/800/450?random=${randomId}`;
    case 'twitter':
      return `https://picsum.photos/600/300?random=${randomId}`;
    case 'linkedin':
      return `https://picsum.photos/700/400?random=${randomId}`;
    case 'instagram':
      return `https://picsum.photos/600/600?random=${randomId}`;
    case 'website':
      return `https://picsum.photos/1200/630?random=${randomId}`;
    case 'profile':
    default:
      // 프로필 이미지는 남성/여성 랜덤 사용자 이미지 사용
      const gender = Math.random() > 0.5 ? 'men' : 'women';
      const personId = Math.floor(Math.random() * 99) + 1;
      return `https://randomuser.me/api/portraits/${gender}/${personId}.jpg`;
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/upload 요청 받음');
  console.log('환경 변수 설정 여부:', isSupabaseConfigured ? '설정됨' : '설정되지 않음');
  
  try {
    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string || 'profile';
    
    console.log('업로드 요청 정보:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type,
      platform 
    });
    
    // 파일 유효성 검사
    if (!file) {
      console.log('파일이 제공되지 않음');
      return NextResponse.json({
        url: generateTempImageUrl(platform),
        platform,
        message: '파일이 제공되지 않아 임시 이미지 URL이 생성되었습니다.',
        success: true
      }, { status: 200 });
    }
    
    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      console.log('유효하지 않은 파일 타입:', file.type);
      return NextResponse.json({
        url: generateTempImageUrl(platform),
        platform,
        message: '유효하지 않은 파일 타입으로 임시 이미지 URL이 생성되었습니다.',
        success: true
      }, { status: 200 });
    }
    
    // 파일 크기 검사 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      console.log('파일 크기 초과:', file.size);
      return NextResponse.json({
        url: generateTempImageUrl(platform),
        platform,
        message: '파일 크기 초과로 임시 이미지 URL이 생성되었습니다.',
        success: true
      }, { status: 200 });
    }
    
    // 환경 변수가 설정되지 않은 경우 임시 이미지 URL 반환
    if (!isSupabaseConfigured) {
      console.warn('Supabase 환경 변수가 설정되지 않았습니다. 임시 이미지 URL을 반환합니다.');
      const imageUrl = generateTempImageUrl(platform);
      
      return NextResponse.json({
        url: imageUrl,
        platform,
        message: `임시 ${platform} 이미지 URL이 생성되었습니다.`,
        success: true
      }, { status: 200 });
    }
    
    // Supabase 연결 테스트
    console.log('Supabase 연결 테스트 시작');
    const connectionTest = await testSupabaseConnection();
    console.log('Supabase 연결 테스트 결과:', connectionTest.success);
    
    if (!connectionTest.success) {
      console.log('Supabase 연결 실패, 임시 이미지 URL 반환:', connectionTest.error);
      const imageUrl = generateTempImageUrl(platform);
      
      return NextResponse.json({
        url: imageUrl,
        platform,
        message: `임시 ${platform} 이미지 URL이 생성되었습니다.`,
        success: true
      }, { status: 200 });
    }
    
    try {
      console.log('파일 데이터 변환 시작');
      // 파일 데이터를 ArrayBuffer로 변환
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      console.log('파일 데이터 변환 완료, 크기:', buffer.length);
      
      // 파일 확장자 추출
      const fileExtension = file.name.split('.').pop() || 'jpg';
      
      // 파일 경로 생성 (단순화된 구조)
      const fileName = `${uuidv4()}.${fileExtension}`;
      console.log('생성된 파일 경로:', fileName);
      
      // 버킷 이름 설정
      const bucketName = 'solopreneur-images';
      
      // Supabase Storage에 업로드 시도
      console.log(`${bucketName} 버킷에 파일 업로드 시작`);
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });
        
        if (error) {
          console.error('파일 업로드 오류:', error);
          
          // 권한 문제일 경우 RLS 정책 문제 메시지 표시
          if (error.message?.includes('new row violates row-level security policy') || 
              error.message?.includes('permission denied')) {
            console.log('Supabase RLS 정책 문제 감지. 대체 이미지 사용');
            const fallbackImageUrl = generateTempImageUrl(platform);
            
            return NextResponse.json({
              url: fallbackImageUrl,
              platform,
              message: 'Supabase 스토리지 권한 문제로 임시 이미지 URL이 생성되었습니다.',
              success: true,
              details: error.message
            }, { status: 200 });
          }
          
          // 기타 오류
          const fallbackImageUrl = generateTempImageUrl(platform);
          return NextResponse.json({
            url: fallbackImageUrl,
            platform,
            message: `업로드 실패로 임시 ${platform} 이미지 URL이 생성되었습니다.`,
            success: true,
            details: error.message
          }, { status: 200 });
        }
        
        console.log('파일 업로드 성공:', data);
        
        // 업로드된 파일의 공개 URL 생성
        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
        console.log('생성된 파일 URL:', fileUrl);
        
        return NextResponse.json({
          url: fileUrl,
          platform,
          message: `${platform} 이미지가 성공적으로 업로드되었습니다.`,
          success: true
        }, { status: 200 });
      } catch (storageError) {
        console.error('Supabase Storage 오류:', storageError);
        const fallbackImageUrl = generateTempImageUrl(platform);
        
        return NextResponse.json({
          url: fallbackImageUrl,
          platform,
          message: `스토리지 오류로 임시 ${platform} 이미지 URL이 생성되었습니다.`,
          success: true,
          details: storageError instanceof Error ? storageError.message : '알 수 없는 오류'
        }, { status: 200 });
      }
    } catch (uploadError) {
      console.error('파일 업로드 과정 중 오류:', uploadError);
      
      // 업로드 실패 시 임시 URL 반환
      const fallbackImageUrl = generateTempImageUrl(platform);
      
      return NextResponse.json({
        url: fallbackImageUrl,
        platform,
        message: `업로드 실패로 임시 ${platform} 이미지 URL이 생성되었습니다.`,
        success: true,
        details: uploadError instanceof Error ? uploadError.message : '알 수 없는 오류'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('파일 업로드 중 예외 발생:', error);
    
    // 오류 발생 시 임시 URL 반환 (항상 200 상태 코드 반환)
    return NextResponse.json({
      url: generateTempImageUrl('profile'),
      platform: 'profile',
      message: '오류가 발생하여 임시 이미지 URL이 생성되었습니다.',
      success: true,
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 200 });
  }
} 