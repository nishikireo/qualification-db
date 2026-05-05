import type { ComparisonQuestionPair, Qualification } from "@/types/qualification"

type Props = {
  items: ComparisonQuestionPair[]
  left: Qualification
  right: Qualification
}

function difficultyLabel(value: string) {
  const map: Record<string, string> = {
    easy: "基礎",
    standard: "標準",
    hard: "応用",
  }

  return map[value] ?? value
}

export default function ComparisonQuestionPairsSection({
  items,
  left,
  right,
}: Props) {
  if (items.length === 0) return null

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          試験問題では何が違うか
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          同じテーマでも、{left.name_short}と{right.name_short}
          では問われる場面・判断対象・必要な理解の深さが異なります。
        </p>
      </div>

      <div className="space-y-5">
        {items.map((item) => (
          <article
            key={item.pair_id}
            className="rounded-xl border border-neutral-200/70 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-neutral-500">
                  問題差分
                </div>
                <h3 className="mt-1 text-base font-semibold text-neutral-950">
                  {item.topic_label}
                </h3>
              </div>

              {item.source_note && (
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-500">
                  {item.source_note}
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200/70">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-neutral-500">
                    {left.name_short}
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] text-neutral-600 ring-1 ring-neutral-200/70">
                    {difficultyLabel(item.left_difficulty)}
                  </span>
                </div>

                <h4 className="mt-3 text-sm font-semibold text-neutral-950">
                  {item.left_question_title}
                </h4>

                <p className="mt-3 text-sm leading-7 text-neutral-700">
                  {item.left_question_text}
                </p>

                {item.left_answer_summary && (
                  <div className="mt-4 rounded-md bg-white p-3 text-xs leading-6 text-neutral-600 ring-1 ring-neutral-200/70">
                    {item.left_answer_summary}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200/70">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-neutral-500">
                    {right.name_short}
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] text-neutral-600 ring-1 ring-neutral-200/70">
                    {difficultyLabel(item.right_difficulty)}
                  </span>
                </div>

                <h4 className="mt-3 text-sm font-semibold text-neutral-950">
                  {item.right_question_title}
                </h4>

                <p className="mt-3 text-sm leading-7 text-neutral-700">
                  {item.right_question_text}
                </p>

                {item.right_answer_summary && (
                  <div className="mt-4 rounded-md bg-white p-3 text-xs leading-6 text-neutral-600 ring-1 ring-neutral-200/70">
                    {item.right_answer_summary}
                  </div>
                )}
              </div>
            </div>

            {item.difference_summary && (
              <div className="mt-4 rounded-lg border border-neutral-200/70 p-4">
                <div className="text-[11px] font-medium text-neutral-500">
                  違いの要点
                </div>
                <p className="mt-2 text-sm leading-7 text-neutral-700">
                  {item.difference_summary}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}