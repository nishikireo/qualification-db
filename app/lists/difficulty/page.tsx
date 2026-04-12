import Link from "next/link"
import { getQualifications } from "@/lib/data"

export const metadata = {
  title: "難易度が高い資格一覧 | 資格DB",
  description: "資格DBに掲載している資格を難易度スコア順に一覧化しています。",
}

export default async function DifficultyListPage() {
  const qualifications = await getQualifications()
  const items = [...qualifications]
    .filter((q) => q.difficulty_score !== null)
    .sort((a, b) => (b.difficulty_score ?? 0) - (a.difficulty_score ?? 0))

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">難易度が高い資格一覧</h1>
      <p className="mb-8">資格DBに掲載している資格を難易度スコア順に並べています。</p>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">順位</th>
            <th className="text-left py-2">資格名</th>
            <th className="text-left py-2">難易度</th>
            <th className="text-left py-2">合格率</th>
          </tr>
        </thead>
        <tbody>
          {items.map((q, i) => (
            <tr key={q.slug} className="border-b">
              <td className="py-2">{i + 1}</td>
              <td className="py-2">
                <Link className="underline" href={`/qualifications/${q.slug}`}>
                  {q.name_short}
                </Link>
              </td>
              <td className="py-2">{q.difficulty_score}</td>
              <td className="py-2">{q.pass_rate_latest ?? "-"}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}