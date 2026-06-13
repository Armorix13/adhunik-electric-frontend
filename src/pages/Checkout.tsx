import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import api from "../lib/api";
import { ShoppingBag, CreditCard, Landmark, CheckCircle } from "lucide-react";

export default function Checkout() {
  const { cart, user, clearCart } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Retrieve coupon configurations if stored in local storage
  const couponCode = localStorage.getItem("appliedCouponCode") || undefined;
  const couponDiscount = Number(localStorage.getItem("appliedCouponDiscount") || "0");

  // Shipping details form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod or card
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-display">No Checkout Items Found</h2>
        <Link href="/products" className="text-primary hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const itemDiscount = cart.discount;
  const total = Math.max(0, subtotal - itemDiscount - couponDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address || !city || !pincode) {
      toast("Please fill in all mandatory fields", "error");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const orderItems = cart.items.map(item => ({
        product: item.productId,
        productName: item.productName,
        productImage: item.productImage || undefined,
        quantity: item.quantity,
        price: item.discountPrice || item.price
      }));

      await api.orders.create({
        customerName: name,
        customerEmail: email,
        phone,
        address,
        city,
        pincode,
        notes: notes || undefined,
        paymentMethod,
        subtotal,
        discount: itemDiscount + couponDiscount,
        total,
        couponCode,
        items: orderItems
      });

      toast("Order placed successfully! A confirmation email has been sent.");
      
      // Clean up session coupon states
      localStorage.removeItem("appliedCouponCode");
      localStorage.removeItem("appliedCouponDiscount");
      
      // Clear react context cart state
      await clearCart();
      
      // Redirect
      setLocation("/orders");
    } catch (err: any) {
      toast(err.message || "Failed to place order", "error");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="space-y-2 mb-10">
        <h1 className="font-display text-3xl font-black text-foreground tracking-tight">Secure Checkout</h1>
        <p className="text-xs text-muted-foreground">Confirm shipping coordinates and complete your premium hardware acquisition.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/30 rounded-[28px] p-6 space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
            <h3 className="font-display font-bold text-base border-b border-border/30 pb-3 text-foreground">Delivery Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-foreground font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-foreground font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-foreground font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Pincode *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-foreground font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Shipping Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Suite, building number, street name..."
                className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-foreground font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-foreground font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Order Note (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gate code, delivery instructions..."
                  className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-foreground font-medium"
                />
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-card border border-border/30 rounded-[28px] p-6 space-y-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
            <h3 className="font-display font-bold text-base border-b border-border/30 pb-3 text-foreground">Payment Options</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COD */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`border rounded-2xl p-5 flex items-center space-x-4 cursor-pointer transition-all duration-300 ${
                  paymentMethod === "cod" 
                    ? "border-primary bg-primary/5 text-primary shadow-sm" 
                    : "border-border/60 hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Landmark className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground">Cash On Delivery</p>
                  <p className="text-[10px] font-light mt-0.5">Pay at your doorstep on receipt</p>
                </div>
              </div>

              {/* Card */}
              <div
                onClick={() => setPaymentMethod("card")}
                className={`border rounded-2xl p-5 flex items-center space-x-4 cursor-pointer transition-all duration-300 ${
                  paymentMethod === "card" 
                    ? "border-primary bg-primary/5 text-primary shadow-sm" 
                    : "border-border/60 hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground">Credit / Debit Card</p>
                  <p className="text-[10px] font-light mt-0.5">Secure gateway with 256-bit SSL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Breakdown Panel */}
        <div className="space-y-6">
          <div className="bg-card border border-border/30 rounded-[28px] p-6 space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
            <h3 className="font-display font-bold text-base border-b border-border/30 pb-3 text-foreground">Checkout Items</h3>
            
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 divide-y divide-border/20">
              {cart.items.map((it) => (
                <div key={it.id} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-bold truncate text-foreground leading-tight">{it.productName}</p>
                    <p className="text-[10px] text-muted-foreground font-light">Qty: {it.quantity}</p>
                  </div>
                  <span className="font-bold text-foreground">${((it.discountPrice || it.price) * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/30 pt-4 space-y-3 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              {(itemDiscount + couponDiscount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Total Savings</span>
                  <span>-${(itemDiscount + couponDiscount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
              </div>
              
              <div className="border-t border-border/30 pt-4 flex justify-between text-sm font-black text-foreground">
                <span>Total Due</span>
                <span className="text-primary text-base">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlacingOrder}
              className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer text-xs"
            >
              {isPlacingOrder ? "Placing Order..." : "Confirm & Place Order"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
