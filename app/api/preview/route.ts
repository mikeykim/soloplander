import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 })
  }

  try {
    // 유효한 URL인지 확인
    let validUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validUrl = 'https://' + url;
    }
    
    try {
      const response = await fetch(validUrl, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        redirect: 'follow',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Flutter 웹앱인지 확인
      const isFlutterApp = html.includes('flutter.js') || html.includes('_flutter');
      // LinkedIn 프로필인지 확인
      const isLinkedIn = validUrl.includes('linkedin.com');
      // Simple.ink 웹사이트인지 확인
      const isSimpleInk = validUrl.includes('simple.ink');
      
      if (isFlutterApp || isLinkedIn || isSimpleInk) {
        // 특정 사이트는 이미지로 대체
        return new NextResponse(
          `<html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                .website-info {
                  text-align: center;
                  padding: 1rem;
                }
                .website-title {
                  font-size: 1.2rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                  color: #333;
                }
                .website-url {
                  font-size: 0.9rem;
                  color: #666;
                  margin-bottom: 1rem;
                }
                .visit-button {
                  display: inline-block;
                  padding: 0.5rem 1rem;
                  background: #007bff;
                  color: white;
                  border-radius: 4px;
                  text-decoration: none;
                  font-weight: 500;
                }
              </style>
            </head>
            <body>
              <div class="website-info">
                <div class="website-title">Website Preview</div>
                <div class="website-url">${validUrl}</div>
                <a href="${validUrl}" target="_blank" class="visit-button">Visit Website</a>
              </div>
            </body>
          </html>`,
          {
            headers: {
              'Content-Type': 'text/html',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      // viewport 메타 태그와 기본 스타일 추가
      const modifiedHtml = html.replace(
        /<head>/i,
        `<head>
          <base href="${validUrl}" />
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
            /* 불필요한 요소 숨김 */
            #veluga-plugin-container,
            .cookie-banner,
            .gdpr-banner,
            .consent-banner,
            .popup-overlay,
            .modal-backdrop {
              display: none !important;
            }
          </style>
          <script>
            // 오류 방지
            window.addEventListener('error', function(e) {
              e.preventDefault();
              return true;
            });
            
            // iframe 리사이징
            window.addEventListener('message', function(e) {
              if (e.data.type === 'resize-iframe') {
                const height = document.documentElement.scrollHeight;
                window.parent.postMessage({ type: 'iframe-height', height }, '*');
              }
            });
            
            // 로드 완료 시 부모에게 알림
            window.addEventListener('load', function() {
              window.parent.postMessage({ type: 'iframe-loaded' }, '*');
            });
          </script>`
      );
      
      return new NextResponse(modifiedHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': `
            default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
            style-src * 'self' 'unsafe-inline' https: http:;
            style-src-elem * 'self' 'unsafe-inline' https: http:;
            font-src * data: https: http:;
            img-src * data: blob: https: http:;
            script-src * 'self' 'unsafe-inline' 'unsafe-eval';
            frame-ancestors *;
          `.replace(/\s+/g, ' ').trim(),
          'Permissions-Policy': 'interest-cohort=()'
        }
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      // 웹사이트 접근 실패 시 대체 화면 표시
      return new NextResponse(
        `<html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              }
              .error-container {
                text-align: center;
                padding: 2rem;
              }
              .error-title {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: #333;
              }
              .error-message {
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 1rem;
              }
              .website-url {
                font-size: 0.9rem;
                color: #666;
                margin-bottom: 1rem;
                word-break: break-all;
              }
              .visit-button {
                display: inline-block;
                padding: 0.5rem 1rem;
                background: #007bff;
                color: white;
                border-radius: 4px;
                text-decoration: none;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="error-container">
              <div class="error-title">Website Preview Unavailable</div>
              <div class="error-message">Could not load preview for this website</div>
              <div class="website-url">${validUrl}</div>
              <a href="${validUrl}" target="_blank" class="visit-button">Visit Website</a>
            </div>
          </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  } catch (error) {
    console.error('Preview API error:', error);
    return new NextResponse('Failed to generate preview', { status: 500 });
  }
} 