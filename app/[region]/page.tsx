import { getSolopreneursByRegion } from '@/utils/solopreneurs'
import SolopreneurCard from '@/components/SolopreneurCard'
import RegionDescription from '@/components/RegionDescription'
import styles from './page.module.css'
import { notFound } from 'next/navigation'
import type { RegionType } from '@/types'

interface PageProps {
  params: {
    region: 'america' | 'europe' | 'asia'
  }
}

const regionMap = {
  america: 'USA',
  europe: 'Europe',
  asia: 'Asia'
} as const

const descriptions = {
  america: "In the land of endless possibilities, these remarkable individuals craft their American dreams - one vision, one passion, one success story at a time.",
  europe: "From historic cobblestone streets to modern digital spaces, European solopreneurs blend timeless craftsmanship with innovative spirit to redefine entrepreneurship with distinctive flair.",
  asia: "Bridging ancient wisdom with future vision, Asian solopreneurs are painting tomorrow's business landscape with bold strokes of innovation and cultural heritage."
} as const

export default function RegionPage({ params }: PageProps) {
  if (!regionMap[params.region as keyof typeof regionMap]) {
    notFound()
  }

  const region = regionMap[params.region] as RegionType
  const solopreneurs = getSolopreneursByRegion(region)
  
  return (
    <div className={styles.container}>
      <RegionDescription 
        title={params.region.charAt(0).toUpperCase() + params.region.slice(1)}
        description={descriptions[params.region as keyof typeof descriptions]}
      />
      <div className={styles.grid}>
        {solopreneurs.map((solopreneur, index) => (
          <SolopreneurCard 
            key={solopreneur.name} 
            solopreneur={solopreneur}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return [
    { region: 'america' },
    { region: 'europe' },
    { region: 'asia' }
  ]
} 