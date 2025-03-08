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
      
      // 특정 사이트 체크 (LinkedIn, Flutter 앱 등)
      const isFlutterApp = html.includes('flutter.js') || html.includes('_flutter');
      const isLinkedIn = validUrl.includes('linkedin.com');
      const isSimpleInk = validUrl.includes('simple.ink');
      
      if (isFlutterApp || isLinkedIn || isSimpleInk) {
        // 특정 사이트는 간단한 미리보기로 대체
        return new NextResponse(
          `<html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  overflow: hidden;
                }
                .container {
                  text-align: center;
                  padding: 1rem;
                  max-width: 100%;
                }
                .title {
                  font-size: 1.1rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                  color: #333;
                }
                .url {
                  font-size: 0.8rem;
                  color: #666;
                  margin-bottom: 1rem;
                  word-break: break-all;
                }
                .icon {
                  width: 48px;
                  height: 48px;
                  margin-bottom: 1rem;
                  color: #007bff;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <div class="title">Website Preview</div>
                <div class="url">${validUrl}</div>
              </div>
            </body>
          </html>`,
          {
            headers: {
              'Content-Type': 'text/html',
              'Access-Control-Allow-Origin': '*',
              'X-Frame-Options': 'SAMEORIGIN'
            }
          }
        );
      }

      // 웹페이지 HTML 수정하여 iframe에서 보기 좋게 만들기
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
              transform: scale(0.95);
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
            .modal-backdrop,
            .cookie-policy,
            .privacy-policy,
            .ads-container,
            #onetrust-consent-sdk,
            .overlay,
            #consent-dialog,
            #cookie-notice,
            .cookie-dialog,
            .cookie-law-info-bar {
              display: none !important;
            }
          </style>
          <script>
            // 오류 방지
            window.addEventListener('error', function(e) {
              e.preventDefault();
              return true;
            });
            
            // 위험한 API 차단
            window.ethereum = undefined;
            window.solana = undefined;
            window.phantom = undefined;
          </script>`
      );
      
      return new NextResponse(modifiedHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': `
            default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
            script-src * 'self' 'unsafe-inline' 'unsafe-eval';
            style-src * 'self' 'unsafe-inline';
            img-src * data: blob:;
            connect-src *;
            font-src * data:;
            object-src 'none';
            media-src *;
            frame-src *;
            worker-src blob: data:;
            form-action 'self';
            base-uri 'self';
            frame-ancestors 'self';
          `.replace(/\s+/g, ' ').trim()
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
            </style>
          </head>
          <body>
            <div class="error-container">
              <div class="error-title">Website Preview Unavailable</div>
              <div class="error-message">Could not load preview for this website</div>
              <div class="website-url">${validUrl}</div>
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