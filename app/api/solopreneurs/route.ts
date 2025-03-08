import { NextRequest, NextResponse } from 'next/server';
import { supabase, testSupabaseConnection } from '@/utils/supabase';
import { eq } from 'drizzle-orm';
import { solopreneurs, solopreneurLinks, solopreneurPreviews } from '@/db/schema';

// 임시 데이터
const tempSolopreneurs = [
  {
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
  {
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
];

// 환경 변수 설정 여부 확인
const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  console.log('GET /api/solopreneurs 요청 받음');
  
  // 환경 변수가 설정되지 않은 경우 즉시 임시 데이터 반환
  if (!isSupabaseConfigured) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다. 임시 데이터를 사용합니다.');
    return NextResponse.json({ solopreneurs: tempSolopreneurs }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
  
  try {
    // Supabase 연결 테스트
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.log('Supabase 연결 실패, 임시 데이터 반환:', connectionTest.error);
      return NextResponse.json({ solopreneurs: tempSolopreneurs }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    console.log('Supabase 연결 성공, 실제 데이터 조회 시작');
    
    // 실제 데이터베이스에서 솔로프리너 조회
    const { data: solopreneursData, error: solopreneursError } = await supabase
      .from('solopreneurs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (solopreneursError) {
      console.error('솔로프리너 조회 오류:', solopreneursError);
      return NextResponse.json({ solopreneurs: tempSolopreneurs }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    console.log(`솔로프리너 ${solopreneursData.length}명 조회 성공`);
    
    // 각 솔로프리너의 링크와 미리보기 이미지 조회
    const solopreneursWithLinks = await Promise.all(
      solopreneursData.map(async (solopreneur) => {
        // 링크 조회
        const { data: linksData, error: linksError } = await supabase
          .from('solopreneur_links')
          .select('*')
          .eq('solopreneur_id', solopreneur.id);
        
        // 미리보기 이미지 조회
        const { data: previewsData, error: previewsError } = await supabase
          .from('solopreneur_previews')
          .select('*')
          .eq('solopreneur_id', solopreneur.id);
        
        // 키워드 조회
        const { data: keywordsData, error: keywordsError } = await supabase
          .from('solopreneur_keywords')
          .select('*')
          .eq('solopreneur_id', solopreneur.id);
        
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
            youtube: links.youtube ? `https://picsum.photos/800/450?random=${solopreneur.id}1` : undefined,
            twitter: links.twitter ? `https://picsum.photos/600/300?random=${solopreneur.id}2` : undefined,
            linkedin: links.linkedin ? `https://picsum.photos/700/400?random=${solopreneur.id}3` : undefined,
            website: links.website ? `https://picsum.photos/1200/630?random=${solopreneur.id}4` : undefined
          };
        }
        
        console.log(`솔로프리너 ${solopreneur.id} 미리보기:`, links.previews);
        
        // 최종 데이터 구성
        const finalSolopreneur = {
          ...solopreneur,
          links,
          keywords,
        };

        // 리전 데이터 로깅 (디버깅용)
        console.log(`솔로프리너 ${finalSolopreneur.id} - ${finalSolopreneur.name}의 리전:`, finalSolopreneur.region);
        
        // 리전이 없거나 유효하지 않은 경우 경고
        if (!finalSolopreneur.region || !['USA', 'Europe', 'Asia'].includes(finalSolopreneur.region)) {
          console.warn(`경고: 솔로프리너 ${finalSolopreneur.id} - ${finalSolopreneur.name}의 리전이 유효하지 않습니다:`, finalSolopreneur.region);
        }

        return finalSolopreneur;
      })
    );
    
    // 변환이 완료된 결과 반환
    console.log(`변환된 솔로프리너 총 ${solopreneursWithLinks.length}명`);
    
    // 리전별 통계 출력
    const regionCount = {
      USA: solopreneursWithLinks.filter(s => s.region === 'USA').length,
      Europe: solopreneursWithLinks.filter(s => s.region === 'Europe').length,
      Asia: solopreneursWithLinks.filter(s => s.region === 'Asia').length,
      Other: solopreneursWithLinks.filter(s => !['USA', 'Europe', 'Asia'].includes(s.region)).length
    };
    
    console.log('리전별 통계:', regionCount);
    
    // 데이터의 첫 몇 항목 샘플 출력 (디버깅용)
    if (solopreneursWithLinks.length > 0) {
      console.log('솔로프리너 데이터 샘플 (첫 3개):', 
        solopreneursWithLinks.slice(0, 3).map(s => ({
          id: s.id,
          name: s.name,
          region: s.region || 'undefined'
        }))
      );
    }
    
    return NextResponse.json({ solopreneurs: solopreneursWithLinks }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('솔로프리너 목록 조회 중 오류:', error);
    return NextResponse.json({ solopreneurs: tempSolopreneurs }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/solopreneurs 요청 받음');
  
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
      const mockId = Math.floor(Math.random() * 1000) + 3;
      const mockSolopreneur = {
        id: mockId,
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
      const mockId = Math.floor(Math.random() * 1000) + 3;
      const mockSolopreneur = {
        id: mockId,
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
    
    // 솔로프리너 생성
    const { data: solopreneur, error: solopreneurError } = await supabase
      .from('solopreneurs')
      .insert({
        name,
        region,
        image: image || null,
        description,
        gender,
      })
      .select()
      .single();
    
    if (solopreneurError) {
      console.error('솔로프리너 생성 오류:', solopreneurError);
      return NextResponse.json(
        { error: '솔로프리너 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 링크 및 미리보기 이미지 처리
    const linkPromises: any[] = [];
    const previewPromises: any[] = [];
    
    // 링크 플랫폼 목록
    const platforms = ['youtube', 'twitter', 'linkedin', 'instagram', 'website'];
    
    // 링크 추가
    for (const platform of platforms) {
      if (links[platform]) {
        linkPromises.push(
          supabase.from('solopreneur_links').insert({
            solopreneur_id: solopreneur.id,
            platform,
            url: links[platform],
          })
        );
      }
    }
    
    // 미리보기 이미지 추가
    if (links.previews) {
      for (const platform of platforms) {
        if (links.previews[platform]) {
          previewPromises.push(
            supabase.from('solopreneur_previews').insert({
              solopreneur_id: solopreneur.id,
              platform,
              image_url: links.previews[platform],
            })
          );
        }
      }
    }
    
    // 모든 프로미스 실행 및 결과 로깅
    const results = await Promise.all([...linkPromises, ...previewPromises]);
    console.log(`솔로프리너 ${solopreneur.id} 링크/미리보기 추가 결과:`, 
      results.map((r, i) => i < linkPromises.length ? 
        `링크 ${i+1}: ${r.error ? '실패' : '성공'}` : 
        `미리보기 ${i-linkPromises.length+1}: ${r.error ? '실패' : '성공'}`
      )
    );
    
    return NextResponse.json({
      ...solopreneur,
      links,
      keywords,
    });
  } catch (error) {
    console.error('솔로프리너 생성 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}