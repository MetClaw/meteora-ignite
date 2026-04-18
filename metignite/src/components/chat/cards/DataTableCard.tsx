"use client";

interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface DataTableCardProps {
  title?: string;
  columns: DataTableColumn[];
  rows: Record<string, string | number>[];
  highlightColumn?: string;
}

export function DataTableCard({
  title,
  columns,
  rows,
  highlightColumn,
}: DataTableCardProps) {
  const alignClass = (align?: string) =>
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <div className="space-y-2">
      {title && (
        <span className="text-xs text-met-text-tertiary block">{title}</span>
      )}
      <div className="overflow-x-auto rounded-[8px] border border-met-stroke">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-met-stroke bg-met-base-dark/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-medium text-met-text-tertiary uppercase tracking-wider ${alignClass(col.align)}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-met-stroke/50 last:border-0"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 ${alignClass(col.align)} ${
                      col.key === highlightColumn
                        ? "text-met-accent-400 font-medium"
                        : "text-met-text-secondary"
                    }`}
                  >
                    {row[col.key] ?? "--"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
