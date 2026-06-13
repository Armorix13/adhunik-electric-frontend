import { createContext, useContext, useState, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm animate-slide-in backdrop-blur-md ${
              t.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : t.type === "error"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
            }`}
          >
            <div className="flex items-center space-x-3">
              {t.type === "success" && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              {t.type === "info" && <Info className="h-5 w-5 flex-shrink-0" />}
              <span className="font-medium">{t.message}</span>
            </div>
            <button onClick={() => remove(t.id)} className="ml-4 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">
              <X className="h-4 w-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
