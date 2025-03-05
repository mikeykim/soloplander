import { NextRequest, NextResponse } from 'next/server'
import { supabase, testSupabaseConnection } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  console.log('POST /api/upload 요청 받음');
  
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
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 타입 검사
    if (!file.type.startsWith('image/')) {
      console.log('유효하지 않은 파일 타입:', file.type);
      return NextResponse.json(
        { error: '이미지 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 크기 검사 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      console.log('파일 크기 초과:', file.size);
      return NextResponse.json(
        { error: '파일 크기는 5MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }
    
    // Supabase 연결 테스트
    console.log('Supabase 연결 테스트 시작');
    const connectionTest = await testSupabaseConnection();
    console.log('Supabase 연결 테스트 결과:', connectionTest.success);
    
    if (!connectionTest.success) {
      console.log('Supabase 연결 실패, 임시 이미지 URL 반환:', connectionTest.error);
      
      // 플랫폼별 임시 이미지 URL 반환
      let imageUrl = '';
      
      switch (platform) {
        case 'youtube':
          imageUrl = 'https://picsum.photos/800/450?random=1';
          break;
        case 'twitter':
          imageUrl = 'https://picsum.photos/600/300?random=2';
          break;
        case 'linkedin':
          imageUrl = 'https://picsum.photos/700/400?random=3';
          break;
        case 'instagram':
          imageUrl = 'https://picsum.photos/600/600?random=4';
          break;
        case 'website':
          imageUrl = 'https://picsum.photos/1200/630?random=5';
          break;
        case 'profile':
        default:
          imageUrl = 'https://randomuser.me/api/portraits/men/1.jpg';
          break;
      }
      
      return NextResponse.json({
        url: imageUrl,
        platform,
        message: `임시 ${platform} 이미지 URL이 생성되었습니다.`
      });
    }
    
    try {
      console.log('파일 데이터 변환 시작');
      // 파일 데이터를 ArrayBuffer로 변환
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      console.log('파일 데이터 변환 완료, 크기:', buffer.length);
      
      // 파일 확장자 추출
      const fileExtension = file.name.split('.').pop() || 'jpg';
      
      // 파일 경로 생성 (플랫폼별 폴더 구조)
      const fileName = `${platform}/${uuidv4()}.${fileExtension}`;
      console.log('생성된 파일 경로:', fileName);
      
      // Supabase Storage 버킷 확인
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('사용 가능한 버킷:', buckets);
      
      if (bucketsError) {
        console.error('버킷 목록 조회 오류:', bucketsError);
        throw new Error('스토리지 버킷을 조회할 수 없습니다.');
      }
      
      // 'solopreneurs' 버킷이 없으면 생성
      const solopreneursBucket = buckets.find(b => b.name === 'solopreneurs');
      if (!solopreneursBucket) {
        console.log('solopreneurs 버킷이 없어 새로 생성합니다.');
        const { error: createBucketError } = await supabase.storage.createBucket('solopreneurs', {
          public: true
        });
        
        if (createBucketError) {
          console.error('버킷 생성 오류:', createBucketError);
          throw new Error('스토리지 버킷을 생성할 수 없습니다.');
        }
      }
      
      // Supabase Storage에 업로드
      console.log('Supabase Storage에 파일 업로드 시작');
      const { data, error } = await supabase.storage
        .from('solopreneurs')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });
      
      if (error) {
        console.error('파일 업로드 오류:', error);
        return NextResponse.json(
          { error: `파일 업로드 중 오류가 발생했습니다: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log('파일 업로드 성공:', data);
      
      // 업로드된 파일의 공개 URL 생성
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/solopreneurs/${fileName}`;
      console.log('생성된 파일 URL:', fileUrl);
      
      return NextResponse.json({
        url: fileUrl,
        platform,
        message: `${platform} 이미지가 성공적으로 업로드되었습니다.`
      });
    } catch (uploadError) {
      console.error('파일 업로드 과정 중 오류:', uploadError);
      
      // 업로드 실패 시 임시 URL 반환
      let fallbackImageUrl = '';
      
      switch (platform) {
        case 'youtube':
          fallbackImageUrl = 'https://picsum.photos/800/450?random=1';
          break;
        case 'twitter':
          fallbackImageUrl = 'https://picsum.photos/600/300?random=2';
          break;
        case 'linkedin':
          fallbackImageUrl = 'https://picsum.photos/700/400?random=3';
          break;
        case 'instagram':
          fallbackImageUrl = 'https://picsum.photos/600/600?random=4';
          break;
        case 'website':
          fallbackImageUrl = 'https://picsum.photos/1200/630?random=5';
          break;
        case 'profile':
        default:
          fallbackImageUrl = 'https://randomuser.me/api/portraits/men/1.jpg';
          break;
      }
      
      return NextResponse.json({
        url: fallbackImageUrl,
        platform,
        message: `업로드 실패로 임시 ${platform} 이미지 URL이 생성되었습니다.`
      });
    }
  } catch (error) {
    console.error('파일 업로드 중 예외 발생:', error);
    
    // 오류 발생 시 임시 URL 반환
    return NextResponse.json({
      url: 'https://randomuser.me/api/portraits/men/1.jpg',
      platform: 'profile',
      message: '오류가 발생하여 임시 이미지 URL이 생성되었습니다.'
    });
  }
} 