import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  ShoppingBag, Package, Users, BarChart3, TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.dashboard.getStats();
        setStats(res);
      } catch (err: any) {
        toast("Failed to load dashboard statistics", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Real-time stats monitor for New Adhunik Electric inventory and billing pipeline.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `$${stats.totalSales?.toFixed(2)}`, icon: TrendingUp },
          { label: "Total Orders", value: stats.ordersCount, icon: ShoppingBag },
          { label: "Active Products", value: stats.productsCount, icon: Package },
          { label: "Active Customers", value: stats.usersCount, icon: Users }
        ].map((card, idx) => (
          <div key={idx} className="bg-card border border-border/40 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] uppercase font-bold tracking-wider">{card.label}</span>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-black text-foreground leading-none">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {stats.salesByCategory && stats.salesByCategory.length > 0 && (
        <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm">Revenue Distribution by Category ($)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByCategory}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Details Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Warning */}
        <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-destructive">Low Stock Inventory</h3>
          <div className="divide-y divide-border/30">
            {stats.lowStockProducts?.map((p: any) => (
              <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                <span className="font-semibold truncate max-w-[70%] text-foreground">{p.name}</span>
                <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-600 font-bold rounded-md">{p.stockQty} left</span>
              </div>
            ))}
            {(!stats.lowStockProducts || stats.lowStockProducts.length === 0) && (
              <p className="text-xs text-muted-foreground py-2 italic">All products are healthy.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm">Recent Direct Orders</h3>
          <div className="divide-y divide-border/30">
            {stats.recentOrders?.map((o: any) => (
              <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-foreground">{o.customerName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">#{o.id.slice(-8).toUpperCase()}</p>
                </div>
                <span className="font-semibold text-primary">${o.total?.toFixed(2)}</span>
              </div>
            ))}
            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-xs text-muted-foreground py-2 italic">No orders received yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
