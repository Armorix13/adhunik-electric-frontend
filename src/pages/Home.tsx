import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import { 
  ArrowRight, Zap, Shield, Wrench, Heart, Eye, ChevronRight, Star,
  Award, ShieldCheck, Mail, Sparkles, CheckCircle2, ChevronLeft
} from "lucide-react";

export default function Home() {
  const { addToWishlist, token } = useAuth();
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [b, c, p, br] = await Promise.all([
          api.banners.list(),
          api.categories.list(),
          api.products.getFeatured(),
          api.brands.list()
        ]);
        setBanners(b || []);
        setCategories(c || []);
        setFeaturedProducts(p || []);
        setBrands(br || []);
      } catch (err: any) {
        toast(err.message || "Failed to load shop data", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [toast]);

  // Autoplay banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest animate-pulse">Loading Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* 1. HERO CAROUSEL */}
      {banners.length > 0 && (
        <section className="relative h-[500px] md:h-[650px] overflow-hidden bg-[#141312]">
          {/* Subtle grid background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-10" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(rgba(20, 19, 18, 0.4), rgba(20, 19, 18, 0.75)), url(${banners[currentBanner].imageUrl})` }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="max-w-3xl space-y-6">
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded-full"
                  >
                    <Sparkles className="h-3 w-3 animate-spin" /> PRO INDUSTRIAL CATALOG
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
                  >
                    {banners[currentBanner].title.split(" ").map((word: string, i: number) => {
                      if (word.toLowerCase() === "projects" || word.toLowerCase() === "automation" || word.toLowerCase() === "cables") {
                        return <span key={i} className="text-primary font-black block sm:inline">{word} </span>;
                      }
                      return word + " ";
                    })}
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-base sm:text-lg md:text-xl text-gray-300 font-light max-w-2xl leading-relaxed"
                  >
                    {banners[currentBanner].subtitle}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-2 flex flex-wrap gap-4"
                  >
                    <Link href={banners[currentBanner].linkUrl || "/products"}>
                      <button className="bg-primary hover:opacity-95 text-primary-foreground font-semibold px-8 py-4 rounded-full flex items-center gap-3 transition-all shadow-lg shadow-primary/25 cursor-pointer hover:translate-y-[-2px] duration-300 group text-sm">
                        Shop Collection <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Left/Right controls */}
          <button 
            onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`h-2.5 rounded-full transition-all duration-500 ${currentBanner === i ? "w-10 bg-primary" : "w-2.5 bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. LOGO MARQUEE (Curated Brands) */}
      {brands.length > 0 && (
        <section className="py-8 bg-card border-b border-border/40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-extrabold mb-6">AUTHORIZED INDUSTRIAL DISTRIBUTOR</p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60 dark:opacity-85">
              {brands.map((b) => (
                <div key={b.id} className="text-sm font-display font-extrabold tracking-wider hover:text-primary transition-colors hover:scale-105 duration-300">
                  {b.name.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. CORE BENEFITS */}
      <section className="py-20 bg-secondary/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: ShieldCheck, 
                title: "Certified Commercial Grade", 
                desc: "All equipment strictly complies with heavy duty industrial specs, ensuring maximum project longevity." 
              },
              { 
                icon: Award, 
                title: "25+ Years of Contractor Trust", 
                desc: "Supplying top electrical contractors across the region with fast distribution pipelines and bulk pricing." 
              },
              { 
                icon: Wrench, 
                title: "Master Electrician Advisory", 
                desc: "Direct support channels with engineering advice to specify components and build breaker boxes safely." 
              }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-card border border-border/30 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED CATEGORIES HIGHLIGHT */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-display font-black text-foreground">Explore Categories</h2>
            <p className="text-sm text-muted-foreground">Select a classification below to configure and procurement gear.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`}>
                <div className="group bg-card border border-border/40 rounded-3xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-sm flex flex-col h-full hover-scale">
                  <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                    <img 
                      src={cat.imageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-xs font-bold flex items-center gap-1">Browse Catalog <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">{cat.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{cat.description || "Browse components"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOP INDUSTRIAL GEAR GRID */}
      <section className="py-24 bg-secondary/15 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex justify-between items-end border-b border-border/30 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Trending Products</span>
              <h2 className="text-3xl font-display font-black text-foreground">Featured Professional Equipment</h2>
            </div>
            <Link href="/products" className="text-primary hover:opacity-90 font-bold text-sm flex items-center gap-1.5 transition-opacity">
              View Complete Catalog <ArrowRight className="h-4.5 w-4.5 animate-pulse" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="group bg-card border border-border/40 rounded-3xl overflow-hidden hover:border-primary/45 hover:shadow-md transition-all flex flex-col hover-scale">
                <Link href={`/products/${prod.id}`} className="block relative aspect-square bg-muted/10 p-5">
                  <img 
                    src={prod.images?.[0] || "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600"} 
                    alt={prod.name} 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-500"
                  />
                  {prod.discountPrice && (
                    <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                      SALE
                    </span>
                  )}
                </Link>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest">
                      <span>{prod.brandName || "Industrial"}</span>
                      {prod.avgRating && (
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="h-3 w-3 fill-current" /> {prod.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${prod.id}`}>
                      <h3 className="font-display font-bold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-snug">
                        {prod.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/45 flex items-center justify-between">
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
                        className="p-2.5 border border-border/60 rounded-2xl hover:bg-secondary/40 hover:text-primary transition-all text-muted-foreground"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                      <Link href={`/products/${prod.id}`}>
                        <button className="bg-primary hover:opacity-95 text-primary-foreground px-4.5 py-2.5 rounded-2xl text-xs font-bold shadow-sm transition-all cursor-pointer">
                          Configure
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROMO GRID BANNERS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-[#1c1a17] text-white rounded-3xl p-10 flex flex-col justify-between h-[300px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500)' }} />
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] bg-primary/80 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Breaker Vaults</span>
              <h3 className="font-display text-2xl font-black">Industrial Circuit breakers</h3>
              <p className="text-xs text-gray-300 max-w-xs leading-relaxed font-light">Schneider & ABB heavy-duty double/quadruple pole MCBs up to 63A.</p>
            </div>
            <div className="relative z-10">
              <Link href="/products?categoryId=circuit-breakers">
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-all">
                  Shop MCBs <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1c1a17] text-white rounded-3xl p-10 flex flex-col justify-between h-[300px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1573164574511-73c773193279?w=500)' }} />
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] bg-accent/80 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Coil Cables</span>
              <h3 className="font-display text-2xl font-black">Polycab FR PVC Cables</h3>
              <p className="text-xs text-gray-300 max-w-xs leading-relaxed font-light">Flame retardant house wiring and armored cables for engineering projects.</p>
            </div>
            <div className="relative z-10">
              <Link href="/products?categoryId=cables-wires">
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-all">
                  Shop Cables <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQS Accordion (Contractor support Q&A) */}
      <section className="py-24 bg-card border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-black">Frequently Answered Questions</h2>
            <p className="text-sm text-muted-foreground">General information on bulk sales, commercial accounts, and logistics.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "How long does shipping take for heavy automation products?", a: "Most in-stock items are dispatched from our distribution center within 24 hours. Transit averages 2-4 business days depending on load volume." },
              { q: "Do you offer wholesale bulk discounts for commercial developers?", a: "Yes. Registered commercial accounts with valid tax registrations are eligible for bulk rates, direct dispatch lines, and custom quote configuration models." },
              { q: "Can I return circuit breakers or custom cables if ordered incorrectly?", a: "Unused products in their original factory seal can be returned within 14 days of purchase. Custom cut-to-length cable coils are non-returnable." }
            ].map((faq, idx) => (
              <div key={idx} className="border border-border/50 rounded-2xl overflow-hidden bg-secondary/10">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-display font-bold text-sm text-foreground focus:outline-none hover:bg-secondary/25 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-primary text-lg font-light leading-none">{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-muted-foreground font-light leading-relaxed border-t border-border/30 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. NEWSLETTER */}
      <section className="py-24 bg-[#141312] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">Stay updated with VoltEdge Industrial</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">Get notified of pricing fluctuations, new brand directories, and wholesale clearance events.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); toast("Subscribed successfully!"); }} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="email"
                required
                placeholder="Enter your commercial email..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 pl-11 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
              />
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
            </div>
            <button type="submit" className="bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-6 py-3 rounded-full transition-all flex items-center justify-center gap-1">
              Join Newsletter <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="flex justify-center items-center gap-6 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> NO SPAM</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> SECURE DATAPROTECTION</span>
          </div>
        </div>
      </section>

    </div>
  );
}
