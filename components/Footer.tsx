import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-950">
            オープン資格
          </Link>
          <p className="mt-2 text-sm text-neutral-500">
            資格をもっと、オープンに。
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <Link href="/about" className="hover:text-neutral-950">
            このサイトについて
          </Link>
          <Link href="/editorial-policy" className="hover:text-neutral-950">
            編集方針
          </Link>
          <Link href="/sources" className="hover:text-neutral-950">
            出典ポリシー
          </Link>
          <Link href="/ai-policy" className="hover:text-neutral-950">
            AI利用ポリシー
          </Link>
          <Link href="/privacy" className="hover:text-neutral-950">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="hover:text-neutral-950">
            利用規約
          </Link>
        </nav>
      </div>
    </footer>
  )
}