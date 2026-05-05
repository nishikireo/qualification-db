import type { ComparisonLearningGap, Qualification } from "@/types/qualification"
import { formatHoursRange } from "@/lib/format"

type Props = {
  items: ComparisonLearningGap[]
  left: Qualification
  right: Qualification
}

function levelLabel(value: string) {
  const map: Record<string, string> = {
    high: "大",
    medium: "中",
    low: "小",
  }

  return map[value] ?? value
}

function reuseLabel(value: string) {
  const map: Record<string, string> = {
    high: "使いやすい",
    medium: "一部使える",
    low: "使いにくい",
  }

  return map[value] ?? value
}

function sumHours(items: ComparisonLearningGap[]) {
  const min = items.reduce(
    (total, item) => total + (item.estimated_extra_hours_min ?? 0),
    0
  )

  const max = items.reduce(
    (total, item) => total + (item.estimated_extra_hours_max ?? 0),
    0
  )

  return {
    min: min > 0 ? min : null,
    max: max > 0 ? max : null,
  }
}

function getMainGapLabels(items: ComparisonLearningGap[]) {
  return items
    .filter((item) => item.gap_level === "high")
    .map((item) => item.gap_label)
    .slice(0, 4)
}

function getReusableLabels(items: ComparisonLearningGap[]) {
  return items
    .filter((item) => item.reuse_level === "high")
    .map((item) => item.gap_label)
    .slice(0, 4)
}

function sortByDisplayOrder(items: ComparisonLearningGap[]) {
  return [...items].sort(
    (a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999)
  )
}

function DirectionBlock({
  title,
  items,
}: {
  title: string
  items: ComparisonLearningGap[]
}) {
  if (items.length === 0) return null

  const sortedItems = sortByDisplayOrder(items)
  const totalHours = sumHours(sortedItems)
  const mainGaps = getMainGapLabels(sortedItems)
  const reusable = getReusableLabels(sortedItems)

  return (
    <div className="rounded-xl border border-neutral-200/70 bg-white p-5">
      <h3 className="text-base font-semibold text-neutral-950">{title}</h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200/70">
          <div className="text-[11px] font-medium text-neutral-500">
            追加学習時間の目安
          </div>
          <div className="mt-1 text-lg font-semibold text-neutral-950">
            {formatHoursRange(totalHours.min, totalHours.max)}
          </div>
        </div>

        <div className="rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200/70">
          <div className="text-[11px] font-medium text-neutral-500">
            主に追加で必要
          </div>
          <div className="mt-2 text-sm leading-6 text-neutral-800">
            {mainGaps.length > 0 ? mainGaps.join("、") : "個別論点を確認"}
          </div>
        </div>

        <div className="rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200/70">
          <div className="text-[11px] font-medium text-neutral-500">
            使い回しやすい知識
          </div>
          <div className="mt-2 text-sm leading-6 text-neutral-800">
            {reusable.length > 0 ? reusable.join("、") : "限定的"}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {sortedItems.map((item) => (
          <div
            key={`${item.from_qualification_slug}-${item.to_qualification_slug}-${item.gap_label}`}
            className="rounded-lg bg-neutral-50 p-4 ring-1 ring-neutral-200/70"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-950">
                  {item.gap_label}
                </div>

                {item.gap_category && (
                  <div className="mt-1 text-xs text-neutral-500">
                    {item.gap_category}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-white px-2 py-1 text-neutral-600 ring-1 ring-neutral-200/70">
                  流用：{reuseLabel(item.reuse_level)}
                </span>

                <span className="rounded-full bg-white px-2 py-1 text-neutral-600 ring-1 ring-neutral-200/70">
                  負担：{levelLabel(item.gap_level)}
                </span>

                <span className="rounded-full bg-white px-2 py-1 text-neutral-600 ring-1 ring-neutral-200/70">
                  目安：
                  {formatHoursRange(
                    item.estimated_extra_hours_min,
                    item.estimated_extra_hours_max
                  )}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-neutral-700">
              {item.study_note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ComparisonLearningGapsSection({
  items,
  left,
  right,
}: Props) {
  if (items.length === 0) return null

  const leftToRight = items.filter(
    (item) =>
      item.from_qualification_slug === left.slug &&
      item.to_qualification_slug === right.slug
  )

  const rightToLeft = items.filter(
    (item) =>
      item.from_qualification_slug === right.slug &&
      item.to_qualification_slug === left.slug
  )

  const hasLeftToRight = leftToRight.length > 0
  const hasRightToLeft = rightToLeft.length > 0

  if (!hasLeftToRight && !hasRightToLeft) return null

  return (
    <section className="border-t border-neutral-200/70 py-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          片方を持っている人の追加学習マップ
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          すでに片方の資格を持っている場合、どの知識を使い回せて、どこを新しく学ぶ必要があるかを追加学習時間とあわせて整理します。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DirectionBlock
          title={`${left.name_short}取得者が${right.name_short}を目指す場合`}
          items={leftToRight}
        />

        <DirectionBlock
          title={`${right.name_short}取得者が${left.name_short}を目指す場合`}
          items={rightToLeft}
        />
      </div>
    </section>
  )
}