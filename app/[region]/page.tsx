import { getSolopreneursByRegion, fetchSolopreneursByRegion } from '@/utils/solopreneurs'
import SolopreneurCard from '@/components/SolopreneurCard'
import RegionDescription from '@/components/RegionDescription'
import styles from './page.module.css'
import { notFound } from 'next/navigation'
import type { RegionType, ISolopreneur } from '@/types'

interface IPageProps {
  params: {
    region: 'america' | 'europe' | 'asia'
  }
}

/**
 * URL 경로 매개변수와 실제 지역 타입 간의 매핑
 */
const regionMap = {
  america: 'USA',
  europe: 'Europe',
  asia: 'Asia'
} as const

/**
 * 각 지역에 대한 설명 텍스트
 */
const descriptions = {
  america: "In the land of endless possibilities, these remarkable individuals craft their American dreams - one vision, one passion, one success story at a time.",
  europe: "From historic cobblestone streets to modern digital spaces, European solopreneurs blend timeless craftsmanship with innovative spirit to redefine entrepreneurship with distinctive flair.",
  asia: "Bridging ancient wisdom with future vision, Asian solopreneurs are painting tomorrow's business landscape with bold strokes of innovation and cultural heritage."
} as const

/**
 * 지역별 솔로프리너 페이지 컴포넌트
 */
export default async function RegionPage({ params }: IPageProps) {
  // 유효하지 않은 지역 경로 처리
  if (!regionMap[params.region as keyof typeof regionMap]) {
    notFound()
  }

  const region = regionMap[params.region] as RegionType
  
  // 환경 변수 체크와 로깅
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL || ''
  console.log('사용 중인 API URL:', apiUrl);
  console.log('현재 리전:', region);
  
  // API 데이터와 하드코딩된 데이터 처리
  let apiSolopreneurs: ISolopreneur[] = [];
  let hardcodedSolopreneurs: ISolopreneur[] = [];
  
  try {
    // API를 통해 데이터를 가져옵니다
    apiSolopreneurs = await fetchSolopreneursByRegion(region);
    console.log(`API에서 ${region} 솔로프리너 ${apiSolopreneurs.length}명 가져옴`);
  } catch (error) {
    console.error('API 솔로프리너 데이터 가져오기 오류:', error);
  }
  
  // 하드코딩된 데이터도 가져옵니다 (백업용)
  hardcodedSolopreneurs = getSolopreneursByRegion(region);
  console.log(`하드코딩된 ${region} 솔로프리너 ${hardcodedSolopreneurs.length}명 가져옴`);

  // 최종 사용할 데이터 결정 (API 데이터 우선)
  const finalSolopreneurs = apiSolopreneurs.length > 0 
    ? apiSolopreneurs 
    : hardcodedSolopreneurs;
  
  console.log(`최종적으로 ${region} 솔로프리너 ${finalSolopreneurs.length}명 표시 예정 (출처: ${apiSolopreneurs.length > 0 ? 'API' : '하드코딩'})`);
  
  // 데이터 유효성 검증
  const validSolopreneurs = finalSolopreneurs.filter(s => s && s.name && s.region);
  
  return (
    <div className={styles.container}>
      <RegionDescription 
        title={params.region.charAt(0).toUpperCase() + params.region.slice(1)}
        description={descriptions[params.region as keyof typeof descriptions]}
      />
      <div className={styles.grid}>
        {validSolopreneurs.map((solopreneur, index) => (
          <SolopreneurCard 
            key={`${solopreneur.id || ''}-${solopreneur.name}-${index}`} 
            solopreneur={solopreneur}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  )
}

// 캐싱 비활성화 (항상 최신 데이터 사용)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 정적 경로 매개변수 생성
 */
export function generateStaticParams() {
  return [
    { region: 'america' },
    { region: 'europe' },
    { region: 'asia' }
  ]
} 