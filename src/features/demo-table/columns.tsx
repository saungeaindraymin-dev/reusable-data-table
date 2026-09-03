import type { ColumnDef } from "@/components/data-table/core/types";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { Deal, DealStage } from "./types";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STAGE_TONE: Record<DealStage, BadgeTone> = {
  Lead: "gray",
  Qualified: "blue",
  Proposal: "violet",
  Won: "green",
  Lost: "red",
};

export const dealColumns: ColumnDef<Deal>[] = [
  {
    key: "company",
    header: "Company",
    sortable: true,
    pinned: "left",
    width: 190,
    cell: (row) => (
      <span className="font-medium text-foreground">{row.company}</span>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    sortable: true,
    width: 160,
  },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    width: 130,
    align: "right",
    cell: (row) => (
      <span className="tabular-nums font-medium">
        {money.format(row.amount)}
      </span>
    ),
  },
  {
    key: "stage",
    header: "Stage",
    sortable: true,
    width: 130,
    cell: (row) => <Badge tone={STAGE_TONE[row.stage]}>{row.stage}</Badge>,
  },
  {
    key: "probability",
    header: "Win %",
    sortable: true,
    width: 120,
    align: "right",
    accessor: (row) => row.probability,
    cell: (row) => (
      <span className="tabular-nums text-muted">{row.probability}%</span>
    ),
  },
  {
    key: "closeDate",
    header: "Close date",
    sortable: true,
    width: 150,
    accessor: (row) => row.closeDate,
    cell: (row) => (
      <span className="tabular-nums text-foreground">
        {dateFmt.format(new Date(row.closeDate))}
      </span>
    ),
  },
];
