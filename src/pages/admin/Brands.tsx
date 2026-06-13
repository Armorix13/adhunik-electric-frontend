import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function Brands() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const b = await api.brands.list();
      setBrands(b || []);
    } catch {
      toast("Failed to load brands", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      logoUrl: item.logoUrl || ""
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    try {
      await api.brands.delete(id);
      setBrands(prev => prev.filter(x => x.id !== id));
      toast("Brand deleted");
    } catch {
      toast("Failed to delete brand", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingItem) {
        await api.brands.update(editingItem.id, payload);
        toast("Brand updated successfully!");
      } else {
        await api.brands.create(payload);
        toast("Brand created successfully!");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || "Failed to save brand", "error");
    }
  };

  if (loading && brands.length === 0) {
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
          <h1 className="font-display text-2xl font-extrabold text-foreground">Brands</h1>
          <p className="text-xs text-muted-foreground">Manage manufacturers and product brands.</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-primary-foreground text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-95 shadow-sm">
          <Plus className="h-4 w-4" /> Add Brand
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full min-w-[600px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="p-4 font-bold text-muted-foreground uppercase">Brand Name</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Slug</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Description</th>
              <th className="p-4 font-bold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-secondary/10">
                <td className="p-4 font-bold text-foreground">{b.name}</td>
                <td className="p-4 font-mono text-muted-foreground">{b.slug}</td>
                <td className="p-4 text-muted-foreground truncate max-w-[250px]">{b.description || "-"}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(b)} className="p-2 border border-border/60 hover:text-primary rounded-xl transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 border border-border/60 hover:text-destructive rounded-xl transition-colors">
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
              {editingItem ? "Edit Brand" : "Create Brand"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Brand Name *</label>
                <input type="text" required value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Slug *</label>
                <input type="text" required value={formData.slug || ""} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Logo URL</label>
                <input type="text" value={formData.logoUrl || ""} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Description</label>
                <textarea rows={3} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              
              <button type="submit" className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3.5 rounded-xl shadow-sm transition-all mt-4 cursor-pointer">
                Save Brand
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
