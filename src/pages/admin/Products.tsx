import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c, b] = await Promise.all([
        api.products.list({ limit: 100 }),
        api.categories.list(),
        api.brands.list()
      ]);
      setProducts(p.products || []);
      setCategories(c || []);
      setBrands(b || []);
    } catch {
      toast("Failed to load catalog details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ isFeatured: false, images: "", specifications: "" });
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      sku: item.sku || "",
      description: item.description || "",
      price: item.price,
      discountPrice: item.discountPrice || "",
      stockQty: item.stockQty,
      images: item.images?.join(", ") || "",
      categoryId: item.categoryId || "",
      brandId: item.brandId || "",
      isFeatured: item.isFeatured
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.products.delete(id);
      setProducts(prev => prev.filter(x => x.id !== id));
      toast("Product deleted");
    } catch {
      toast("Failed to delete product", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      payload.price = Number(payload.price);
      payload.discountPrice = payload.discountPrice ? Number(payload.discountPrice) : undefined;
      payload.stockQty = Number(payload.stockQty);
      payload.images = payload.images ? payload.images.split(",").map((x: string) => x.trim()) : [];
      
      if (editingItem) {
        await api.products.update(editingItem.id, payload);
        toast("Product updated successfully!");
      } else {
        await api.products.create(payload);
        toast("Product created successfully!");
      }
      setIsOpen(false);
      loadData();
    } catch (err: any) {
      toast(err.message || "Failed to save product", "error");
    }
  };

  if (loading && products.length === 0) {
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
          <h1 className="font-display text-2xl font-extrabold text-foreground">Products Catalog</h1>
          <p className="text-xs text-muted-foreground">Modify details, configure quantities, and manage catalog items.</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-primary-foreground text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:opacity-95 shadow-sm">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="p-4 font-bold text-muted-foreground uppercase">Product Name</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">SKU</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Price</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Stock</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Featured</th>
              <th className="p-4 font-bold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/10">
                <td className="p-4 font-bold truncate max-w-[220px] text-foreground">{p.name}</td>
                <td className="p-4 font-mono text-muted-foreground">{p.sku || "-"}</td>
                <td className="p-4 text-primary font-bold">${p.price?.toFixed(2)}</td>
                <td className="p-4 font-medium">{p.stockQty} items</td>
                <td className="p-4">{p.isFeatured ? "Yes" : "No"}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(p)} className="p-2 border border-border/60 hover:text-primary rounded-xl transition-colors">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 border border-border/60 hover:text-destructive rounded-xl transition-colors">
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
              {editingItem ? "Edit Product Details" : "Create Product Directory"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Product Name *</label>
                <input type="text" required value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Slug *</label>
                  <input type="text" required value={formData.slug || ""} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">SKU</label>
                  <input type="text" value={formData.sku || ""} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Price ($) *</label>
                  <input type="number" step="0.01" required value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Discount Price ($)</label>
                  <input type="number" step="0.01" value={formData.discountPrice || ""} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Stock Qty *</label>
                  <input type="number" required value={formData.stockQty || ""} onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Featured</label>
                  <select value={formData.isFeatured ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.value === "true" })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Category</label>
                  <select value={formData.categoryId || ""} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Brand</label>
                  <select value={formData.brandId || ""} onChange={(e) => setFormData({ ...formData, brandId: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none">
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Images (Comma separated URLs for multi-image carousel)</label>
                <input type="text" value={formData.images || ""} onChange={(e) => setFormData({ ...formData, images: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Description</label>
                <textarea rows={3} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-secondary/40 border border-border/60 rounded-xl px-3.5 py-2.5 focus:outline-none" />
              </div>
              
              <button type="submit" className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3.5 rounded-xl shadow-sm transition-all mt-4 cursor-pointer">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
