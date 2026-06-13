import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function Banners() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const b = await api.banners.list();
      setBanners(b || []);
    } catch {
      toast("Failed to load banners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ isActive: true, order: 0 });
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || "",
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl || "",
      isActive: item.isActive,
      order: item.order
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await api.banners.delete(id);
      setBanners(prev => prev.filter(x => x.id !== id));
      toast("Banner deleted");
    } catch {
      toast("Failed to delete banner", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      payload.order = Number(payload.order || 0);
      if (editingItem) {
        await api.banners.update(editingItem.id, payload);
        toast("Banner updated successfully!");
      } else {
        await api.banners.create(payload);
        toast("Banner created successfully!");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || "Failed to save banner", "error");
    }
  };

  if (loading && banners.length === 0) {
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
          <h1 className="font-display text-2xl font-extrabold text-foreground">Banners Ad</h1>
          <p className="text-xs text-muted-foreground">Configure homepage sliding hero banners.</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-primary-foreground text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-95 shadow-sm">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="p-4 font-bold text-muted-foreground uppercase">Title</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Subtitle</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Order</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Active</th>
              <th className="p-4 font-bold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {banners.map((b) => (
              <tr key={b.id} className="hover:bg-secondary/10">
                <td className="p-4 font-bold text-foreground">{b.title}</td>
                <td className="p-4 text-muted-foreground">{b.subtitle || "-"}</td>
                <td className="p-4 font-medium">{b.order}</td>
                <td className="p-4">{b.isActive ? "Yes" : "No"}</td>
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
              {editingItem ? "Edit Banner" : "Create Banner"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Banner Title *</label>
                <input type="text" required value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Subtitle</label>
                <input type="text" value={formData.subtitle || ""} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Image URL *</label>
                <input type="text" required value={formData.imageUrl || ""} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Link URL</label>
                <input type="text" value={formData.linkUrl || ""} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Order Priority</label>
                  <input type="number" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Active</label>
                  <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3.5 rounded-xl shadow-sm transition-all mt-4 cursor-pointer">
                Save Banner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
