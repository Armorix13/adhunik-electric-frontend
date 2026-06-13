import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import api, { setToken } from "../lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  discountPrice: number | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  cart: Cart | null;
  cartCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  logout: () => void;
  addToCart: (productId: string, quantity: number, price: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const u = await api.users.getMe();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      setTokenState(null);
      setToken("");
      return null;
    }
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const c = await api.cart.get();
      setCart(c);
    } catch {
      setCart(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchMe().then(u => {
        if (u) fetchCart();
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, fetchMe, fetchCart]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    await fetchCart();
  }, [fetchCart]);

  const register = useCallback(async (email: string, password: string, name?: string, phone?: string) => {
    const data = await api.auth.register({ email, password, name, phone });
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    await fetchCart();
  }, [fetchCart]);

  const logout = useCallback(() => {
    setToken("");
    setTokenState(null);
    setUser(null);
    setCart(null);
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number, price: number) => {
    if (!token) throw new Error("Please login to add to cart");
    const data = await api.cart.add({ productId, quantity, price });
    setCart(data);
  }, [token]);

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (!token) return;
    const data = await api.cart.update(itemId, quantity);
    setCart(data);
  }, [token]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!token) return;
    const data = await api.cart.remove(itemId);
    setCart(data);
  }, [token]);

  const clearCart = useCallback(async () => {
    if (!token) return;
    const data = await api.cart.sync([]);
    setCart(data);
  }, [token]);

  const refetchCart = useCallback(async () => {
    if (token) await fetchCart();
  }, [token, fetchCart]);

  const addToWishlist = useCallback(async (productId: string) => {
    if (!token) throw new Error("Please login to add to wishlist");
    await api.wishlist.add(productId);
  }, [token]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!token) return;
    await api.wishlist.remove(productId);
  }, [token]);

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, cart, cartCount,
      login, register, logout,
      addToCart, updateCartItem, removeFromCart, clearCart, refetchCart,
      addToWishlist, removeFromWishlist
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
