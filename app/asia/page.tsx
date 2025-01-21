import type { Metadata } from 'next'
import { solopreneursData } from '@/data/solopreneurs'
import SolopreneurCard from '@/components/SolopreneurCard'
import styles from '../page.module.css'

export const metadata: Metadata = {
  title: 'Asian Solopreneurs | SolopLander',
  description: 'Discover inspiring stories of successful Asian solopreneurs. Learn from their experiences and journeys.',
  openGraph: {
    title: 'Asian Solopreneurs | SolopLander',
    description: 'Discover inspiring stories of successful Asian solopreneurs.',
    url: 'https://soloplander.com/asia',
    siteName: 'SolopLander',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Asian Solopreneurs on SolopLander',
      },
    ],
    locale: 'en_US',
    type: 'website',
  }
}

export default function AsiaPage() {
  const asianSolopreneurs = solopreneursData.filter(
    solopreneur => solopreneur.region === 'Asia'
  )

  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        {asianSolopreneurs.map((solopreneur, index) => (
          <SolopreneurCard 
            key={solopreneur.name} 
            solopreneur={solopreneur}
            isFirst={index === 0}
          />
        ))}
      </div>
    </main>
  )
} 