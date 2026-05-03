import { AlertCircle, DollarSign, TrendingUp, Users } from "lucide-react";

import Card from "../../../components/common/Card";

const PayrollSummaryCards = ({ summary, formatMoney }) => {
  const cards = [
    {
      label: "Tổng nhân viên",
      value: summary.totalEmployees,
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
      card: "from-blue-50 to-blue-100 border-blue-200",
      text: "text-blue-700",
      subtext: "text-blue-600",
      icon: "bg-blue-200 text-blue-700",
    },
    green: {
      card: "from-green-50 to-green-100 border-green-200",
      text: "text-green-700",
      subtext: "text-green-600",
      icon: "bg-green-200 text-green-700",
    },
    purple: {
      card: "from-purple-50 to-purple-100 border-purple-200",
      text: "text-purple-700",
      subtext: "text-purple-600",
      icon: "bg-purple-200 text-purple-700",
    },
    orange: {
      card: "from-orange-50 to-orange-100 border-orange-200",
      text: "text-orange-700",
      subtext: "text-orange-600",
      icon: "bg-orange-200 text-orange-700",
    },
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const tone = toneMap[card.tone];
        return (
          <Card
            key={card.label}
            className={`border p-4 bg-gradient-to-br ${tone.card}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`mt-1 text-xs font-medium uppercase ${tone.subtext}`}>
                  {card.label}
                </p>
                <p className={`mt-1 text-xl font-bold ${tone.text}`}>{card.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${tone.icon}`}>
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PayrollSummaryCards;
