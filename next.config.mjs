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
    ]
  }
};

export default nextConfig; 