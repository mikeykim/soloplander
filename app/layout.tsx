import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Inter } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SolopLander | Empowering Solopreneurs Worldwide',
  description: 'Discover inspiring stories of successful solopreneurs from around the world. Join our community of passionate creators building their own paths.',
  keywords: 'solopreneur, entrepreneur, digital creator, startup, business, success stories',
  openGraph: {
    title: 'SolopLander | Empowering Solopreneurs Worldwide',
    description: 'Discover inspiring stories of successful solopreneurs from around the world.',
    url: 'https://soloplander.com',
    siteName: 'SolopLander',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SolopLander Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolopLander | Empowering Solopreneurs Worldwide',
    description: 'Discover inspiring stories of successful solopreneurs from around the world.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="canonical" href="https://soloplander.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SolopLander",
              "description": "Discover inspiring stories of successful solopreneurs from around the world.",
              "url": "https://soloplander.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://soloplander.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Navbar />
        {children}
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  )
} 