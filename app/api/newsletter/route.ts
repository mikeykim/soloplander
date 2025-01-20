import { google } from 'googleapis'
import { NextResponse } from 'next/server'

// Google Sheets API 설정
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID
const SHEET_NAME = 'Newsletter Subscribers' // 시트 이름

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    // 현재 날짜/시간
    const timestamp = new Date().toISOString()

    // 스프레드시트에 데이터 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`, // A열: 타임스탬프, B열: 이메일
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, email]]
      }
    })

    return NextResponse.json({ message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
} 