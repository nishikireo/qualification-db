import { notFound } from "next/navigation"
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd"
import { getComparedQualifications, getQualificationBySlug, getQualifications } from "@/lib/data"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const qualifications = await getQualifications()
  return qualifications.map((q) => ({ slug: q.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const q = await getQualificationBySlug(slug)
  if (!q) return {}

  return {
    title: `${q.name_short}の難易度・合格率・勉強時間・受験料 | 資格DB`,
    description: `${q.name_short}の難易度、合格率、勉強時間、受験料、独学しやすさ、転職価値をデータで整理しています。`,
  }
}

export default async function QualificationPage({ params }: Props) {
  const { slug } = await params
  const q = await getQualificationBySlug(slug)
  if (!q) notFound()

  const compared = await getComparedQualifications(slug)

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "ホーム", item: siteUrl },
          { name: "資格一覧", item: `${siteUrl}/lists/difficulty` },
          { name: q.name_short, item: `${siteUrl}/qualifications/${q.slug}` },
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        ホーム / 資格一覧 / {q.name_short}
      </nav>

      <h1 className="text-3xl font-bold mb-4">
        {q.name_short}の難易度・合格率・勉強時間・受験料まとめ
      </h1>

      <p className="mb-8 text-lg">{q.summary_short}</p>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl border p-4">
          <div className="text-sm">難易度</div>
          <div className="text-2xl font-bold">{q.difficulty_score ?? "-"} / 100</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm">合格率</div>
          <div className="text-2xl font-bold">{q.pass_rate_latest ?? "-"}%</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm">勉強時間</div>
          <div className="text-2xl font-bold">
            {q.study_hours_min ?? "-"}〜{q.study_hours_max ?? "-"}
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm">受験料</div>
          <div className="text-2xl font-bold">
            {q.exam_fee_tax_included?.toLocaleString() ?? "-"}円
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">基本情報</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">資格名</th>
              <td>{q.name_ja}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">カテゴリ</th>
              <td>{q.category_primary}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">種別</th>
              <td>{q.qualification_type}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">主催</th>
              <td>{q.issuing_body}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">試験回数</th>
              <td>{q.exam_frequency_text}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">受験資格</th>
              <td>{q.eligibility_text}</td>
            </tr>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">試験形式</th>
              <td>{q.exam_format_text}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">{q.name_short}の難易度</h2>
        <p>{q.difficulty_reason_text}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">向いている人</h2>
        <ul className="list-disc pl-6 space-y-2">
          {q.who_should_take.split("\n").filter(Boolean).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">向いていない人</h2>
        <ul className="list-disc pl-6 space-y-2">
          {q.who_should_not_take.split("\n").filter(Boolean).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">比較されやすい資格</h2>
        <ul className="list-disc pl-6 space-y-2">
          {compared.map((item) => (
            <li key={item.slug}>{item.name_short}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}