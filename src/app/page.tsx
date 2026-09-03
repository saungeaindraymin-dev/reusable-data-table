import { AppLayout } from "@/components/AppLayout";
import { Suspense } from "react";


export default function Home() {
  return (
    <AppLayout>
      <Suspense
        fallback={<div className="py-10 text-sm text-muted">Loading…</div>}
      >
        hello
      </Suspense>
    </AppLayout>
  );
}
