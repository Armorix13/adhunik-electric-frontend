import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import api from "../lib/api";
import { Trash2, ShoppingBag, ArrowRight, Ticket } from "lucide-react";

export default function Cart() {
  const { cart, updateCartItem, removeFromCart, token } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  const handleUpdateQty = async (itemId: string, qty: number) => {
    try {
      await updateCartItem(itemId, qty);
      toast("Cart updated");
    } catch (err: any) {
      toast("Could not update item quantity", "error");
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast("Item removed from cart");
    } catch (err: any) {
      toast("Could not remove item", "error");
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    try {
      const coupon = await api.coupons.validate(couponCode.trim(), cart?.total || 0);
      setValidatedCoupon(coupon);
      toast("Coupon applied successfully!");
    } catch (err: any) {
      toast(err.message || "Invalid or expired coupon", "error");
      setValidatedCoupon(null);
    } finally {
      setValidating(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold font-display">Please Sign In</h2>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">
          You must be logged in to access and manage your shopping cart.
        </p>
        <Link href="/login">
          <button className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm">
            Sign In Now
          </button>
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold font-display">Your Shopping Cart is Empty</h2>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">
          Add some high-voltage electrical equipment or tools to get started on your projects.
        </p>
        <Link href="/products">
          <button className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm">
            Browse Catalog
          </button>
        </Link>
      </div>
    );
  }

  // Calculate prices incorporating validated coupon
  let subtotal = cart.subtotal;
  let itemDiscount = cart.discount;
  let couponDiscount = 0;

  if (validatedCoupon) {
    if (validatedCoupon.type === "percentage") {
      couponDiscount = (subtotal - itemDiscount) * (validatedCoupon.value / 100);
      if (validatedCoupon.maxDiscount && couponDiscount > validatedCoupon.maxDiscount) {
        couponDiscount = validatedCoupon.maxDiscount;
      }
    } else {
      couponDiscount = validatedCoupon.value;
    }
  }

  const finalTotal = Math.max(0, subtotal - itemDiscount - couponDiscount);

  const handleCheckoutNavigation = () => {
    // Store coupon details in session/local storage for Checkout page use
    if (validatedCoupon) {
      localStorage.setItem("appliedCouponCode", validatedCoupon.code);
      localStorage.setItem("appliedCouponDiscount", String(couponDiscount));
    } else {
      localStorage.removeItem("appliedCouponCode");
      localStorage.removeItem("appliedCouponDiscount");
    }
    setLocation("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="space-y-2 mb-10">
        <h1 className="font-display text-3xl font-black text-foreground tracking-tight">Shopping Bag</h1>
        <p className="text-xs text-muted-foreground">Review your premium electrical gear and configure orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-card border border-border/30 rounded-[28px] p-5 flex flex-col sm:flex-row items-center gap-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.05)] hover:border-primary/20 transition-all duration-300">
              <div className="h-24 w-24 bg-secondary/20 border border-border/20 rounded-2xl p-2 flex items-center justify-center flex-shrink-0">
                <img 
                  src={item.productImage || "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300"} 
                  alt={item.productName} 
                  className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <h3 className="font-bold text-sm text-foreground line-clamp-1 leading-snug">{item.productName}</h3>
                <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                  {item.discountPrice ? (
                    <>
                      <span className="text-primary font-bold">${item.discountPrice.toFixed(2)}</span>
                      <span className="line-through font-light">${item.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center border border-border/50 rounded-full bg-secondary/20 p-0.5">
                <button 
                  onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-card hover:shadow-sm rounded-full transition-all cursor-pointer text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-foreground min-w-[24px] text-center">{item.quantity}</span>
                <button 
                  onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-card hover:shadow-sm rounded-full transition-all cursor-pointer text-sm font-bold"
                >
                  +
                </button>
              </div>

              <div className="text-right flex items-center sm:flex-col gap-4 sm:gap-1.5 ml-0 sm:ml-auto">
                <span className="font-black text-sm text-primary min-w-[80px]">
                  ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                </span>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-rose-500/10 rounded-full transition-colors cursor-pointer"
                  title="Remove from Cart"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border/30 rounded-[28px] p-6 space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
            <h3 className="font-display font-bold text-base border-b border-border/30 pb-3 text-foreground">Order Summary</h3>
            
            <div className="space-y-3.5 text-xs text-muted-foreground">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              {itemDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Product Savings</span>
                  <span>-${itemDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Coupon Discount ({validatedCoupon?.code})</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Estimated Shipping</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
              </div>
              
              <div className="border-t border-border/30 pt-4 flex justify-between text-sm font-black text-foreground">
                <span>Total Bill</span>
                <span className="text-primary text-base">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo code application */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 border-t border-border/30 pt-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Apply Promo Coupon</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!validatedCoupon}
                    className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 pl-9 text-xs focus:outline-none focus:border-primary/50 uppercase text-foreground font-mono font-bold"
                  />
                  <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {validatedCoupon ? (
                  <button
                    type="button"
                    onClick={() => { setValidatedCoupon(null); setCouponCode(""); }}
                    className="border border-border text-xs px-4 rounded-xl hover:bg-secondary/40 hover:text-foreground transition-all font-bold cursor-pointer text-muted-foreground"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={validating || !couponCode}
                    className="bg-primary hover:opacity-95 text-primary-foreground text-xs font-bold px-4 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {validating ? "..." : "Apply"}
                  </button>
                )}
              </div>
            </form>

            <button
              onClick={handleCheckoutNavigation}
              className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-xs"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
