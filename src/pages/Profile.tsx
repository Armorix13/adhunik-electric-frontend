import { useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { useToast } from "../components/ui/toast";
import api from "../lib/api";
import { User, Phone, Mail, Calendar, Key } from "lucide-react";

export default function Profile() {
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.users.updateMe({ name, phone });
      toast("Profile updated successfully!");
    } catch (err: any) {
      toast("Could not update profile information", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-card border border-border/40 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display text-2xl font-bold">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{user?.name}</h1>
            <span className="inline-block px-3 py-1 bg-secondary text-[10px] uppercase font-bold tracking-wider rounded-full mt-1.5">
              {user?.role} ACCOUNT
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-border/40">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary/50"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address (Read-Only)</label>
            <div className="relative">
              <input
                type="email"
                readOnly
                value={user?.email || ""}
                className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none opacity-60 cursor-not-allowed"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Phone Number</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-secondary/35 border border-border/60 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-primary/50"
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:opacity-95 text-primary-foreground font-semibold py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 mt-4"
          >
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
