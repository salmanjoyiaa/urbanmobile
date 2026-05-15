import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SellListingForm } from "@/components/sell/sell-listing-form";

export default function SellPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">List your product free</h1>
        <p className="text-muted-foreground">
          Add your listing and create a seller account in one step. If email confirmation is required, your text is saved
          and you can add photos after you sign in.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <SellListingForm />
      </Suspense>
    </div>
  );
}
