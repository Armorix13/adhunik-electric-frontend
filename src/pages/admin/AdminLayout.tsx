import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../contexts/auth-context";
import { useToast } from "../../components/ui/toast";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Package, FolderKanban, Award, ShoppingBag,
  Users, Image, Tag, ArrowLeft, LogOut, ShieldAlert, Sun, Moon
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Mobile navigation state
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        toast("Please log in to access admin console", "error");
        setLocation("/login");
      } else if (user && user.role !== "admin" && user.role !== "staff") {
        toast("Access denied. Admin permissions required.", "error");
        setLocation("/");
      }
    }
  }, [isLoading, token, user, setLocation, toast]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderKanban },
    { href: "/admin/brands", label: "Brands", icon: Award },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/banners", label: "Banners", icon: Image },
    { href: "/admin/coupons", label: "Coupons", icon: Tag },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!token || (user && user.role !== "admin" && user.role !== "staff")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Header (only visible on mobile screens) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-card border-b border-border/40 sticky top-0 z-40">
        <Link href="/" className="flex items-center space-x-1.5">
          <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            New
          </span>
          <span className="font-display text-base font-bold tracking-tight text-primary">
            Adhunik<span className="text-foreground font-light">Electric</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 border border-border/80 rounded-xl text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 border border-border/80 rounded-xl text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-card border-r border-border/50 flex flex-col justify-between p-6 z-50 transition-transform duration-300 md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="space-y-8">
          {/* Logo / Header */}
          <div className="hidden md:flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-1.5">
              <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                New
              </span>
              <span className="font-display text-base font-bold tracking-tight text-primary">
                Adhunik<span className="text-foreground font-light">Electric</span>
              </span>
              <span className="text-[8px] bg-accent/15 border border-accent/20 text-accent font-bold px-1.5 py-0.5 rounded uppercase">
                Admin
              </span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}>
                    <item.icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info footer */}
        <div className="pt-6 border-t border-border/40 mt-8 space-y-4">
          <div className="flex items-center space-x-3 text-xs">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate text-foreground">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground truncate font-mono">{user?.role}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <div className="w-full border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-all py-2 rounded-xl text-[10px] font-bold text-center flex items-center justify-center gap-1 cursor-pointer">
                <ArrowLeft className="h-3 w-3" /> Store
              </div>
            </Link>
            <button onClick={toggleTheme} className="hidden md:block p-2 border border-border/85 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer text-muted-foreground">
              {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-yellow-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <button onClick={logout} className="p-2 border border-border/85 hover:text-destructive hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer text-muted-foreground">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
