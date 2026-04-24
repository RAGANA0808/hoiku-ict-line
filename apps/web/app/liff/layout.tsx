export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-md px-4 py-6">{children}</main>
    </div>
  );
}
