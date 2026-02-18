import Link from "next/link";
import { Building2, Package, ArrowRight, Shield, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-navy">
            Urban<span className="text-gold">Saudi</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/properties"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Properties
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup/agent">
              <Button size="sm" className="bg-gold text-navy hover:bg-gold-dark">
                Become an Agent
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy px-4 py-20 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Perfect Property in{" "}
            <span className="text-gold">Saudi Arabia</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Browse premium property listings, discover quality household items,
            and schedule visits — all in one place.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/properties">
              <Button
                size="lg"
                className="bg-gold text-navy hover:bg-gold-dark"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Browse Properties
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-500 text-white hover:bg-white/10"
              >
                <Package className="mr-2 h-5 w-5" />
                Shop Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-navy">
            Why Choose UrbanSaudi?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                <Shield className="h-7 w-7 text-gold-dark" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Verified Agents</h3>
              <p className="mt-2 text-muted-foreground">
                Every agent is reviewed and approved by our admin team before
                they can list properties.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                <Clock className="h-7 w-7 text-gold-dark" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Easy Scheduling</h3>
              <p className="mt-2 text-muted-foreground">
                Book property visits in seconds with our Calendly-style
                scheduler. Pick a date and time that works for you.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                <Phone className="h-7 w-7 text-gold-dark" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                WhatsApp Notifications
              </h3>
              <p className="mt-2 text-muted-foreground">
                Get instant WhatsApp confirmations when your visit or purchase
                request is approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted px-4 py-16">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-navy">
            Are you a real estate agent?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join UrbanSaudi to list your properties and products, manage visits,
            and connect with buyers across Saudi Arabia.
          </p>
          <Link href="/signup/agent">
            <Button
              size="lg"
              className="mt-6 bg-navy text-white hover:bg-navy-light"
            >
              Register as Agent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} UrbanSaudi. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link
              href="/properties"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Properties
            </Link>
            <Link
              href="/products"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
