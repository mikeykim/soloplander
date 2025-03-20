import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  console.log('GET /api/admin/stats 요청 받음');
  
  try {
    // 전체 솔로프리너 수 가져오기
    const { data: solopreneursData, error: solopreneursError } = await supabase
      .from('solopreneurs')
      .select('id, region, gender');
    
    if (solopreneursError) {
      console.error('솔로프리너 조회 오류:', solopreneursError);
      return NextResponse.json({ error: '솔로프리너 통계 조회 실패' }, { status: 500 });
    }
    
    // 지역별 카운트
    const regionCounts = {
      USA: 0,
      Europe: 0,
      Asia: 0,
      Other: 0
    };
    
    // 성별 카운트
    const genderCounts = {
      남성: 0,
      여성: 0,
      기타: 0
    };
    
    // 지역별 및 성별 솔로프리너 수 계산
    solopreneursData.forEach(solopreneur => {
      // 지역별 카운트
      if (solopreneur.region === 'USA') {
        regionCounts.USA += 1;
      } else if (solopreneur.region === 'Europe') {
        regionCounts.Europe += 1;
      } else if (solopreneur.region === 'Asia') {
        regionCounts.Asia += 1;
      } else {
        regionCounts.Other += 1;
      }
      
      // 성별 카운트
      if (solopreneur.gender === '남성') {
        genderCounts.남성 += 1;
      } else if (solopreneur.gender === '여성') {
        genderCounts.여성 += 1;
      } else {
        genderCounts.기타 += 1;
      }
    });
    
    // 키워드 카운트 가져오기
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('solopreneur_keywords')
      .select('keyword');
    
    if (keywordsError) {
      console.error('키워드 조회 오류:', keywordsError);
      return NextResponse.json(
        { 
          totalSolopreneurs: solopreneursData.length,
          regionCounts,
          genderCounts,
          error: '키워드 통계 조회 실패'
        }, 
        { status: 200 }
      );
    }
    
    // 링크 플랫폼 통계 가져오기
    const { data: linksData, error: linksError } = await supabase
      .from('solopreneur_links')
      .select('platform');
    
    // 플랫폼별 카운트
    const platformCounts: Record<string, number> = {};
    
    if (!linksError && linksData) {
      linksData.forEach(link => {
        const platform = link.platform;
        if (platformCounts[platform]) {
          platformCounts[platform] += 1;
        } else {
          platformCounts[platform] = 1;
        }
      });
    }
    
    // 카테고리(키워드)별 카운트
    const keywordCounts: Record<string, number> = {};
    
    keywordsData.forEach(item => {
      const keyword = item.keyword;
      if (keywordCounts[keyword]) {
        keywordCounts[keyword] += 1;
      } else {
        keywordCounts[keyword] = 1;
      }
    });
    
    // 가장 많이 사용된 키워드 상위 10개 추출
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((result, [keyword, count]) => {
        result[keyword] = count;
        return result;
      }, {} as Record<string, number>);
    
    // 최종 통계 데이터 반환
    return NextResponse.json(
      {
        totalSolopreneurs: solopreneursData.length,
        regionCounts,
        genderCounts,
        platformCounts,
        keywordCounts: topKeywords
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('통계 조회 중 오류:', error);
    return NextResponse.json({ error: '통계 데이터 조회 실패' }, { status: 500 });
  }
} 