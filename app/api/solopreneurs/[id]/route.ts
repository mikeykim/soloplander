import { NextRequest, NextResponse } from 'next/server';
import { supabase, testSupabaseConnection } from '@/utils/supabase';

// 임시 데이터
const tempSolopreneurs = {
  '1': {
    id: 1,
    name: '김솔로',
    region: '서울',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    description: '디지털 마케팅 전문가',
    gender: '남성',
    links: {
      youtube: 'https://youtube.com/user/kimsolopreneur',
      twitter: 'https://twitter.com/kimsolopreneur',
      linkedin: 'https://linkedin.com/in/kimsolopreneur',
      previews: {
        youtube: 'https://picsum.photos/800/450?random=1',
        twitter: 'https://picsum.photos/600/300?random=2',
        linkedin: 'https://picsum.photos/700/400?random=3'
      }
    },
    keywords: ['마케팅', '디지털', 'SNS'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  '2': {
    id: 2,
    name: '이프리',
    region: '부산',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    description: '프리랜서 디자이너',
    gender: '여성',
    links: {
      youtube: 'https://youtube.com/user/leefree',
      twitter: 'https://twitter.com/leefree',
      linkedin: 'https://linkedin.com/in/leefree',
      previews: {
        youtube: 'https://picsum.photos/800/450?random=4',
        twitter: 'https://picsum.photos/600/300?random=5',
        linkedin: 'https://picsum.photos/700/400?random=6'
      }
    },
    keywords: ['디자인', '프리랜서', 'UI/UX'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

// 환경 변수 설정 여부 확인
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`GET /api/solopreneurs/${params.id} 요청 받음`);
  
  // 환경 변수가 설정되지 않은 경우 즉시 임시 데이터 반환
  if (!isSupabaseConfigured) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 임시 데이터를 사용합니다.');
    const tempSolopreneur = tempSolopreneurs[params.id];
    
    if (!tempSolopreneur) {
      return NextResponse.json(
        { error: '솔로프리너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tempSolopreneur);
  }
  
  try {
    const id = params.id;
    
    // Supabase 연결 테스트
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.log('Supabase 연결 실패, 임시 데이터 반환:', connectionTest.error);
      
      // 임시 데이터에서 해당 ID의 솔로프리너 찾기
      const tempSolopreneur = tempSolopreneurs[id];
      
      if (!tempSolopreneur) {
        return NextResponse.json(
          { error: '솔로프리너를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(tempSolopreneur);
    }
    
    // 실제 데이터베이스에서 솔로프리너 조회
    const { data: solopreneur, error: solopreneurError } = await supabase
      .from('solopreneurs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (solopreneurError || !solopreneur) {
      console.error('솔로프리너 조회 오류:', solopreneurError);
      
      // 임시 데이터에서 해당 ID의 솔로프리너 찾기
      const tempSolopreneur = tempSolopreneurs[id];
      
      if (!tempSolopreneur) {
        return NextResponse.json(
          { error: '솔로프리너를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(tempSolopreneur);
    }
    
    // 링크 조회
    const { data: linksData, error: linksError } = await supabase
      .from('solopreneur_links')
      .select('*')
      .eq('solopreneurId', id);
    
    // 미리보기 이미지 조회
    const { data: previewsData, error: previewsError } = await supabase
      .from('solopreneur_previews')
      .select('*')
      .eq('solopreneur_id', id);
    
    // 링크 데이터 구성
    const links: any = {};
    const previews: any = {};
    
    if (!linksError && linksData) {
      linksData.forEach((link) => {
        links[link.platform] = link.url;
      });
    }
    
    if (!previewsError && previewsData) {
      previewsData.forEach((preview) => {
        if (!previews[preview.platform]) {
          previews[preview.platform] = preview.image_url;
        }
      });
    }
    
    // 링크 객체에 미리보기 추가
    links.previews = previews;
    
    // 임시 미리보기 이미지 추가 (데이터가 없는 경우)
    if (Object.keys(previews).length === 0) {
      links.previews = {
        youtube: links.youtube ? `https://picsum.photos/800/450?random=${id}1` : undefined,
        twitter: links.twitter ? `https://picsum.photos/600/300?random=${id}2` : undefined,
        linkedin: links.linkedin ? `https://picsum.photos/700/400?random=${id}3` : undefined,
        website: links.website ? `https://picsum.photos/1200/630?random=${id}4` : undefined
      };
    }
    
    // 최종 데이터 구성
    const finalData = {
      ...solopreneur,
      links,
      keywords: [], // 키워드 기능은 추후 구현
    };
    
    console.log('솔로프리너 데이터 반환:', JSON.stringify(finalData, null, 2));
    
    return NextResponse.json(finalData);
  } catch (error) {
    console.error('솔로프리너 상세 API 오류:', error);
    
    // 임시 데이터에서 해당 ID의 솔로프리너 찾기
    const tempSolopreneur = tempSolopreneurs[params.id];
    
    if (!tempSolopreneur) {
      return NextResponse.json(
        { error: '솔로프리너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tempSolopreneur);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`PUT /api/solopreneurs/${params.id} 요청 받음`);
  
  // 환경 변수가 설정되지 않은 경우 임시 응답 반환
  if (!isSupabaseConfigured) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 임시 응답을 반환합니다.');
    
    try {
      const body = await request.json();
      const { name, region, image, description, gender, links = {}, keywords = [] } = body;
      
      // 필수 필드 검증
      if (!name || !region || !description || !gender) {
        return NextResponse.json(
          { error: '필수 필드가 누락되었습니다.' },
          { status: 400 }
        );
      }
      
      // 임시 응답 데이터 생성
      const mockSolopreneur = {
        id: parseInt(params.id),
        name,
        region,
        image: image || `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 10) + 1}.jpg`,
        description,
        gender,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json({
        ...mockSolopreneur,
        links,
        keywords
      });
    } catch (error) {
      console.error('임시 응답 생성 중 오류:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
  
  try {
    const id = params.id;
    const body = await request.json();
    const { name, region, image, description, gender, links = {}, keywords = [] } = body;
    
    // 필수 필드 검증
    if (!name || !region || !description || !gender) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // Supabase 연결 테스트
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.log('Supabase 연결 실패, 임시 응답 반환:', connectionTest.error);
      
      // 임시 응답 데이터 생성
      const mockSolopreneur = {
        id: parseInt(id),
        name,
        region,
        image: image || `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${Math.floor(Math.random() * 10) + 1}.jpg`,
        description,
        gender,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json({
        ...mockSolopreneur,
        links,
        keywords
      });
    }
    
    // 솔로프리너 업데이트
    const { data: solopreneur, error: solopreneurError } = await supabase
      .from('solopreneurs')
      .update({
        name,
        region,
        image: image || undefined, // image가 없으면 업데이트하지 않음
        description,
        gender,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (solopreneurError) {
      console.error('솔로프리너 업데이트 오류:', solopreneurError);
      return NextResponse.json(
        { error: '솔로프리너 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 링크 업데이트 (기존 링크 삭제 후 새로 추가)
    if (Object.keys(links).length > 0) {
      // 기존 링크 삭제
      const { error: deleteLinksError } = await supabase
        .from('solopreneur_links')
        .delete()
        .eq('solopreneurId', id);
      
      if (deleteLinksError) {
        console.error('링크 삭제 오류:', deleteLinksError);
      }
      
      // 링크 플랫폼 목록
      const platforms = ['youtube', 'twitter', 'linkedin', 'instagram', 'website'];
      
      // 새 링크 추가
      const linkInserts: { solopreneurId: string; platform: string; url: string }[] = [];
      
      for (const platform of platforms) {
        if (links[platform]) {
          linkInserts.push({
            solopreneurId: id,
            platform,
            url: links[platform],
          });
        }
      }
      
      if (linkInserts.length > 0) {
        const { error: insertLinksError } = await supabase
          .from('solopreneur_links')
          .insert(linkInserts);
        
        if (insertLinksError) {
          console.error('링크 추가 오류:', insertLinksError);
        }
      }
    }
    
    // 미리보기 이미지 업데이트 (기존 이미지 삭제 후 새로 추가)
    if (links.previews && Object.keys(links.previews).length > 0) {
      // 기존 미리보기 이미지 삭제
      const { error: deletePreviewsError } = await supabase
        .from('solopreneur_previews')
        .delete()
        .eq('solopreneurId', id);
      
      if (deletePreviewsError) {
        console.error('미리보기 이미지 삭제 오류:', deletePreviewsError);
      }
      
      // 링크 플랫폼 목록
      const platforms = ['youtube', 'twitter', 'linkedin', 'instagram', 'website'];
      
      // 새 미리보기 이미지 추가
      const previewInserts: { solopreneurId: string; platform: string; imageUrl: string }[] = [];
      
      for (const platform of platforms) {
        if (links.previews[platform]) {
          previewInserts.push({
            solopreneurId: id,
            platform,
            imageUrl: links.previews[platform],
          });
        }
      }
      
      if (previewInserts.length > 0) {
        const { error: insertPreviewsError } = await supabase
          .from('solopreneur_previews')
          .insert(previewInserts);
        
        if (insertPreviewsError) {
          console.error('미리보기 이미지 추가 오류:', insertPreviewsError);
        }
      }
    }
    
    return NextResponse.json({
      ...solopreneur,
      links,
      keywords,
    });
  } catch (error) {
    console.error('솔로프리너 업데이트 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`DELETE /api/solopreneurs/${params.id} 요청 받음`);
  
  // 환경 변수가 설정되지 않은 경우 임시 응답 반환
  if (!isSupabaseConfigured) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 임시 응답을 반환합니다.');
    return NextResponse.json({ 
      message: '솔로프리너가 삭제되었습니다 (임시 응답)',
      id: params.id
    });
  }
  
  try {
    const id = params.id;
    
    // Supabase 연결 테스트
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.log('Supabase 연결 실패, 임시 응답 반환:', connectionTest.error);
      return NextResponse.json({ 
        success: true,
        message: '솔로프리너가 성공적으로 삭제되었습니다. (임시 응답)'
      });
    }
    
    // 솔로프리너 삭제 (외래 키 제약 조건으로 인해 관련 데이터는 자동으로 삭제됨)
    const { error: deleteError } = await supabase
      .from('solopreneurs')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('솔로프리너 삭제 오류:', deleteError);
      return NextResponse.json(
        { error: '솔로프리너 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '솔로프리너가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('솔로프리너 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}