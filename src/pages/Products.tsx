import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import api from "../lib/api";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import { Heart, Search, Filter, SlidersHorizontal, RotateCcw } from "lucide-react";

function useLocationSearch() {
  const [search, setSearchState] = useState(window.location.search);
  useEffect(() => {
    const handleLocationChange = () => {
      setSearchState(window.location.search);
    };
    window.addEventListener("popstate", handleLocationChange);
    
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);
  return search;
}

export default function Products() {
  const currentSearch = useLocationSearch();
  const [location] = useLocation();
  const { addToWishlist, token } = useAuth();
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter States
  const urlParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get("categoryId") || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load Categories & Brands
  useEffect(() => {
    async function init() {
      try {
        const [cats, brnds] = await Promise.all([
          api.categories.list(),
          api.brands.list()
        ]);
        setCategories(cats || []);
        setBrands(brnds || []);
      } catch (err: any) {
        toast("Failed to load filter directories", "error");
      }
    }
    init();
  }, [toast]);

  // Sync categoryId from URL if changed
  useEffect(() => {
    const freshParams = new URLSearchParams(window.location.search);
    const catId = freshParams.get("categoryId");
    if (catId) {
      const found = categories.find(c => c.slug === catId || c.id === catId);
      if (found) {
        setSelectedCategory(found.id);
      } else {
        setSelectedCategory(catId);
      }
    } else {
      setSelectedCategory("");
    }
    const sTerm = freshParams.get("search");
    if (sTerm) {
      setSearch(sTerm);
    } else {
      setSearch("");
    }
  }, [currentSearch, categories]);

  // Load products when filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.products.list({
          categoryId: selectedCategory,
          brandId: selectedBrand,
          search,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          inStock: inStock || undefined,
          page,
          limit: 12
        });
        setProducts(res.products || []);
        setTotal(res.total || 0);
      } catch (err: any) {
        toast(err.message || "Failed to fetch products", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, selectedBrand, search, minPrice, maxPrice, inStock, page, toast]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setPage(1);
  };

  const handleAddWishlist = async (e: React.MouseEvent, prodId: string) => {
    e.preventDefault();
    if (!token) {
      toast("Please login to manage your wishlist", "error");
      return;
    }
    try {
      await addToWishlist(prodId);
      toast("Added to wishlist successfully!");
    } catch (err: any) {
      toast(err.message || "Could not add to wishlist", "error");
    }
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Mobile Filter Backdrop */}
      {mobileFiltersOpen && (
        <div 
          onClick={() => setMobileFiltersOpen(false)} 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR FILTERS (Permanent on Desktop, Drawer on Mobile) */}
        <aside className={`
          fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card border-r border-border/40 p-6 z-50 transition-transform duration-300 overflow-y-auto lg:p-0 lg:border-none lg:relative lg:w-64 lg:h-auto lg:translate-x-0 lg:z-0 lg:overflow-visible
          ${mobileFiltersOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Mobile Filter Header */}
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6 lg:hidden">
            <h2 className="font-display font-bold text-base flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" /> Filters
            </h2>
            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="p-1 border border-border rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-border pb-4 hidden lg:flex">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" /> Filters
            </h2>
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Clear All
            </button>
          </div>

          <div className="space-y-6 mt-4 lg:mt-0">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Model, brand..."
                  className="w-full bg-card border border-border/80 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary/50"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="w-full bg-card border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brands */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
                className="w-full bg-card border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Range ($)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-full bg-card border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-full bg-card border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Stock Toggle */}
            <div className="flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={inStock}
                onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
                className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/20 accent-primary"
              />
              <label htmlFor="inStockOnly" className="text-sm font-medium text-foreground cursor-pointer select-none">
                In Stock Only
              </label>
            </div>
          </div>

          {/* Mobile Clear All button */}
          <div className="pt-6 border-t border-border mt-6 lg:hidden">
            <button 
              onClick={() => { resetFilters(); setMobileFiltersOpen(false); }} 
              className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
            </button>
          </div>
        </aside>

        {/* PRODUCTS GRID SECTION */}
        <main className="flex-1 space-y-8">
          <div className="flex justify-between items-center border-b border-border/40 pb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{products.length}</span> of <span className="font-semibold text-foreground">{total}</span> items
            </p>
            <button 
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border/80 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer hover:bg-secondary/20 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-border/40 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Filter className="h-12 w-12 text-muted-foreground" />
              <h3 className="font-display text-lg font-bold">No Products Found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try widening your price filters, clearing search parameters, or selecting another category.
              </p>
              <button onClick={resetFilters} className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-full mt-2">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((prod) => (
                  <div key={prod.id} className="group bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-primary/45 hover:shadow-md transition-all flex flex-col hover-scale">
                    <Link href={`/products/${prod.id}`} className="block relative aspect-square bg-muted/20 p-4">
                      <img 
                        src={prod.images?.[0] || "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600"} 
                        alt={prod.name} 
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                      {prod.discountPrice && (
                        <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-extrabold px-2.5 py-1 rounded-md shadow-sm">
                          SALE
                        </span>
                      )}
                    </Link>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">{prod.brandName || "Premium"}</p>
                        <Link href={`/products/${prod.id}`}>
                          <h3 className="font-display font-bold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-snug">
                            {prod.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                        <div>
                          {prod.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-base font-extrabold text-primary">${prod.discountPrice.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground line-through font-light">${prod.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-base font-extrabold text-foreground">${prod.price.toFixed(2)}</span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button 
                            onClick={(e) => handleAddWishlist(e, prod.id)}
                            className="p-2 border border-border/60 rounded-xl hover:bg-secondary/40 hover:text-primary transition-all text-muted-foreground"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <Link href={`/products/${prod.id}`}>
                            <button className="bg-primary hover:opacity-95 text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all">
                              View
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border border-border rounded-xl text-sm disabled:opacity-40 hover:bg-secondary/40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 rounded-xl text-sm font-semibold transition-colors ${
                        page === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary/40"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border border-border rounded-xl text-sm disabled:opacity-40 hover:bg-secondary/40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
