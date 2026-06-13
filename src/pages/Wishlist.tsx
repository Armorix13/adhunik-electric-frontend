import { useState, useEffect } from "react";
import { Link } from "wouter";
import api from "../lib/api";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function Wishlist() {
  const { token, addToCart, removeFromWishlist } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadWishlist() {
    if (!token) return;
    try {
      const data = await api.wishlist.get();
      setWishlistItems(data || []);
    } catch (err: any) {
      toast("Failed to load wishlist items", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, [token]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId));
      toast("Removed from wishlist");
    } catch (err: any) {
      toast("Failed to remove item", "error");
    }
  };

  const handleAddToCart = async (productId: string, price: number) => {
    try {
      await addToCart(productId, 1, price);
      toast("Added to shopping cart!");
    } catch (err: any) {
      toast(err.message || "Failed to add to cart", "error");
    }
  };

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-display">Please Sign In</h2>
        <p className="text-muted-foreground text-sm">You must be logged in to access and manage your wishlist.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-2xl md:text-3xl font-extrabold mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="bg-card border border-border/40 rounded-2xl p-12 text-center space-y-5 shadow-sm max-w-md mx-auto">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-lg font-display">Wishlist is Empty</h3>
          <p className="text-sm text-muted-foreground">Save items here that you want to buy later.</p>
          <Link href="/products">
            <button className="bg-primary text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-full">
              Explore Catalog
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((item) => {
            const prod = item.product;
            if (!prod) return null;
            return (
              <div key={item.id} className="group bg-card border border-border/40 rounded-2xl overflow-hidden hover:border-primary/45 transition-all flex flex-col hover-scale">
                <Link href={`/products/${prod.id}`} className="block relative aspect-square bg-muted/20 p-4">
                  <img 
                    src={prod.images?.[0] || "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600"} 
                    alt={prod.name} 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
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
                        onClick={() => handleRemove(prod.id)}
                        className="p-2 border border-border/60 rounded-xl hover:bg-secondary/40 hover:text-destructive transition-all text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleAddToCart(prod.id, prod.discountPrice || prod.price)}
                        className="bg-primary hover:opacity-95 text-primary-foreground p-2 rounded-xl shadow-sm transition-all"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
