import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FCF9F2] text-[#2A201A] font-sans">
      <header className="sticky top-0 z-50 border-b border-[#D9C5B2]/30 bg-[#FCF9F2]/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-black tracking-tight leading-none">
              TheUrbanRealEstate<span className="text-[22px] font-black">Saudi</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
