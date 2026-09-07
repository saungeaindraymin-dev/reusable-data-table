import { AppLayout } from "@/components/AppLayout";
import { TimetablePage } from "@/features/timetable/TimetablePage";
import { Suspense } from "react";

export default function Home() {
  return (
    <AppLayout>
      <Suspense
        fallback={<div className="py-10 text-sm text-muted">Loading…</div>}
      >
        <TimetablePage />
      </Suspense>
    </AppLayout>
  );
}
