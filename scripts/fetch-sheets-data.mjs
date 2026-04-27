import fs from "node:fs/promises"
import path from "node:path"
import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return []
  const [header, ...data] = rows
  return data.map((row) => {
    const obj = {}
    header.forEach((key, i) => {
      obj[key] = row[i] ?? ""
    })
    return obj
  })
}

async function main() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Google Sheets 用の環境変数が不足しています")
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  })

  const sheets = google.sheets({ version: "v4", auth })

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [
      "qualifications_master!A:ZZ",
      "qualification_metrics!A:ZZ",
      "qualification_past_links!A:ZZ",
      "qualification_quiz_items!A:ZZ",
      "difficulty_benchmark_master!A:ZZ",
      "qualification_comparisons!A:ZZ",
      "site_pages!A:ZZ",
      "settings!A:ZZ",
    ],
  })

  const ranges = response.data.valueRanges ?? []

  const getRangeValues = (targetRange) => {
    const matched = ranges.find((r) => r.range?.startsWith(targetRange))
    return matched?.values ?? []
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    qualifications_master: rowsToObjects(getRangeValues("qualifications_master")),
    qualification_metrics: rowsToObjects(getRangeValues("qualification_metrics")),
    qualification_past_links: rowsToObjects(getRangeValues("qualification_past_links")),
    qualification_quiz_items: rowsToObjects(getRangeValues("qualification_quiz_items")),
    difficulty_benchmark_master: rowsToObjects(getRangeValues("difficulty_benchmark_master")),
    qualification_comparisons: rowsToObjects(getRangeValues("qualification_comparisons")),
    site_pages: rowsToObjects(getRangeValues("site_pages")),
    settings: rowsToObjects(getRangeValues("settings")),
  }

  const outputDir = path.join(process.cwd(), "data")
  const outputPath = path.join(outputDir, "site-data.json")

  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), "utf-8")

  console.log(`Saved: ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})