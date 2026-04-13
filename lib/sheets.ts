import { cache } from "react"
import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

const getAuth = cache(() => {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google service account env vars")
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  })
})

const getSheetsClient = cache(() => {
  const auth = getAuth()
  return google.sheets({ version: "v4", auth })
})

export const getSheetValues = cache(async (range: string): Promise<string[][]> => {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID")
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  })

  return (res.data.values ?? []) as string[][]
})