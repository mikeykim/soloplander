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
  { id: 'ai', label: '🤖 AI', emoji: '🤖' },
  { id: 'business', label: '💼 Business', emoji: '💼' },
  { id: 'tech', label: '💻 Tech', emoji: '💻' },
  { id: 'marketing', label: '📊 Marketing', emoji: '📊' },
  { id: 'content', label: '🎬 Content', emoji: '🎬' },
  { id: 'finance', label: '💰 Finance', emoji: '💰' },
  { id: 'data', label: '📈 Data', emoji: '📈' },
  { id: 'design', label: '🎨 Design', emoji: '🎨' },
  { id: 'development', label: '👨‍💻 Development', emoji: '👨‍💻' },
  { id: 'education', label: '🎓 Education', emoji: '🎓' },
]

// 키워드 ID와 라벨 매핑 함수
const getKeywordLabel = (id: string): string => {
  const keyword = keywords.find(k => k.id === id);
  return keyword ? keyword.label : id;
}

// 키워드 라벨에서 ID 추출 함수 (이모지 제거 포함)
const getKeywordIdFromLabel = (label: string): string | null => {
  const cleanedLabel = label.split(' ').pop() || '';
  const keyword = keywords.find(k => 
    k.label.toLowerCase().includes(cleanedLabel.toLowerCase()) || 
    cleanedLabel.toLowerCase().includes(k.id)
  );
  return keyword ? keyword.id : null;
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
  const [keywordsMap, setKeywordsMap] = useState<Record<string, string[]>>({})
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

        // 키워드 맵 구성
        const newKeywordsMap: Record<string, string[]> = {};
        
        // 모든 지역의 데이터를 순회하며 키워드 맵 구성
        [...usaData, ...europeData, ...asiaData].forEach(solopreneur => {
          if (solopreneur.name && solopreneur.keywords) {
            newKeywordsMap[solopreneur.name] = solopreneur.keywords;
          }
        });
        
        setKeywordsMap(newKeywordsMap);
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
    console.log(`토글 키워드: ${keywordId} (${getKeywordLabel(keywordId)})`);
    setSelectedKeywords(prev => {
      const newKeywords = prev.includes(keywordId) 
        ? prev.filter(k => k !== keywordId) 
        : [...prev, keywordId];
      console.log('선택된 키워드:', newKeywords.map(k => `${k} (${getKeywordLabel(k)})`));
      return newKeywords;
    });
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
        // API에서 가져온 키워드 사용 (혹은 keywordsMap에서 가져온 키워드)
        const personKeywords = s.keywords || keywordsMap[s.name] || [];
        
        // 디버깅용 로그
        console.log('Person:', s.name);
        console.log('Keywords DB:', personKeywords);
        console.log('Selected Keywords:', selectedKeywords.map(k => `${k} (${getKeywordLabel(k)})`));
        
        // 키워드 매칭 확인
        const matches = selectedKeywords.some(selectedKey => {
          // 선택된 키워드 ID (예: 'business')
          const selectedKeyLower = selectedKey.toLowerCase();
          
          // 각 키워드에 대해 확인
          const found = personKeywords.some(personKeyword => {
            // DB에 저장된 키워드 (예: '💼 Business')에서 텍스트 부분만 추출
            const keywordText = personKeyword.split(' ').pop() || '';
            const normalizedKeyword = keywordText.toLowerCase();
            
            // 1. 정확한 일치 확인 (대소문자 무시)
            const exactMatch = normalizedKeyword === selectedKeyLower;
            
            // 2. 부분 문자열 포함 확인
            const partialMatch = normalizedKeyword.includes(selectedKeyLower) || 
                               selectedKeyLower.includes(normalizedKeyword);
            
            // 3. 매핑 함수를 통한 ID 확인
            const mappedId = getKeywordIdFromLabel(personKeyword);
            const idMatch = mappedId === selectedKey;
            
            // 결과 로깅
            console.log(`비교 [${s.name}]: DB='${personKeyword}' vs 선택='${selectedKey}'`);
            console.log(`  - 정규화: '${normalizedKeyword}' vs '${selectedKeyLower}'`);
            console.log(`  - 결과: 정확=${exactMatch}, 부분=${partialMatch}, ID=${idMatch}`);
            
            return exactMatch || partialMatch || idMatch;
          });
          
          return found;
        });
        
        console.log(`${s.name}: 매칭 결과 = ${matches ? '일치' : '불일치'}`);
        return matches;
      });
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
  }, [selectedRegion, searchTerm, selectedKeywords, solopreneursData, keywordsMap])

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