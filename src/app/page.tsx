import { AppLayout } from "@/components/AppLayout";
import { Timetable } from "@/features/timetable/Timetable";
import { Suspense } from "react";


export default function Home() {
  return (
    <AppLayout>
      <Suspense
        fallback={<div className="py-10 text-sm text-muted">Loading…</div>}
      >
        <Timetable/>
      </Suspense>
    </AppLayout>
  );
}
