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
            zoom: 0.75;
            transform-origin: top left;
          }
        </style>`
    )
    
    return new NextResponse(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'X-Frame-Options': 'SAMEORIGIN'
      }
    })
  } catch (error) {
    return new NextResponse('Failed to fetch preview', { status: 500 })
  }
} 