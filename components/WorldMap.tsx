'use client'

import Image from 'next/image'
import styles from './WorldMap.module.css'
import { useState, useMemo, useEffect } from 'react'
import { getSolopreneursByRegion, fetchSolopreneursByRegion } from '@/utils/solopreneurs'
import SolopreneurCard from './SolopreneurCard'
import RegionDescription from './RegionDescription'
import type { RegionType, ISolopreneur } from '@/types'

const descriptions = {
  america: "In the land of endless possibilities, these remarkable individuals craft their American dreams - one vision, one passion, one success story at a time.",
  europe: "From historic cobblestone streets to modern digital spaces, European solopreneurs blend timeless craftsmanship with innovative spirit to redefine entrepreneurship with distinctive flair.",
  asia: "Bridging ancient wisdom with future vision, Asian solopreneurs are painting tomorrow's business landscape with bold strokes of innovation and cultural heritage."
}

const regionMap = {
  america: 'USA',
  europe: 'Europe',
  asia: 'Asia'
} as const

// 키워드 정의 (이모지와 함께)
const keywords = [
  { id: 'business', label: '💼 Business', emoji: '💼' },
  { id: 'tech', label: '💻 Tech', emoji: '💻' },
  { id: 'marketing', label: '📊 Marketing', emoji: '📊' },
  { id: 'content', label: '🎬 Content', emoji: '🎬' },
  { id: 'finance', label: '💰 Finance', emoji: '💰' },
  { id: 'data', label: '📈 Data', emoji: '📈' },
  { id: 'ai', label: '🤖 AI', emoji: '🤖' },
  { id: 'design', label: '🎨 Design', emoji: '🎨' },
  { id: 'development', label: '👨‍💻 Development', emoji: '👨‍💻' },
  { id: 'education', label: '🎓 Education', emoji: '🎓' },
]

// 솔로프리너와 키워드 매핑
const solopreneurKeywords: Record<string, string[]> = {
  "Alex Hormozi": ["business", "marketing", "content"],
  "Pat Walls": ["business", "content"],
  "Pieter Levels": ["tech", "development", "business"],
  "Marc Lou": ["tech", "development", "business"],
  "Ruri Ohama": ["content", "business"],
  "Ara Koh": ["design", "content", "business"],
  "Kei Fujikawa": ["tech", "development"],
  "Richard Lim": ["data", "ai", "education"],
  "Wes Mcdowell": ["marketing", "business"],
  "Charlie Chang": ["finance", "content"],
  "Noah Kagan": ["business", "marketing", "tech"],
  "Ben AI": ["ai", "tech", "content"],
  "Greg Isenberg": ["business", "marketing"],
  "Phoebe Yu": ["business", "content"],
  "Stefanovic": ["content", "education"],
  "Timo Nikolai": ["ai", "marketing", "tech"],
  "David Ondrej": ["ai", "tech", "development"]
}

export default function WorldMap() {
  const [selectedRegion, setSelectedRegion] = useState<'america' | 'europe' | 'asia' | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [solopreneursData, setSolopreneursData] = useState<Record<RegionType, ISolopreneur[]>>({
    'USA': [],
    'Europe': [],
    'Asia': []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 모든 지역의 솔로프리너 데이터 가져오기
  useEffect(() => {
    const fetchAllRegionsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 모든 지역의 데이터를 병렬로 가져오기
        const [usaData, europeData, asiaData] = await Promise.all([
          fetchSolopreneursByRegion('USA'),
          fetchSolopreneursByRegion('Europe'),
          fetchSolopreneursByRegion('Asia')
        ]);

        console.log('API 데이터 로드됨:', {
          USA: usaData.length,
          Europe: europeData.length,
          Asia: asiaData.length
        });

        // 모든 지역의 데이터를 상태에 저장
        setSolopreneursData({
          'USA': usaData,
          'Europe': europeData,
          'Asia': asiaData
        });
      } catch (err) {
        console.error('솔로프리너 데이터 가져오기 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        
        // 오류 발생 시 하드코딩된 데이터 사용
        setSolopreneursData({
          'USA': getSolopreneursByRegion('USA'),
          'Europe': getSolopreneursByRegion('Europe'),
          'Asia': getSolopreneursByRegion('Asia')
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRegionsData();
  }, []);

  const handleRegionClick = (region: 'america' | 'europe' | 'asia') => {
    setSelectedRegion(prev => prev === region ? null : region)
    // 지역이 변경되면 검색어와 선택된 키워드 초기화
    setSearchTerm('')
    setSelectedKeywords([])
  }

  const toggleKeyword = (keywordId: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keywordId) 
        ? prev.filter(k => k !== keywordId) 
        : [...prev, keywordId]
    )
  }

  // 필터링된 솔로프리너 목록
  const filteredSolopreneurs = useMemo(() => {
    if (!selectedRegion) return []

    // API에서 가져온 데이터 사용
    let solopreneurs = solopreneursData[regionMap[selectedRegion] as RegionType];

    // API 데이터가 없는 경우 하드코딩된 데이터 사용
    if (!solopreneurs || solopreneurs.length === 0) {
      solopreneurs = getSolopreneursByRegion(regionMap[selectedRegion] as RegionType);
    }

    // 검색어로 필터링
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      solopreneurs = solopreneurs.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.description.toLowerCase().includes(term)
      )
    }

    // 키워드로 필터링
    if (selectedKeywords.length > 0) {
      solopreneurs = solopreneurs.filter(s => {
        const personKeywords = solopreneurKeywords[s.name] || []
        return selectedKeywords.some(k => personKeywords.includes(k))
      })
    }

    // 솔로프리너를 생성일 기준으로 정렬 (오래된 순)
    // 이렇게 하면 최근에 추가된 솔로프리너가 리스트 하단에 표시됨
    return [...solopreneurs].sort((a, b) => {
      // created_at 필드가 있으면 그것을 기준으로 정렬
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      // created_at이 없으면 원래 순서 유지
      return 0;
    });
  }, [selectedRegion, searchTerm, selectedKeywords, solopreneursData])

  // 선택된 지역에 대한 맵 아이템 렌더링
  const renderSelectedRegionMap = () => {
    if (!selectedRegion) return null
    
    return (
      <div className={`${styles.mapItem}`}>
        <div 
          className={styles.mapLink} 
          onClick={() => handleRegionClick(selectedRegion)}
        >
          <Image
            src={`/images/maps/${selectedRegion === 'america' ? 'states' : selectedRegion}-map.png`}
            alt={selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
            width={300}
            height={200}
            priority={selectedRegion === 'america'}
            loading="eager"
            className={styles.mapImage}
          />
          <div className={styles.mapTooltip}>
            {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
          </div>
        </div>
      </div>
    )
  }

  // 모든 지역 맵 아이템 렌더링
  const renderAllRegionMaps = () => {
    return (
      <>
        {['america', 'europe', 'asia'].map((region) => (
          <div 
            key={region}
            className={`${styles.mapItem} ${selectedRegion && selectedRegion !== region ? styles.fadeOut : ''}`}
          >
            <div 
              className={styles.mapLink} 
              onClick={() => handleRegionClick(region as 'america' | 'europe' | 'asia')}
            >
              <Image
                src={`/images/maps/${region === 'america' ? 'states' : region}-map.png`}
                alt={region.charAt(0).toUpperCase() + region.slice(1)}
                width={300}
                height={200}
                priority={region === 'america'}
                loading="eager"
                className={styles.mapImage}
              />
              <div className={styles.mapTooltip}>
                {region.charAt(0).toUpperCase() + region.slice(1)}
              </div>
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.mapWrapper} ${selectedRegion ? styles.mapWrapperSelected : ''}`}>
        {selectedRegion ? renderSelectedRegionMap() : renderAllRegionMaps()}

        {selectedRegion && (
          <div className={styles.selectedRegionInfo}>
            <RegionDescription
              title={selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
              description={descriptions[selectedRegion]}
            />
          </div>
        )}
      </div>

      {/* 지도를 클릭했을 때만 이 부분을 표시 - Featured Solopreneurs 섹션 제거 */}
      {selectedRegion && (
        <>
          {/* 검색 및 필터 섹션 */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="✨ Discover inspiring solopreneurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            
            <div className={styles.keywordsContainer}>
              {keywords.map(keyword => (
                <button
                  key={keyword.id}
                  className={`${styles.keywordButton} ${selectedKeywords.includes(keyword.id) ? styles.keywordButtonSelected : ''}`}
                  onClick={() => toggleKeyword(keyword.id)}
                >
                  {keyword.emoji} {keyword.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.regionContent}>
            {isLoading ? (
              <div className={styles.loading}>Loading solopreneurs data...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : filteredSolopreneurs.length > 0 ? (
              <div className={styles.solopreneursGrid}>
                {filteredSolopreneurs.map((solopreneur, index) => (
                  <SolopreneurCard
                    key={`${solopreneur.id || ''}-${solopreneur.name}-${index}`}
                    solopreneur={solopreneur}
                    isFirst={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <p>No solopreneurs found matching your search criteria.</p>
                <button 
                  className={styles.resetButton}
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedKeywords([])
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
} 