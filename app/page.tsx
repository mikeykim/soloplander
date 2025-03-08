import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import WorldMap from '@/components/WorldMap';
import NewsletterSignup from '@/components/NewsletterSignup';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'SolopLander - The Ultimate Landing Page Builder for Solopreneurs',
  description: 'Create stunning landing pages in minutes without coding. Perfect for solopreneurs and small businesses.',
};

export default function Home() {
  return (
    <main className={styles.main}>
      <HeroSection />
      <section className={styles.solopreneursSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Discover Solopreneurs</h2>
          <p className={styles.sectionDescription}>
            Explore our curated collection of successful solopreneurs from around the world.
            Get inspired by their stories and learn from their experiences.
          </p>
          <WorldMap />
        </div>
      </section>
      <NewsletterSignup />
    </main>
  );
} 