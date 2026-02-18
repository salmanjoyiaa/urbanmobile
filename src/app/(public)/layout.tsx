import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-navy">
            Urban<span className="text-gold">Saudi</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/properties" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Properties
            </Link>
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Products
            </Link>
          </nav>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t bg-white px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} UrbanSaudi</p>
          <div className="flex gap-5">
            <Link href="/properties" className="hover:text-foreground">Properties</Link>
            <Link href="/products" className="hover:text-foreground">Products</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
