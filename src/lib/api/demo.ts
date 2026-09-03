import type { Deal } from "@/features/demo-table/types";
import { generateDeals } from "./fixtures";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ALL_DEALS = generateDeals(38);

export async function fetchDeals(
  options: { simulateError?: boolean } = {},
): Promise<Deal[]> {
  await delay(500 + Math.random() * 300);

  if (options.simulateError) {
    throw new Error("Failed to load deals.");
  }

  return ALL_DEALS;
}
