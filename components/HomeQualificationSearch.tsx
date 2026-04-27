"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomeQualificationSearch() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = keyword.trim()

    if (!trimmed) {
      router.push("/qualifications")
      return
    }

    router.push(`/qualifications?keyword=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl">
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200/70 bg-white p-3 shadow-sm md:flex-row">
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="宅建、簿記2級、FP2級、ITパスポート..."
          className="min-h-11 flex-1 rounded-md border border-neutral-200 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500"
        />

        <button
          type="submit"
          className="min-h-11 rounded-md bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          資格を探す
        </button>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => router.push("/qualifications?keyword=宅建")}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950"
        >
          宅建
        </button>

        <button
          type="button"
          onClick={() => router.push("/qualifications?keyword=簿記")}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950"
        >
          簿記
        </button>

        <button
          type="button"
          onClick={() => router.push("/qualifications?keyword=FP")}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950"
        >
          FP
        </button>

        <button
          type="button"
          onClick={() => router.push("/qualifications?keyword=IT")}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-950"
        >
          IT
        </button>
      </div>
    </form>
  )
}