import { NextRequest, NextResponse } from 'next/server';
import { supabase, serviceSupabase, testSupabaseConnection } from '@/utils/supabase';

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
      .eq('solopreneur_id', id);
    
    // 미리보기 이미지 조회
    const { data: previewsData, error: previewsError } = await supabase
      .from('solopreneur_previews')
      .select('*')
      .eq('solopreneur_id', id);
    
    // 키워드 조회
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('solopreneur_keywords')
      .select('*')
      .eq('solopreneur_id', id);
    
    console.log(`솔로프리너 ${id} 링크:`, linksData);
    console.log(`솔로프리너 ${id} 미리보기:`, previewsData);
    console.log(`솔로프리너 ${id} 키워드:`, keywordsData);
    
    // 링크 데이터 구성
    const links: any = {};
    const previews: any = {};
    const keywords: string[] = [];
    
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
    
    // 키워드 데이터 구성
    if (!keywordsError && keywordsData) {
      keywordsData.forEach((keywordObj) => {
        keywords.push(keywordObj.keyword);
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
      keywords,
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
    const { name, region, image, description, gender, links: linkUpdates, keywords = [] } = body;
    
    // keywords가 문자열 배열임을 보장
    const typedKeywords: string[] = Array.isArray(keywords) 
      ? keywords.map(k => typeof k === 'string' ? k : String(k))
      : [];
      
    console.log('솔로프리너 업데이트 요청 처리:', { name, description, gender, region, image });
    console.log('키워드 업데이트:', typedKeywords);
    
    // 필수 필드 검증
    if (!name || !region || !description || !gender) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 리전 데이터 유효성 검증
    if (!['USA', 'Europe', 'Asia'].includes(region)) {
      console.warn(`경고: 솔로프리너 ${id} 업데이트 요청에 유효하지 않은 리전 값이 있습니다:`, region);
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
        links: linkUpdates,
        keywords: typedKeywords,
      });
    }
    
    // 현재 저장된 데이터 확인 (디버깅 용도)
    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('solopreneurs')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error(`현재 솔로프리너 ${id} 데이터 조회 실패:`, fetchError);
      } else if (currentData) {
        console.log(`현재 솔로프리너 ${id} 데이터:`, JSON.stringify({
          id: currentData.id,
          name: currentData.name,
          region: currentData.region,
          gender: currentData.gender
        }, null, 2));
      }
    } catch (fetchErr) {
      console.error(`현재 데이터 조회 중 예외 발생:`, fetchErr);
    }
    
    // 솔로프리너 업데이트
    console.log(`솔로프리너 ${id} 데이터 업데이트 요청:`, JSON.stringify({
      name,
      region,
      image: image ? '(이미지 URL 존재)' : undefined,
      description: description ? '(설명 존재)' : undefined,
      gender,
      updated_at: new Date().toISOString()
    }, null, 2));
    
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
    
    console.log(`솔로프리너 ${id} 업데이트 성공:`, JSON.stringify({
      id: solopreneur.id,
      name: solopreneur.name,
      region: solopreneur.region,
      gender: solopreneur.gender
    }, null, 2));
    
    // 링크 업데이트 (기존 링크 삭제 후 새로 추가)
    if (Object.keys(linkUpdates).length > 0) {
      // 기존 링크 삭제
      const { error: deleteLinksError } = await supabase
        .from('solopreneur_links')
        .delete()
        .eq('solopreneur_id', id);
      
      if (deleteLinksError) {
        console.error('링크 삭제 오류:', deleteLinksError);
      }
      
      // 링크 플랫폼 목록
      const platforms = ['youtube', 'twitter', 'linkedin', 'instagram', 'website'];
      
      // 새 링크 추가
      const linkInserts: { solopreneur_id: string; platform: string; url: string }[] = [];
      
      for (const platform of platforms) {
        if (linkUpdates[platform]) {
          linkInserts.push({
            solopreneur_id: id,
            platform,
            url: linkUpdates[platform],
          });
        }
      }
      
      if (linkInserts.length > 0) {
        const { error: insertLinksError } = await supabase
          .from('solopreneur_links')
          .insert(linkInserts);
        
        if (insertLinksError) {
          console.error('링크 추가 오류:', insertLinksError);
        } else {
          console.log(`${linkInserts.length}개 링크 성공적으로 추가됨`);
        }
      }
    }
    
    // 미리보기 이미지 업데이트 (기존 이미지 삭제 후 새로 추가)
    if (linkUpdates.previews && Object.keys(linkUpdates.previews).length > 0) {
      // 기존 미리보기 이미지 삭제
      const { error: deletePreviewsError } = await supabase
        .from('solopreneur_previews')
        .delete()
        .eq('solopreneur_id', id);
      
      if (deletePreviewsError) {
        console.error('미리보기 이미지 삭제 오류:', deletePreviewsError);
      }
      
      // 링크 플랫폼 목록
      const platforms = ['youtube', 'twitter', 'linkedin', 'instagram', 'website'];
      
      // 새 미리보기 이미지 추가
      const previewInserts: { solopreneur_id: string; platform: string; image_url: string }[] = [];
      
      for (const platform of platforms) {
        if (linkUpdates.previews[platform]) {
          previewInserts.push({
            solopreneur_id: id,
            platform,
            image_url: linkUpdates.previews[platform],
          });
        }
      }
      
      console.log('추가할 미리보기 이미지:', JSON.stringify(previewInserts, null, 2));
      
      if (previewInserts.length > 0) {
        const { error: insertPreviewsError } = await supabase
          .from('solopreneur_previews')
          .insert(previewInserts);
        
        if (insertPreviewsError) {
          console.error('미리보기 이미지 추가 오류:', insertPreviewsError);
        } else {
          console.log(`${previewInserts.length}개 미리보기 이미지 성공적으로 추가됨`);
        }
      }
    }
    
    // 키워드 업데이트 (기존 키워드 삭제 후 새로 추가)
    try {
      console.log(`솔로프리너 ID ${id}의 키워드 업데이트 시작...`);
      console.log(`요청된 키워드: ${JSON.stringify(typedKeywords)}`);
      
      // 키워드 처리 로직
      let resultKeywords = typedKeywords || [];
      
      // 1. 숫자형 ID 확인
      let numericId: number;
      try {
        numericId = parseInt(id);
        if (isNaN(numericId)) {
          throw new Error('ID를 숫자로 변환할 수 없습니다');
        }
      } catch (err) {
        console.error('ID 변환 오류:', err);
        // 문자열 ID 사용
        numericId = id as unknown as number;
      }
      
      console.log(`변환된 솔로프리너 ID: ${numericId}, 타입: ${typeof numericId}`);
      
      // 2. SQL 함수를 통한 키워드 업데이트 시도
      try {
        console.log(`SQL 함수를 사용한 키워드 업데이트 시도...`);
        
        // 키워드 전처리 - 중복 제거 및 빈 문자열 필터링
        const processedKeywords = [...new Set(typedKeywords)]
          .map(k => k.trim())
          .filter(k => k.length > 0);
          
        if (processedKeywords.length > 0) {
          // 직접 SQL 쿼리 실행
          console.log(`직접 SQL 실행: 기존 키워드 삭제`);
          
          // 1. 기존 키워드 삭제
          const { error: deleteKeywordsError } = await serviceSupabase
            .from('solopreneur_keywords')
            .delete()
            .eq('solopreneur_id', numericId);
          
          if (deleteKeywordsError) {
            console.error('키워드 삭제 오류:', deleteKeywordsError.message);
          } else {
            console.log(`키워드 삭제 성공`);
            
            // 2. 새 키워드 추가
            console.log(`키워드 추가 시작 (${processedKeywords.length}개)`);
            
            let insertSuccessCount = 0;
            for (const keyword of processedKeywords) {
              const { error: insertError } = await serviceSupabase
                .from('solopreneur_keywords')
                .insert({
                  solopreneur_id: numericId,
                  keyword,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error(`키워드 '${keyword}' 추가 실패:`, insertError.message);
              } else {
                insertSuccessCount++;
                console.log(`키워드 '${keyword}' 추가 성공`);
              }
            }
            
            console.log(`${insertSuccessCount}/${processedKeywords.length} 키워드 추가 완료`);
            
            // 성공한 키워드 조회
            const { data: addedKeywords, error: fetchError } = await serviceSupabase
              .from('solopreneur_keywords')
              .select('keyword')
              .eq('solopreneur_id', numericId);
            
            if (!fetchError && addedKeywords && addedKeywords.length > 0) {
              resultKeywords = addedKeywords.map(k => k.keyword);
              console.log(`조회된 키워드 (${resultKeywords.length}개): ${JSON.stringify(resultKeywords)}`);
            } else {
              console.log(`키워드 조회 실패 또는 키워드 없음, UI용으로 원본 키워드 사용`);
              resultKeywords = processedKeywords;
            }
          }
        }
      } catch (sqlFuncError) {
        console.error('키워드 관리 중 예외 발생:', sqlFuncError);
      }
      
      // 3. 표준 방식으로 추가 시도 (fallback)
      if (resultKeywords.length === 0 || resultKeywords.length !== typedKeywords.filter(k => k.trim()).length) {
        console.log('직접 업데이트 방식 실패. 일반 클라이언트로 재시도...');
        
        // 기존 키워드 삭제
        const { error: stdDeleteError } = await supabase
          .from('solopreneur_keywords')
          .delete()
          .eq('solopreneur_id', numericId);
        
        if (stdDeleteError) {
          console.error('표준 클라이언트로 키워드 삭제 실패:', stdDeleteError.message);
        } else {
          const processedKeywords = [...new Set(typedKeywords)]
            .map(k => k.trim())
            .filter(k => k.length > 0);
          
          // 키워드 개별 추가
          let stdInsertSuccessCount = 0;
          for (const keyword of processedKeywords) {
            const { error: stdInsertError } = await supabase
              .from('solopreneur_keywords')
              .insert({
                solopreneur_id: numericId,
                keyword,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (!stdInsertError) {
              stdInsertSuccessCount++;
            }
          }
          
          console.log(`표준 클라이언트: ${stdInsertSuccessCount}/${processedKeywords.length} 키워드 추가 성공`);
          
          // 키워드 조회
          const { data: stdKeywords } = await supabase
            .from('solopreneur_keywords')
            .select('keyword')
            .eq('solopreneur_id', numericId);
          
          if (stdKeywords && stdKeywords.length > 0) {
            resultKeywords = stdKeywords.map(k => k.keyword);
          }
        }
      }
      
      // 4. 응답 데이터 반환 (성공 또는 실패 여부와 관계없이 UI 업데이트)
      return NextResponse.json({
        ...solopreneur,
        links: linkUpdates,
        keywords: resultKeywords,
      });
      
    } catch (error) {
      console.error('키워드 처리 중 예외 발생:', error);
      
      // 키워드 업데이트 실패 시에도 기본 데이터는 반환
      return NextResponse.json({
        ...solopreneur,
        links: linkUpdates,
        keywords: typedKeywords || [],
      });
    }
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