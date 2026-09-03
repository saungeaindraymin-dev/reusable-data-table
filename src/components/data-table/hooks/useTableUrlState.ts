"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TableState } from "../core/types";
import { searchParamsToState, stateToSearchParams } from "../core/utils";

export function useTableUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  const state = useMemo(
    () => searchParamsToState(new URLSearchParams(search)),
    [search],
  );

  const setState = (next: TableState) => {
    const query = stateToSearchParams(next).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return { state, setState };
}
