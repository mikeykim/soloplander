import { solopreneursData } from '@/data/solopreneurs'
import type { RegionType, ISolopreneur } from '@/types'

export function getSolopreneursByRegion(region: RegionType): ISolopreneur[] {
  return solopreneursData.filter(solopreneur => solopreneur.region === region)
} 

// API URL 상수 정의 - 기본값을 3000으로 변경
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL || 'http://localhost:3000'

export async function fetchSolopreneursByRegion(region: RegionType): Promise<ISolopreneur[]> {
  console.log(`fetchSolopreneursByRegion 호출됨: 리전 = ${region}, API_URL = ${API_URL}`);
  
  try {
    // HTTP 또는 HTTPS 확인
    const baseUrl = API_URL.startsWith('http') ? API_URL : `http://${API_URL}`;
    const fullUrl = `${baseUrl}/api/solopreneurs`;
    
    console.log(`API 요청 URL: ${fullUrl}`);
    
    // 절대 URL 사용
    const response = await fetch(fullUrl, { 
      cache: 'no-store', // 캐시 비활성화
      next: { revalidate: 0 }, // 항상 최신 데이터 사용
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', // 추가 캐시 헤더
        'Expires': '0'        // 추가 캐시 헤더
      }
    });
    
    console.log(`API 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`API 응답 오류 (${response.status}): ${text.substring(0, 200)}...`);
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.solopreneurs) {
      console.error('API 응답에 solopreneurs 필드가 없습니다:', data);
      return [];
    }
    
    console.log(`API에서 솔로프리너 ${data.solopreneurs.length}명 가져옴`);
    
    // 리전별로 필터링
    const filtered = data.solopreneurs.filter((solopreneur: ISolopreneur) => {
      console.log(`솔로프리너 ${solopreneur.id || 'N/A'} ${solopreneur.name} 리전:`, solopreneur.region);
      return solopreneur.region === region;
    });
    
    // 생성일 기준으로 오래된 순 정렬 (최신 추가된 것이 밑으로)
    const sorted = [...filtered].sort((a: ISolopreneur, b: ISolopreneur) => {
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return 0;
    });
    
    console.log(`${region} 리전 솔로프리너 ${sorted.length}명 필터링됨 (생성일 기준 정렬)`);
    
    if (sorted.length === 0) {
      console.log(`${region} 리전에 솔로프리너가 없음, 첫 번째 몇 명의 데이터:`, 
        data.solopreneurs.slice(0, 3).map((s: any) => ({ id: s.id, name: s.name, region: s.region })));
    }
    
    return sorted;
  } catch (error) {
    console.error('솔로프리너 데이터 가져오기 오류:', error);
    // 오류 발생 시 하드코딩된 데이터 사용
    return getSolopreneursByRegion(region);
  }
} 