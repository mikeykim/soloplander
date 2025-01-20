import styles from './page.module.css'
import WorldMap from '@/components/WorldMap'
import HeroSection from '@/components/HeroSection'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WorldMap />
      <NewsletterSignup />
    </main>
  )
} 