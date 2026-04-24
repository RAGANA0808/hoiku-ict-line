import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">保育ICT</h1>
      <p className="mt-2 text-slate-600">認定こども園せんだん幼稚園 保育ICTシステム</p>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <div className="text-sm text-slate-500">職員向け</div>
          <div className="mt-1 text-lg font-semibold">管理画面</div>
        </Link>
        <Link
          href="/liff"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <div className="text-sm text-slate-500">保護者向け</div>
          <div className="mt-1 text-lg font-semibold">LIFF</div>
        </Link>
        <Link
          href="/super-admin"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <div className="text-sm text-slate-500">SaaS運営</div>
          <div className="mt-1 text-lg font-semibold">Super Admin</div>
        </Link>
      </section>
    </main>
  );
}
