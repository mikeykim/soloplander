/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads-ssl.webflow.com'
      },
      {
        protocol: 'https',
        hostname: 'd3e54v103j8qbb.cloudfront.net'
      }
    ],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  // 도메인 관련 설정 추가
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ]
  },
  // 헤더 설정 수정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src * 'unsafe-inline' 'unsafe-eval'",
              "script-src * 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https:",
              "media-src 'self' https:",
              "object-src 'self'",
              "base-uri 'self'"
            ].join('; ')
          }
        ],
      },
    ]
  }
};

export default nextConfig; 