import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnalyticsData } from "@/actions/admin-actions";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const res = await getAnalyticsData();
  const data = res.success && res.analytics ? res.analytics : {
    monthlyStats: [],
    topModerators: [],
    statusDistribution: [],
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-xl font-black text-foreground">Performance Analytics & Charts</h1>
        <p className="text-xs text-muted-foreground font-semibold mt-1">
          Review sales growth, monthly orders volume, top-performing moderators, and order status proportions.
        </p>
      </div>

      <div className="mt-8">
        <AnalyticsCharts
          monthlyStats={data.monthlyStats}
          topModerators={data.topModerators}
          statusDistribution={data.statusDistribution}
        />
      </div>
    </div>
  );
}
