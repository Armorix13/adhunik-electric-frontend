import { useState, useEffect } from "react";
import { Link } from "wouter";
import api from "../lib/api";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import { ShoppingBag, Calendar, Truck, CheckCircle, Package } from "lucide-react";

export default function Orders() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!token) return;
      try {
        const data = await api.orders.listMine();
        setOrders(data || []);
      } catch (err: any) {
        toast("Failed to load your order history", "error");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token, toast]);

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Please Sign In</h2>
        <p className="text-muted-foreground text-sm">You must be logged in to access your order history.</p>
        <Link href="/login">
          <button className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm">
            Sign In Now
          </button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-card border border-border/40 rounded-2xl p-12 text-center space-y-5 shadow-sm">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-lg font-display">No Orders Found</h3>
          <p className="text-sm text-muted-foreground">You haven't placed any orders with New Adhunik Electric yet.</p>
          <Link href="/products">
            <button className="bg-primary text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-full">
              Explore Catalog
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-secondary/20 border-b border-border/40 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-sm">
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-xs text-muted-foreground font-light uppercase tracking-wider">Order Placed</p>
                    <p className="font-semibold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-light uppercase tracking-wider">Total Value</p>
                    <p className="font-semibold text-primary mt-0.5">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-light uppercase tracking-wider">Order ID</p>
                    <p className="font-mono mt-0.5">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div>
                  <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase ${
                    order.status === "delivered" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : order.status === "cancelled"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="p-6 divide-y divide-border/30">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                    <div className="h-14 w-14 bg-muted/20 border border-border/30 rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                      <img 
                        src={item.productImage || "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=150"} 
                        alt={item.productName} 
                        className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-light">Qty: {item.quantity} &times; ${item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-semibold text-sm text-foreground">${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Info footer */}
              <div className="bg-secondary/10 px-6 py-4 border-t border-border/30 text-xs text-muted-foreground flex justify-between items-center">
                <span>Shipping Address: <strong className="text-foreground">{order.address}, {order.city}</strong></span>
                <span>Paid via: <strong className="text-foreground uppercase">{order.paymentMethod}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
