import { AlertCircle, DollarSign, TrendingUp, Users } from "lucide-react";

import Card from "../../../components/common/Card";

const PayrollSummaryCards = ({ summary, formatMoney }) => {
  const cards = [
    {
      label: "Tổng phiếu lương",
      value: summary.totalPayrolls,
      icon: Users,
      tone: "blue",
    },
    {
      label: "Tổng thu nhập",
      value: formatMoney(summary.totalGross),
      icon: DollarSign,
      tone: "green",
    },
    {
      label: "Tổng thực nhận",
      value: formatMoney(summary.totalNet),
      icon: TrendingUp,
      tone: "purple",
    },
    {
      label: "Tổng khấu trừ",
      value: formatMoney(summary.totalDeduction),
      icon: AlertCircle,
      tone: "orange",
    },
  ];

  const toneMap = {
    blue: {
      accent: "bg-blue-500",
      text: "text-blue-700",
      icon: "bg-blue-50 text-blue-600 ring-blue-100",
    },
    green: {
      accent: "bg-emerald-500",
      text: "text-emerald-700",
      icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    purple: {
      accent: "bg-violet-500",
      text: "text-violet-700",
      icon: "bg-violet-50 text-violet-600 ring-violet-100",
    },
    orange: {
      accent: "bg-orange-500",
      text: "text-orange-700",
      icon: "bg-orange-50 text-orange-600 ring-orange-100",
    },
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const tone = toneMap[card.tone];

        return (
          <Card
            key={card.label}
            className="relative overflow-hidden rounded-lg border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} />
            <div className="flex items-center justify-between gap-3 pl-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {card.label}
                </p>
                <p className={`mt-1 truncate text-xl font-bold ${tone.text}`}>{card.value}</p>
              </div>
              <div className={`shrink-0 rounded-lg p-2.5 ring-1 ${tone.icon}`}>
                <Icon size={22} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PayrollSummaryCards;
