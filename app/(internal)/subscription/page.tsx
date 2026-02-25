
import PricingCards from "@/components/pricingcards";
import { Suspense } from "react";

export default function Page() {
  return (
    <main>
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <PricingCards />
    </Suspense>
    </main>
  );
}