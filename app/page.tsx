import Link from "next/link"
import { getQualifications } from "@/lib/data"

export default async function HomePage() {
  const qualifications = await getQualifications()
  const featured = qualifications.slice(0, 6)

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">資格をもっと、オープンに。</h1>
      <p className="mt-4 text-lg text-gray-600">
        難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値をデータで比較する資格データベース。
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">注目の資格</h2>
        <div className="mt-6 space-y-4">
          {featured.map((q) => (
            <Link
              key={q.slug}
              href={`/qualifications/${q.slug}`}
              className="block rounded-2xl border p-5 hover:border-black"
            >
              <div className="text-sm text-gray-500">{q.category_primary}</div>
              <div className="mt-1 text-xl font-semibold">{q.name_short}</div>
              <div className="mt-2 text-sm text-gray-700">{q.summary_short}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}