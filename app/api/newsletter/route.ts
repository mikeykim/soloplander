import { google } from 'googleapis'
import { NextResponse } from 'next/server'

// Google Sheets API 설정
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY || undefined
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const SHEET_NAME = 'Newsletter Subscribers' // 시트 이름

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString()

    // Google Sheets API 연결 확인
    if (!sheets || !SPREADSHEET_ID) {
      console.error('Google Sheets configuration error')
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      )
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, email]]
      }
    })

    return NextResponse.json({ message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

// OPTIONS 요청 처리
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  )
} 