import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function Coupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await api.coupons.list();
      setCoupons(c || []);
    } catch {
      toast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ type: "percentage", isActive: true });
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      type: item.type,
      value: item.value,
      minOrderAmount: item.minOrderAmount || "",
      usageLimit: item.usageLimit || "",
      isActive: item.isActive
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.coupons.delete(id);
      setCoupons(prev => prev.filter(x => x.id !== id));
      toast("Coupon deleted");
    } catch {
      toast("Failed to delete coupon", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      payload.value = Number(payload.value);
      payload.minOrderAmount = payload.minOrderAmount ? Number(payload.minOrderAmount) : undefined;
      payload.usageLimit = payload.usageLimit ? Number(payload.usageLimit) : undefined;

      if (editingItem) {
        await api.coupons.update(editingItem.id, payload);
        toast("Coupon updated successfully!");
      } else {
        await api.coupons.create(payload);
        toast("Coupon created successfully!");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || "Failed to save coupon", "error");
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h1 className="font-display text-2xl font-extrabold text-foreground">Discount Coupons</h1>
          <p className="text-xs text-muted-foreground">Manage marketing promo codes and coupons.</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-primary-foreground text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-95 shadow-sm">
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="p-4 font-bold text-muted-foreground uppercase">Code</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Type</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Value</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Min Order</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Active</th>
              <th className="p-4 font-bold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/10">
                <td className="p-4 font-mono font-bold text-foreground">{c.code}</td>
                <td className="p-4 capitalize text-muted-foreground">{c.type}</td>
                <td className="p-4 text-emerald-600 font-bold">{c.type === "fixed" ? `$${c.value}` : `${c.value}%`}</td>
                <td className="p-4 text-muted-foreground">${c.minOrderAmount || "0.00"}</td>
                <td className="p-4">{c.isActive ? "Yes" : "No"}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(c)} className="p-2 border border-border/60 hover:text-primary rounded-xl transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 border border-border/60 hover:text-destructive rounded-xl transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 w-full max-w-lg rounded-3xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-1 hover:bg-secondary/50 rounded-lg text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display font-extrabold text-base mb-6 border-b border-border/40 pb-3 text-foreground">
              {editingItem ? "Edit Coupon" : "Create Coupon"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Coupon Code *</label>
                <input type="text" required value={formData.code || ""} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Discount Type *</label>
                  <select value={formData.type || "percentage"} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Value *</label>
                  <input type="number" step="0.01" required value={formData.value || ""} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Min Order Amount ($)</label>
                  <input type="number" step="0.01" value={formData.minOrderAmount || ""} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Usage Limit</label>
                  <input type="number" value={formData.usageLimit || ""} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Active</label>
                <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <button type="submit" className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3.5 rounded-xl shadow-sm transition-all mt-4 cursor-pointer">
                Save Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
