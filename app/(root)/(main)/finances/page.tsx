import { getSalesDashboardData } from "@/lib/actions/financesdashboard.actions";
import SalesHeader from "@/components/SalesHeader";
import SummaryCards from "@/components/SummaryCards";
import SalesCharts from "@/components/SalesCharts";
import TransactionsTable from "@/components/TransactionsTable";

export default async function SalesPage() {
  const { success, data, error } = await getSalesDashboardData();

  return (
    <div className="px-4 gap-4">
      <SalesHeader />
      <SummaryCards data={data.summaryCards} />
      <SalesCharts data={data.charts} />
      <TransactionsTable initialTransactions={data.recentTransactions} />
    </div>
  );
}
