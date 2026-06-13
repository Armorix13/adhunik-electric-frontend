import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";
import {
  Eye, X, Copy, Check, Search, Calendar, MapPin,
  CreditCard, ShoppingBag, User, ArrowRight, ShieldCheck
} from "lucide-react";

export default function Orders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const o = await api.orders.list();
      setOrders(o || []);
    } catch {
      toast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.orders.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status }));
      }
      toast(`Order status updated to ${status}`);
    } catch {
      toast("Could not update order status", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
    toast("Order ID copied to clipboard");
  };

  // Status List for tabs
  const statuses = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

  // Count helper
  const getStatusCount = (status: string) => {
    if (status === "all") return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;
    const matchesSearch = searchQuery === "" ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-600 border border-rose-500/20";
      case "shipped":
        return "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20";
      case "paid":
        return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-black text-foreground tracking-tight">Orders Billing</h1>
          <p className="text-xs text-muted-foreground">Fulfillment monitor, automated billing pipeline, and order pipeline logistics.</p>
        </div>
      </div>

      {/* Search and Tabs Filter Panel */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border/60 rounded-xl px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-primary/50 transition-all text-foreground"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dynamic Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border/30 pb-3">
          {statuses.map(status => {
            const isActive = selectedStatus === status;
            const count = getStatusCount(status);
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer capitalize ${isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
              >
                <span>{status}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-secondary/80 text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/30 bg-secondary/20">
                <th className="p-4.5 font-bold text-muted-foreground uppercase tracking-wider">Order ID</th>
                <th className="p-4.5 font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="p-4.5 font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="p-4.5 font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="p-4.5 font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4.5 font-bold text-muted-foreground uppercase tracking-wider">Fulfillment</th>
                <th className="p-4.5 font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/15 transition-colors group">
                  <td className="p-4.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground text-[11px]" title={o.id}>
                        {o.id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(o.id)}
                        className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy Order ID"
                      >
                        {copiedId === o.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4.5">
                    <p className="font-bold text-foreground text-xs">{o.customerName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{o.customerEmail}</p>
                  </td>
                  <td className="p-4.5 text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                  <td className="p-4.5 text-primary font-black text-xs">
                    ${o.total?.toFixed(2)}
                  </td>
                  <td className="p-4.5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4.5">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      className="bg-secondary/40 border border-border/60 rounded-xl px-2 py-1.5 focus:outline-none text-[11px] font-bold cursor-pointer text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4.5 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-2 border border-border/60 hover:text-primary hover:border-primary/40 rounded-xl transition-all cursor-pointer bg-card hover:bg-secondary/20 flex items-center gap-1.5 ml-auto text-[11px] font-bold"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                    No orders matching the active filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL OVERLAY */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 w-full max-w-2xl rounded-3xl p-6 shadow-xl relative animate-scale-up max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/30 pb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Order Specification</p>
                <h3 className="font-display font-extrabold text-lg text-foreground flex items-center gap-2">
                  #{selectedOrder.id}
                  <button
                    onClick={() => copyToClipboard(selectedOrder.id)}
                    className="p-1 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded transition-colors"
                  >
                    {copiedId === selectedOrder.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-secondary/50 rounded-xl transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Interactive Progress Timeline Tracker */}
            <div className="bg-secondary/15 border border-border/20 rounded-2xl p-5 space-y-4">
              <h4 className="font-display font-bold text-xs text-foreground uppercase tracking-wider">Fulfillment Timeline Tracker</h4>
              <div className="flex justify-between items-center relative py-2">
                {/* Connector line */}
                <div className="absolute left-0 right-0 h-0.5 bg-border top-1/2 -translate-y-1/2 z-0" />

                {/* Active fill line */}
                <div
                  className="absolute left-0 h-0.5 bg-primary top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width:
                      selectedOrder.status === "pending" ? "0%" :
                        selectedOrder.status === "paid" ? "33%" :
                          selectedOrder.status === "shipped" ? "66%" :
                            selectedOrder.status === "delivered" ? "100%" : "0%"
                  }}
                />

                {[
                  { key: "pending", label: "Pending" },
                  { key: "paid", label: "Paid / Confirmed" },
                  { key: "shipped", label: "Shipped" },
                  { key: "delivered", label: "Delivered" }
                ].map((step, idx) => {
                  const orderStatuses = ["pending", "paid", "shipped", "delivered"];
                  const currentIdx = orderStatuses.indexOf(selectedOrder.status);
                  const stepIdx = orderStatuses.indexOf(step.key);
                  const isCompleted = stepIdx <= currentIdx && selectedOrder.status !== "cancelled";
                  const isActive = step.key === selectedOrder.status;

                  return (
                    <div key={step.key} className="flex flex-col items-center z-10 text-center space-y-2">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isCompleted
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                        : "bg-card border border-border text-muted-foreground"
                        }`}>
                        {isCompleted ? <ShieldCheck className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
              {selectedOrder.status === "cancelled" && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-center font-bold text-xs uppercase tracking-wider">
                  This Order Has Been Cancelled
                </div>
              )}
            </div>

            {/* Split specifications info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column: Customer & Delivery Info */}
              <div className="space-y-4">
                <div className="bg-secondary/10 border border-border/30 rounded-2xl p-4.5 space-y-3">
                  <h4 className="font-display font-bold text-foreground flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" /> Customer Profile
                  </h4>
                  <div className="space-y-1 font-medium">
                    <p className="text-foreground font-bold">{selectedOrder.customerName}</p>
                    <p className="text-muted-foreground font-mono text-[10px]">{selectedOrder.customerEmail}</p>
                  </div>
                </div>

                <div className="bg-secondary/10 border border-border/30 rounded-2xl p-4.5 space-y-3">
                  <h4 className="font-display font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
                  </h4>
                  <div className="space-y-1 font-medium text-muted-foreground leading-relaxed">
                    <p>{selectedOrder.address}</p>
                    <p>{selectedOrder.city || "Medininagar"}, {selectedOrder.state || "Jharkhand"}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Date & Invoicing details */}
              <div className="space-y-4">
                <div className="bg-secondary/10 border border-border/30 rounded-2xl p-4.5 space-y-3">
                  <h4 className="font-display font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" /> Order Metadata
                  </h4>
                  <div className="space-y-1 font-medium text-muted-foreground">
                    <p>Order Placed: <span className="text-foreground font-bold">{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
                    <p className="flex items-center gap-1">Payment: <span className="text-foreground uppercase font-bold flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> {selectedOrder.paymentMethod}</span></p>
                  </div>
                </div>

                <div className="bg-secondary/10 border border-border/30 rounded-2xl p-4.5 space-y-3.5">
                  <h4 className="font-display font-bold text-foreground flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-primary" /> Financial Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>Subtotal</span>
                      <span>${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-600 font-bold">Free</span>
                    </div>
                    <div className="flex justify-between border-t border-border/30 pt-2 text-foreground font-black text-sm">
                      <span>Total Invoice</span>
                      <span className="text-primary">${selectedOrder.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Products catalog items */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-xs text-foreground uppercase tracking-wider">Ordered Products ({selectedOrder.items?.length || 0})</h4>
              <div className="border border-border/40 rounded-2xl overflow-hidden divide-y divide-border/30">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-center gap-4 bg-card hover:bg-secondary/5 transition-colors">
                    <div className="h-14 w-14 bg-muted/20 border border-border/20 rounded-xl p-1 flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.productImage || "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=150"}
                        alt={item.productName}
                        className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-foreground truncate">{item.productName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-light">Unit Price: ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-foreground">&times; {item.quantity}</p>
                      <p className="font-black text-primary mt-0.5">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-modal status dispatcher action */}
            <div className="border-t border-border/30 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-muted-foreground">Quick Action Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="bg-secondary border border-border/60 rounded-xl px-3 py-2 focus:outline-none font-bold text-xs cursor-pointer text-foreground"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto bg-primary hover:opacity-95 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-primary/5 cursor-pointer text-center text-xs"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
