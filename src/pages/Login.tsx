import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import { Mail, Key, ShieldAlert } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please enter both email and password", "error");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast("Signed in successfully!");
      setLocation("/");
    } catch (err: any) {
      toast(err.message || "Invalid credentials. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-background">
      <div className="max-w-md w-full bg-card border border-border/40 rounded-3xl p-8 space-y-6 shadow-sm">

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-foreground">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">Sign in to configure orders, sync carts, and manage wishlists.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary/50"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary/50"
              />
              <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 mt-6"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center space-y-4 pt-4 border-t border-border/30 text-xs">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Create one now
            </Link>
          </p>

          <div className="bg-secondary/20 rounded-xl p-3 text-left space-y-1">
            <p className="font-bold flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-primary" /> Admin Test Credentials</p>
            <p className="text-[10px] text-muted-foreground">Email: <strong>admin@voltedge.com</strong></p>
            <p className="text-[10px] text-muted-foreground">Password: <strong>admin123</strong></p>
          </div>
        </div>

      </div>
    </div>
  );
}
