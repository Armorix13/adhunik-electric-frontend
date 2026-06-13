import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import api from "../lib/api";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import { Heart, ShoppingBag, Star, Zap, Shield, ArrowLeft } from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id || "";
  const { addToCart, addToWishlist, token } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      setLoading(true);
      try {
        const [p, r] = await Promise.all([
          api.products.get(productId),
          api.reviews.listForProduct(productId)
        ]);
        setProduct(p);
        setReviews(r || []);
        setActiveImage(0); // reset active image on load
      } catch (err: any) {
        toast("Failed to load product details", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId, toast]);

  const handleAddToCart = async () => {
    if (!token) {
      toast("Please login to add items to your cart", "error");
      return;
    }
    try {
      await addToCart(product.id, quantity, product.discountPrice || product.price);
      toast("Added to cart successfully!");
    } catch (err: any) {
      toast(err.message || "Failed to add to cart", "error");
    }
  };

  const handleAddWishlist = async () => {
    if (!token) {
      toast("Please login to manage your wishlist", "error");
      return;
    }
    try {
      await addToWishlist(product.id);
      toast("Added to wishlist successfully!");
    } catch (err: any) {
      toast(err.message || "Could not add to wishlist", "error");
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast("Please login to submit reviews", "error");
      return;
    }
    if (!comment.trim()) {
      toast("Please enter a comment", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      const newReview = await api.reviews.create({
        productId: product.id,
        rating,
        comment
      });
      setReviews((prev) => [newReview, ...prev]);
      setComment("");
      setRating(5);
      toast("Review submitted successfully!");
    } catch (err: any) {
      toast(err.message || "Could not post review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <Link href="/products" className="text-primary hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const inStock = product.stockQty > 0;
  const productImages = product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="flex flex-col space-y-4">
          <div className="bg-card border border-border/40 rounded-3xl p-8 flex items-center justify-center aspect-square shadow-sm max-h-[480px]">
            <img 
              src={productImages[activeImage]} 
              alt={product.name} 
              className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300"
            />
          </div>
          {/* Thumbnails Row */}
          {productImages.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-1">
              {productImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-20 w-20 rounded-xl bg-card border p-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    activeImage === idx 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border/60 hover:border-primary/50"
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`thumbnail ${idx}`} 
                    className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">{product.brandName || "Industrial"}</span>
            <h1 className="font-display text-3xl font-extrabold text-foreground leading-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground font-light">SKU: {product.sku || "N/A"}</p>
          </div>

          {/* Ratings */}
          <div className="flex items-center space-x-3 pb-2 border-b border-border/40">
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4.5 w-4.5 ${i < Math.round(product.avgRating || 0) ? "fill-current" : "opacity-30"}`} 
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.avgRating ? product.avgRating.toFixed(1) : "No rating"}</span>
            <span className="text-xs text-muted-foreground">({reviews.length} customer reviews)</span>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            {product.discountPrice ? (
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-primary">${product.discountPrice.toFixed(2)}</span>
                <span className="text-lg text-muted-foreground line-through font-light">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-3xl font-black text-foreground">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-muted-foreground">Quantity:</span>
              <div className="flex items-center border border-border/60 rounded-xl bg-card">
                <button 
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="px-3 py-1.5 text-foreground hover:bg-secondary/40 rounded-l-xl disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 text-sm font-semibold">{quantity}</span>
                <button 
                  disabled={quantity >= product.stockQty}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-foreground hover:bg-secondary/40 rounded-r-xl disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">({product.stockQty} items available)</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                disabled={!inStock}
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:opacity-95 text-primary-foreground font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ShoppingBag className="h-5 w-5" /> {inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                onClick={handleAddWishlist}
                className="p-4 border border-border/60 rounded-xl hover:bg-secondary/40 text-muted-foreground hover:text-primary transition-all flex items-center justify-center"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Logistics Indicators */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Express Delivery</p>
                <p className="text-muted-foreground">Dispatched within 24 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Warranty Assured</p>
                <p className="text-muted-foreground">Official manufacturer coverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-border/40 pt-12">
        
        {/* Specifications */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="font-display text-xl font-bold">Technical Specifications</h2>
          <div className="border border-border/40 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <tbody>
                {product.specifications && Object.entries(product.specifications).map(([key, val]: any, i) => (
                  <tr key={key} className={i % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                    <td className="px-4 py-3 font-semibold text-muted-foreground w-1/3 border-b border-border/30">{key}</td>
                    <td className="px-4 py-3 text-foreground border-b border-border/30">{val}</td>
                  </tr>
                ))}
                {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                  <tr>
                    <td className="px-4 py-4 text-center text-muted-foreground italic">No specifications listed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="font-display text-xl font-bold">Customer Reviews ({reviews.length})</h2>
          
          {/* Review Submission Form */}
          {token ? (
            <form onSubmit={handleAddReview} className="bg-card border border-border/40 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-display font-bold text-sm">Submit your review</h3>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-muted-foreground">Your Rating:</span>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      className="focus:outline-none hover:scale-110 transition-transform p-0.5"
                    >
                      <Star className={`h-5 w-5 ${i < rating ? "fill-current" : "opacity-30"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience with this equipment..."
                  className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-sm disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <div className="bg-secondary/20 rounded-2xl p-6 text-center text-sm border border-border/40">
              Please <Link href="/login" className="text-primary font-semibold hover:underline">sign in</Link> to leave a product review.
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-card border border-border/30 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{rev.userName || "Customer"}</h4>
                    <span className="text-[10px] text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-current" : "opacity-30"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{rev.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4">No reviews have been written for this product yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
