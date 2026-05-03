import { AlertCircle } from "lucide-react";

import Card from "../common/Card";

const TableState = ({ label }) => (
  <div className="flex h-64 items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="flex h-64 items-center justify-center">
    <div className="text-center text-gray-400">
      <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 text-xs">{description}</p> : null}
    </div>
  </div>
);

const DataTableShell = ({
  filters,
  loading,
  isEmpty,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  mobileContent,
  desktopContent,
  className = "",
}) => {
  return (
    <Card
      className={`flex h-full flex-col overflow-hidden border border-gray-200 p-0 shadow-sm ${className}`}
    >
      {filters}

      <div className="p-3 md:hidden">
        {loading ? (
          <TableState label={loadingLabel} />
        ) : isEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          mobileContent
        )}
      </div>

      <div className="hidden flex-1 overflow-auto md:block">
        {loading ? (
          <TableState label={loadingLabel} />
        ) : isEmpty ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          desktopContent
        )}
      </div>
    </Card>
  );
};

export default DataTableShell;
