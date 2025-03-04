// metadata와 viewport를 직접 정의
export const metadata = {
  title: 'Sanity Studio',
  description: 'Content management for SolopLander',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 