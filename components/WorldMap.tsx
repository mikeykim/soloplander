'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './WorldMap.module.css'
import { useState } from 'react'
import { getSolopreneursByRegion } from '@/utils/solopreneurs'
import SolopreneurCard from './SolopreneurCard'
import RegionDescription from './RegionDescription'
import type { RegionType } from '@/types'

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

export default function WorldMap() {
  const [selectedRegion, setSelectedRegion] = useState<'america' | 'europe' | 'asia' | null>(null)

  const handleRegionClick = (region: 'america' | 'europe' | 'asia') => {
    setSelectedRegion(prev => prev === region ? null : region)
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.mapWrapper} ${selectedRegion ? styles.mapWrapperSelected : ''}`}>
        {selectedRegion === 'america' && (
          <div className={`${styles.mapItem}`}>
            <div 
              className={styles.mapLink} 
              onClick={() => handleRegionClick('america')}
            >
              <Image
                src="/States.png"
                alt="America"
                width={300}
                height={200}
                className={styles.mapImage}
              />
              <div className={styles.mapTooltip}>America</div>
            </div>
          </div>
        )}
        {selectedRegion === 'europe' && (
          <div className={`${styles.mapItem}`}>
            <div 
              className={styles.mapLink}
              onClick={() => handleRegionClick('europe')}
            >
              <Image
                src="/images/europe-map.png"
                alt="Europe"
                width={300}
                height={200}
                className={styles.mapImage}
              />
              <div className={styles.mapTooltip}>Europe</div>
            </div>
          </div>
        )}
        {selectedRegion === 'asia' && (
          <div className={`${styles.mapItem}`}>
            <div 
              className={styles.mapLink}
              onClick={() => handleRegionClick('asia')}
            >
              <Image
                src="/images/asia-map.png"
                alt="Asia"
                width={300}
                height={200}
                className={styles.mapImage}
              />
              <div className={styles.mapTooltip}>Asia</div>
            </div>
          </div>
        )}

        {selectedRegion && (
          <div className={styles.selectedRegionInfo}>
            <RegionDescription
              title={selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
              description={descriptions[selectedRegion]}
            />
          </div>
        )}

        {!selectedRegion && (
          <>
            <div className={`${styles.mapItem} ${selectedRegion && selectedRegion !== 'america' ? styles.fadeOut : ''}`}>
              <div className={styles.mapLink} onClick={() => handleRegionClick('america')}>
                <Image
                  src="/States.png"
                  alt="America"
                  width={300}
                  height={200}
                  className={styles.mapImage}
                />
                <div className={styles.mapTooltip}>America</div>
              </div>
            </div>
            <div className={`${styles.mapItem} ${selectedRegion && selectedRegion !== 'europe' ? styles.fadeOut : ''}`}>
              <div className={styles.mapLink} onClick={() => handleRegionClick('europe')}>
                <Image
                  src="/images/europe-map.png"
                  alt="Europe"
                  width={300}
                  height={200}
                  className={styles.mapImage}
                />
                <div className={styles.mapTooltip}>Europe</div>
              </div>
            </div>
            <div className={`${styles.mapItem} ${selectedRegion && selectedRegion !== 'asia' ? styles.fadeOut : ''}`}>
              <div className={styles.mapLink} onClick={() => handleRegionClick('asia')}>
                <Image
                  src="/images/asia-map.png"
                  alt="Asia"
                  width={300}
                  height={200}
                  className={styles.mapImage}
                />
                <div className={styles.mapTooltip}>Asia</div>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedRegion && (
        <div className={styles.regionContent}>
          <div className={styles.solopreneursGrid}>
            {getSolopreneursByRegion(regionMap[selectedRegion] as RegionType).map((solopreneur, index) => (
              <SolopreneurCard
                key={solopreneur.name}
                solopreneur={solopreneur}
                isFirst={index === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 