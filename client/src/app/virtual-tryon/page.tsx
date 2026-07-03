import { Suspense } from "react";
import VirtualTryOnClient from "./VirtualTryOnClient";

export default function VirtualTryOnPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading Virtual Try-On...</div>}>
      <VirtualTryOnClient />
    </Suspense>
  );
}

