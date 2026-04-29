import type { Qualification } from "@/types/qualification"

type Props = {
  qualification: Qualification
}

export default function FitSection({ qualification }: Props) {
  return (
    <section className="border-t border-neutral-200/70 py-8">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-neutral-950">
        向いている人・向いていない人
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200/70 bg-white p-5">
          <div className="text-sm font-semibold text-neutral-950">
            向いている人
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
            {qualification.who_should_take || "準備中です。"}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200/70 bg-white p-5">
          <div className="text-sm font-semibold text-neutral-950">
            向いていない人
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
            {qualification.who_should_not_take || "準備中です。"}
          </p>
        </div>
      </div>
    </section>
  )
}
