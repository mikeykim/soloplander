import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}

export const metadata = {
  title: 'SolopLander - Global Solopreneurs Community',
  description: 'Discover remarkable solopreneurs from America, Europe, and Asia who are changing the world one project at a time.',
} 