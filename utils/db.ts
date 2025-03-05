import { supabase } from './supabase';
import { ISolopreneur } from '@/types';

// 솔로프리너 관련 함수
export async function getAllSolopreneurs() {
  const { data, error } = await supabase
    .from('solopreneurs')
    .select('*');
  
  if (error) {
    console.error('솔로프리너 목록 조회 오류:', error);
    throw new Error('솔로프리너 목록을 가져오는 중 오류가 발생했습니다.');
  }
  
  return data;
}

export async function getSolopreneurById(id: string) {
  // 1. 솔로프리너 기본 정보 조회
  const { data: solopreneur, error: solopreneurError } = await supabase
    .from('solopreneurs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (solopreneurError) {
    console.error('솔로프리너 조회 오류:', solopreneurError);
    throw new Error('솔로프리너를 찾을 수 없습니다.');
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
  return {
    ...solopreneur,
    links: {
      ...formattedLinks,
      previews: formattedPreviews
    }
  };
}

export async function createSolopreneur(solopreneurData: Omit<ISolopreneur, 'id'>) {
  const { name, region, image, description, gender, links } = solopreneurData;
  
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
    console.error('솔로프리너 생성 오류:', insertError);
    throw new Error('솔로프리너 정보 저장 중 오류가 발생했습니다.');
  }
  
  const solopreneurId = insertedSolopreneur.id;
  
  // 2. 소셜 미디어 링크 삽입
  if (links) {
    const { previews, ...socialLinks } = links;
    
    for (const [platform, url] of Object.entries(socialLinks)) {
      if (typeof url === 'string') {
        const { error: linkError } = await supabase
          .from('solopreneur_links')
          .insert({
            solopreneur_id: solopreneurId,
            platform,
            url,
          });
        
        if (linkError) {
          console.error(`${platform} 링크 삽입 오류:`, linkError);
        }
      }
    }
    
    // 3. 미리보기 이미지 삽입
    if (previews) {
      for (const [platform, imageUrl] of Object.entries(previews)) {
        if (typeof imageUrl === 'string') {
          const { error: previewError } = await supabase
            .from('solopreneur_previews')
            .insert({
              solopreneur_id: solopreneurId,
              platform,
              image_url: imageUrl,
            });
          
          if (previewError) {
            console.error(`${platform} 미리보기 삽입 오류:`, previewError);
          }
        }
      }
    }
  }
  
  return solopreneurId;
}

export async function updateSolopreneur(id: string, solopreneurData: Partial<ISolopreneur>) {
  const { name, region, image, description, gender, links } = solopreneurData;
  
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
      console.error('솔로프리너 업데이트 오류:', updateError);
      throw new Error('솔로프리너 정보 업데이트 중 오류가 발생했습니다.');
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
  
  return id;
}

export async function deleteSolopreneur(id: string) {
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
    console.error('솔로프리너 삭제 오류:', deleteError);
    throw new Error('솔로프리너 삭제 중 오류가 발생했습니다.');
  }
  
  return true;
} 