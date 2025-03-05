'use client'

import Image from 'next/image'
import styles from './WorldMap.module.css'
import { useState, useMemo } from 'react'
import { getSolopreneursByRegion } from '@/utils/solopreneurs'
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

    let solopreneurs = getSolopreneursByRegion(regionMap[selectedRegion] as RegionType)

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

    return solopreneurs
  }, [selectedRegion, searchTerm, selectedKeywords])

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
            {filteredSolopreneurs.length > 0 ? (
              <div className={styles.solopreneursGrid}>
                {filteredSolopreneurs.map((solopreneur, index) => (
                  <SolopreneurCard
                    key={solopreneur.name}
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