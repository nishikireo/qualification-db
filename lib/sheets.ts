import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!clientEmail || !privateKey) {
    throw new Error("Google認証情報が未設定です")
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  })
}

export async function getSheetValues(range: string) {
  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error("スプレッドシートIDが未設定です")
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  })

  return res.data.values ?? []
}