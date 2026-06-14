import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../contexts/auth-context";
import { useTheme } from "next-themes";
import { 
  ShoppingBag, Heart, User, Sun, Moon, Search, Menu, X, LogOut, LayoutDashboard 
} from "lucide-react";

export default function Navbar() {
  const { user, logout, cartCount } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="glass-header shadow-sm border-b border-border/40 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              {/* Ms badge */}
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/25 text-primary-foreground font-display font-black text-sm tracking-tight select-none group-hover:shadow-primary/40 transition-shadow">
                Ms
              </span>
              {/* Lightning bolt */}
              <svg className="hidden sm:block h-4 w-4 text-primary/70" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13 2L4.09 12.97H11L10 22l8.91-10.97H13L14 2z" />
              </svg>
              {/* Brand name */}
              <span className="font-display text-base sm:text-xl font-extrabold tracking-tight text-foreground leading-none">
                Adhunik<span className="text-primary font-medium"> Electric</span>
              </span>
            </Link>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search premium electrical equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/40 text-foreground border border-border/50 rounded-full px-5 py-2 pl-12 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <Search className="absolute left-4 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`text-sm font-medium hover:text-primary transition-colors ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
              Home
            </Link>
            <Link href="/products" className={`text-sm font-medium hover:text-primary transition-colors ${location.startsWith("/products") ? "text-primary" : "text-muted-foreground"}`}>
              Shop Catalog
            </Link>
            
            {user?.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium text-accent hover:opacity-90 flex items-center gap-1 transition-opacity">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2.5 text-muted-foreground hover:text-primary transition-colors focus:outline-none">
              {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2.5 text-muted-foreground hover:text-primary transition-colors">
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 text-muted-foreground hover:text-primary transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown/Button */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 p-1.5 hover:text-primary transition-colors">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium hidden lg:inline-block max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-1">
            <button onClick={toggleTheme} className="p-2 text-muted-foreground">
              {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <Link href="/cart" className="relative p-2 text-muted-foreground">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-muted-foreground focus:outline-none">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border/80 px-3 pt-2 pb-6 space-y-3 w-full overflow-hidden">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/50 text-foreground border border-border/50 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          </form>

          <Link href="/" className="block py-2 text-base font-medium text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="/products" className="block py-2 text-base font-medium text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            Shop Catalog
          </Link>
          <Link href="/wishlist" className="block py-2 text-base font-medium text-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            Wishlist
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="block py-2 text-base font-medium text-accent" onClick={() => setMobileMenuOpen(false)}>
              Admin Dashboard
            </Link>
          )}

          <div className="border-t border-border/60 pt-4 mt-4">
            {user ? (
              <div className="flex items-center justify-between">
                <Link href="/profile" className="flex items-center space-x-2 text-base font-medium" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>{user.name}</span>
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-destructive font-medium flex items-center space-x-1">
                  <LogOut className="h-4.5 w-4.5" /> <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="block w-full text-center bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
