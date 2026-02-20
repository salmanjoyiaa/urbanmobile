import Link from "next/link";

import { FeaturedSliders } from "@/components/home/featured-sliders";
import { MaintenanceServices } from "@/components/home/maintenance-services";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCF9F2] text-[#2A201A] font-sans overflow-x-hidden">
      {/* Header */}
      <header className="w-full py-8">
        <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight flex items-center">
              <span className="text-4xl leading-none -mt-1">T</span>heUrbanRealEstate<span className="font-medium">Saudi</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-10 md:flex">
            <Link href="/" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Home</Link>
            <Link href="/properties" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Properties</Link>
            <Link href="/products" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Products</Link>
            <Link href="#" className="text-[15px] font-bold tracking-wide hover:opacity-70 transition-opacity">Maintenance</Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center rounded-xl bg-[#2A201A] px-8 py-3 text-[14px] font-bold text-white transition-all hover:bg-black"
            >
              Agent login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-24">
        {/* Hero Area */}
        <div className="flex flex-col lg:flex-row items-center relative mb-12">
          {/* Left Text */}
          <div className="w-full lg:w-1/2 z-10 pt-10 pb-4 lg:pb-8">
            <h1 className="text-[56px] md:text-[72px] lg:text-[88px] font-extrabold tracking-[-0.03em] leading-[1.05] mb-6">
              Find Your<br />Dream Home
            </h1>
            <p className="text-[#6B5A4E] max-w-md text-[17px] leading-relaxed mb-10 font-medium">
              Explore our curated selection of exquisite properties meticulously tailored to your unique dream home vision
            </p>
            <Link href="/properties">
              <button className="h-14 bg-[#2A201A] text-white px-10 rounded-xl text-[16px] font-bold transition-all hover:bg-black hover:scale-[1.02]">
                Rent/Buy
              </button>
            </Link>
          </div>

          {/* Right 3D Image */}
          <div
            className="w-full lg:w-1/2 relative lg:absolute lg:right-[-100px] lg:top-[-80px] flex justify-center lg:block mix-blend-darken pointer-events-none"
            style={{ filter: "brightness(1.05) contrast(1.05)" }}
          >
            <div className="relative w-full max-w-[700px] lg:max-w-[900px] aspect-[4/3]">
              <div
                className="absolute inset-0 bg-contain bg-right-bottom bg-no-repeat"
                style={{ backgroundImage: "url('/3d-house.png')" }}
              />
            </div>
          </div>


        </div>

        {/* Featured Sliders Container */}
        <div className="pt-8 relative z-0">
          <FeaturedSliders />
        </div>
      </main>

      <MaintenanceServices />

      {/* Footer Minimalist */}
      <footer className="border-t border-[#D9C5B2]/30 bg-[#FCF9F2] py-12">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col items-center gap-6">
          <span className="text-xl font-black tracking-tighter">
            TheUrbanRealEstateSaudi
          </span>
          <p className="text-[12px] font-semibold text-[#6B5A4E] uppercase tracking-widest">
            © {new Date().getFullYear()} TheUrbanRealEstateSaudi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
