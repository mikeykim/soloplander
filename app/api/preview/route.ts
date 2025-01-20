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
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return new NextResponse('Failed to fetch preview', { status: 500 })
  }
} 