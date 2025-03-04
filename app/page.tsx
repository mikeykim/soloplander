import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
    <main>
      <HeroSection />
      <WorldMap />
      <NewsletterSignup />
    </main>
  );
} 