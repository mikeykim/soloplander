import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()
    
    // Flutter 웹앱인지 확인
    const isFlutterApp = html.includes('flutter.js') || html.includes('_flutter')
    // LinkedIn 프로필인지 확인
    const isLinkedIn = url.includes('linkedin.com')
    
    if (isFlutterApp || isLinkedIn) {
      return new NextResponse(
        `<html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: white;
              }
              .screenshot {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img 
              src="/images/previews/website/${url.split('//')[1].replace(/\//g, '-')}.png" 
              alt="Website Preview"
              class="screenshot"
            />
          </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // viewport 메타 태그와 기본 스타일 추가
    const modifiedHtml = html.replace(
      /<head>/i,
      `<head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: auto;
          }
          body {
            transform: scale(0.9);
            transform-origin: top left;
            background: white;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
        ${isFlutterApp ? `
          <script>
            // Flutter 웹앱 관련 에러 방지
            window.flutterConfiguration = {
              canvasKitBaseUrl: "/canvaskit/",
              canvasKitVariant: "full"
            };
            // 필요한 전역 객체 초기화
            window._flutter = {};
            window.FLUTTER_WEB_AUTO_DETECT = true;
            window.addEventListener('error', function(e) {
              if (e.message.includes('flutter') || e.message.includes('_flutter')) {
                e.preventDefault();
              }
            });
          </script>
        ` : ''}
        <script>
          window.addEventListener('message', function(e) {
            if (e.data.type === 'resize-iframe') {
              const height = document.documentElement.scrollHeight;
              window.parent.postMessage({ type: 'iframe-height', height }, '*');
            }
          });
        </script>`
    )
    
    return new NextResponse(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *"
      }
    })
  } catch (error) {
    return new NextResponse('Failed to fetch preview', { status: 500 })
  }
} 