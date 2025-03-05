import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
  } catch (error) {
    console.error('솔로프리너 상세 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, region, image, description, gender, links } = body;
    
    // 솔로프리너 존재 여부 확인
    const { data: existingSolopreneur, error: checkError } = await supabase
      .from('solopreneurs')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return NextResponse.json(
        { error: '솔로프리너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 1. 솔로프리너 기본 정보 업데이트
    const updateData: any = {};
    if (name) updateData.name = name;
    if (region) updateData.region = region;
    if (image) updateData.image = image;
    if (description) updateData.description = description;
    if (gender) updateData.gender = gender;
    
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('solopreneurs')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) {
        return NextResponse.json(
          { error: '솔로프리너 정보 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }
    
    // 2. 링크 업데이트 (기존 링크 삭제 후 새로 추가)
    if (links) {
      const { previews, ...socialLinks } = links;
      
      // 기존 링크 삭제
      await supabase
        .from('solopreneur_links')
        .delete()
        .eq('solopreneur_id', id);
      
      // 새 링크 추가
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (typeof url === 'string') {
          await supabase
            .from('solopreneur_links')
            .insert({
              solopreneur_id: id,
              platform,
              url,
            });
        }
      }
      
      // 3. 미리보기 이미지 업데이트 (기존 미리보기 삭제 후 새로 추가)
      if (previews) {
        // 기존 미리보기 삭제
        await supabase
          .from('solopreneur_previews')
          .delete()
          .eq('solopreneur_id', id);
        
        // 새 미리보기 추가
        for (const [platform, imageUrl] of Object.entries(previews)) {
          if (typeof imageUrl === 'string') {
            await supabase
              .from('solopreneur_previews')
              .insert({
                solopreneur_id: id,
                platform,
                image_url: imageUrl,
              });
          }
        }
      }
    }
    
    return NextResponse.json({
      id,
      message: '솔로프리너 정보가 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('솔로프리너 업데이트 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // 솔로프리너 존재 여부 확인
    const { data: existingSolopreneur, error: checkError } = await supabase
      .from('solopreneurs')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return NextResponse.json(
        { error: '솔로프리너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 1. 미리보기 이미지 삭제
    await supabase
      .from('solopreneur_previews')
      .delete()
      .eq('solopreneur_id', id);
    
    // 2. 링크 삭제
    await supabase
      .from('solopreneur_links')
      .delete()
      .eq('solopreneur_id', id);
    
    // 3. 솔로프리너 삭제
    const { error: deleteError } = await supabase
      .from('solopreneurs')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      return NextResponse.json(
        { error: '솔로프리너 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: '솔로프리너가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('솔로프리너 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}