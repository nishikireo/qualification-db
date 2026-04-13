import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-950">
          オープン資格
        </Link>

        <nav className="flex items-center gap-6 text-sm text-neutral-600">
          <Link href="/lists/difficulty" className="hover:text-neutral-950">
            資格一覧
          </Link>
        </nav>
      </div>
    </header>
  )
}