import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // 특정 솔로프리너 조회
    if (id) {
      // 1. 솔로프리너 기본 정보 조회
      const { data: solopreneur, error: solopreneurError } = await supabase
        .from('solopreneurs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (solopreneurError) {
        return NextResponse.json(
          { error: '솔로프리너를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      // 2. 솔로프리너 링크 조회
      const { data: links, error: linksError } = await supabase
        .from('solopreneur_links')
        .select('*')
        .eq('solopreneur_id', id);
      
      // 3. 솔로프리너 미리보기 이미지 조회
      const { data: previews, error: previewsError } = await supabase
        .from('solopreneur_previews')
        .select('*')
        .eq('solopreneur_id', id);
      
      // 링크 데이터 변환
      const formattedLinks: Record<string, string> = {};
      const formattedPreviews: Record<string, string> = {};
      
      links?.forEach(link => {
        formattedLinks[link.platform] = link.url;
      });
      
      previews?.forEach(preview => {
        formattedPreviews[preview.platform] = preview.image_url;
      });
      
      // 최종 응답 데이터 구성
      const responseData = {
        ...solopreneur,
        links: {
          ...formattedLinks,
          previews: formattedPreviews
        }
      };
      
      return NextResponse.json(responseData);
    }
    
    // 모든 솔로프리너 조회
    const { data: solopreneurs, error } = await supabase
      .from('solopreneurs')
      .select('*');
    
    if (error) {
      return NextResponse.json(
        { error: '솔로프리너 목록을 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(solopreneurs);
  } catch (error) {
    console.error('솔로프리너 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, region, image, description, gender, links } = body;
    
    // 필수 필드 검증
    if (!name || !region || !description || !gender) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 1. 솔로프리너 기본 정보 삽입
    const { data: insertedSolopreneur, error: insertError } = await supabase
      .from('solopreneurs')
      .insert({
        name,
        region,
        image,
        description,
        gender,
      })
      .select('id')
      .single();
    
    if (insertError) {
      return NextResponse.json(
        { error: '솔로프리너 정보 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    const solopreneurId = insertedSolopreneur.id;
    
    // 2. 소셜 미디어 링크 삽입
    if (links) {
      const { previews, ...socialLinks } = links;
      
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (typeof url === 'string') {
          await supabase
            .from('solopreneur_links')
            .insert({
              solopreneur_id: solopreneurId,
              platform,
              url,
            });
        }
      }
      
      // 3. 미리보기 이미지 삽입
      if (previews) {
        for (const [platform, imageUrl] of Object.entries(previews)) {
          if (typeof imageUrl === 'string') {
            await supabase
              .from('solopreneur_previews')
              .insert({
                solopreneur_id: solopreneurId,
                platform,
                image_url: imageUrl,
              });
          }
        }
      }
    }
    
    return NextResponse.json({
      id: solopreneurId,
      message: '솔로프리너가 성공적으로 추가되었습니다.'
    }, { status: 201 });
  } catch (error) {
    console.error('솔로프리너 추가 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}