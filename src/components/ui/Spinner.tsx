import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={`animate-spin text-muted ${className ?? ""}`}
      size={16}
      aria-hidden
    />
  );
}
