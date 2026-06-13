import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await api.categories.list();
      setCategories(c || []);
    } catch {
      toast("Failed to load categories", "error");
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
      imageUrl: item.imageUrl || ""
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.categories.delete(id);
      setCategories(prev => prev.filter(x => x.id !== id));
      toast("Category deleted");
    } catch {
      toast("Failed to delete category", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingItem) {
        await api.categories.update(editingItem.id, payload);
        toast("Category updated successfully!");
      } else {
        await api.categories.create(payload);
        toast("Category created successfully!");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || "Failed to save category", "error");
    }
  };

  if (loading && categories.length === 0) {
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
          <h1 className="font-display text-2xl font-extrabold text-foreground">Categories</h1>
          <p className="text-xs text-muted-foreground">Manage product classification and hierarchy.</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-primary-foreground text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-95 shadow-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="p-4 font-bold text-muted-foreground uppercase">Category Name</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Slug</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Description</th>
              <th className="p-4 font-bold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/10">
                <td className="p-4 font-bold text-foreground">{c.name}</td>
                <td className="p-4 font-mono text-muted-foreground">{c.slug}</td>
                <td className="p-4 text-muted-foreground truncate max-w-[250px]">{c.description || "-"}</td>
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
              {editingItem ? "Edit Category" : "Create Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Category Name *</label>
                <input type="text" required value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Slug *</label>
                <input type="text" required value={formData.slug || ""} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Image URL</label>
                <input type="text" value={formData.imageUrl || ""} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Description</label>
                <textarea rows={3} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              
              <button type="submit" className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3.5 rounded-xl shadow-sm transition-all mt-4 cursor-pointer">
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
