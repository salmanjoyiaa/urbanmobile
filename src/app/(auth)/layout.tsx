import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="text-xl font-bold text-foreground">
            Urban<span className="text-primary">Saudi</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
