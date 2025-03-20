import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import WorldMap from '@/components/WorldMap';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'SolopLander - The Ultimate Landing Page Builder for Solopreneurs',
  description: 'Create stunning landing pages in minutes without coding. Perfect for solopreneurs and small businesses.',
};

export default function Home() {
  return (
    <main className="flex flex-col w-full">
      <HeroSection />
      <section className="py-16 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Discover Solopreneurs</h2>
          <p className="text-lg text-center max-w-3xl mx-auto mb-8 text-gray-600 leading-relaxed">
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