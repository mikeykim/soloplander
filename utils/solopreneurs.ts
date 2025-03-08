import { solopreneursData } from '@/data/solopreneurs'
import type { RegionType, ISolopreneur } from '@/types'

/**
 * 하드코딩된 데이터에서 특정 지역의 솔로프리너를 가져옵니다.
 * @param region 지역(USA, Europe, Asia)
 * @returns 지역별 솔로프리너 배열
 */
export function getSolopreneursByRegion(region: RegionType): ISolopreneur[] {
  return solopreneursData.filter(solopreneur => solopreneur.region === region)
} 

// API URL 상수 정의 - 상대 경로 사용
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL || ''

/**
 * API에서 특정 지역의 솔로프리너 데이터를 가져옵니다.
 * 실패 시 하드코딩된 데이터를 대체로 사용합니다.
 * @param region 지역(USA, Europe, Asia)
 * @returns 지역별 솔로프리너 배열
 */
export async function fetchSolopreneursByRegion(region: RegionType): Promise<ISolopreneur[]> {
  console.log(`fetchSolopreneursByRegion 호출됨: 리전 = ${region}, API_URL = ${API_URL}`);
  
  try {
    // 상대 URL 사용
    const url = API_URL 
      ? `${API_URL.startsWith('http') ? API_URL : `https://${API_URL}`}/api/solopreneurs` 
      : `/api/solopreneurs`;
    
    console.log(`API 요청 URL: ${url}`);
    
    const response = await fetch(url, { 
      cache: 'no-store', // 캐시 비활성화
      next: { revalidate: 0 }, // 항상 최신 데이터 사용
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    // API 응답 상태 로깅
    console.log(`API 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `API 응답 오류 (${response.status}): ${errorText.substring(0, 200)}...`;
      console.error(errorMessage);
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.solopreneurs || !Array.isArray(data.solopreneurs)) {
      console.error('API 응답에 올바른 solopreneurs 필드가 없습니다:', data);
      return getSolopreneursByRegion(region);
    }
    
    console.log(`API에서 솔로프리너 ${data.solopreneurs.length}명 가져옴`);
    
    // 리전별로 필터링
    const filtered = data.solopreneurs.filter((solopreneur: ISolopreneur) => {
      if (!solopreneur || !solopreneur.region) {
        console.warn('유효하지 않은 솔로프리너 데이터:', solopreneur);
        return false;
      }
      console.log(`솔로프리너 ${solopreneur.id || 'N/A'} ${solopreneur.name} 리전:`, solopreneur.region);
      return solopreneur.region === region;
    });
    
    // 유효성 검사를 통과한 데이터만 정렬
    const sorted = [...filtered]
      .filter(s => s && s.name && s.region)
      .sort((a: ISolopreneur, b: ISolopreneur) => {
        if (a.created_at && b.created_at) {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return 0;
      });
    
    console.log(`${region} 리전 솔로프리너 ${sorted.length}명 필터링됨 (생성일 기준 정렬)`);
    
    if (sorted.length === 0) {
      console.log(`${region} 리전에 솔로프리너가 없음, 첫 번째 몇 명의 데이터:`, 
        data.solopreneurs.slice(0, 3).map((s: any) => ({ id: s.id, name: s.name, region: s.region })));
      // 데이터가 없을 경우 하드코딩된 데이터 사용
      return getSolopreneursByRegion(region);
    }
    
    return sorted;
  } catch (error) {
    console.error('솔로프리너 데이터 가져오기 오류:', error);
    // 오류 발생 시 하드코딩된 데이터 사용
    return getSolopreneursByRegion(region);
  }
} 