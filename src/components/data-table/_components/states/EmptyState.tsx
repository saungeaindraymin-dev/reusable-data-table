import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ message }: { message?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-muted-2">
        <Inbox size={20} />
      </div>
      <p className="text-sm font-medium text-foreground">
        {message ?? "No results"}
      </p>
      <p className="text-sm text-muted">Try again filters or search.</p>
    </div>
  );
}
