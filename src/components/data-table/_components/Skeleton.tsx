import type { ColumnDef } from "../core/types";

interface SkeletonRowsProps<T> {
  columns: ColumnDef<T>[];
  rows: number;
  hasExpandColumn: boolean;
}

export function SkeletonRows<T>({
  columns,
  rows,
  hasExpandColumn,
}: SkeletonRowsProps<T>) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="bg-white">
          {hasExpandColumn && (
            <td className="w-10 border-b border-border px-2 py-3">
              <div className="skeleton h-4 w-4 rounded" />
            </td>
          )}

          {columns.map((column, columnIndex) => (
            <td
              key={column.key}
              style={{ width: column.width }}
              className="border-b border-border px-3 py-3"
            >
              <div
                className={`skeleton h-4 rounded ${skeletonWidth(rowIndex, columnIndex)}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function skeletonWidth(rowIndex: number, columnIndex: number): string {
  if (columnIndex === 0) return "w-3/4";
  if ((rowIndex + columnIndex) % 3 === 0) return "w-1/2";
  return "w-2/3";
}
