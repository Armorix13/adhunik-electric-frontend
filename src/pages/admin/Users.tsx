import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/ui/toast";

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await api.users.list();
      setUsers(u || []);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await api.users.update(userId, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast("User role updated");
    } catch {
      toast("Could not update role", "error");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-0.5">
        <h1 className="font-display text-2xl font-extrabold text-foreground">Registered Users</h1>
        <p className="text-xs text-muted-foreground">Manage user base roles and system permissions level.</p>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/20 border-b border-border/40">
              <th className="p-4 font-bold text-muted-foreground uppercase">Name</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Email</th>
              <th className="p-4 font-bold text-muted-foreground uppercase">Role</th>
              <th className="p-4 font-bold text-muted-foreground uppercase text-right">Update Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/10">
                <td className="p-4 font-bold text-foreground">{u.name}</td>
                <td className="p-4 text-muted-foreground font-mono">{u.email}</td>
                <td className="p-4 uppercase font-semibold text-[10px] tracking-wider text-foreground">{u.role}</td>
                <td className="p-4 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                    className="bg-secondary/40 border border-border/60 rounded-xl px-2.5 py-1.5 focus:outline-none text-[11px] font-bold cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
