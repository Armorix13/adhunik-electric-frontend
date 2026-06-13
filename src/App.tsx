import { Switch, Route } from "wouter";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/auth-context";
import { ToastProvider } from "./components/ui/toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Customer pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/Products";
import CategoriesAdmin from "./pages/admin/Categories";
import BrandsAdmin from "./pages/admin/Brands";
import OrdersAdmin from "./pages/admin/Orders";
import UsersAdmin from "./pages/admin/Users";
import BannersAdmin from "./pages/admin/Banners";
import CouponsAdmin from "./pages/admin/Coupons";

function Router() {
  return (
    <Switch>
      {/* Auth pages without full layout */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Admin Panel Routes */}
      <Route path="/admin">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout>
          <ProductsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/categories">
        <AdminLayout>
          <CategoriesAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/brands">
        <AdminLayout>
          <BrandsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout>
          <OrdersAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout>
          <UsersAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/banners">
        <AdminLayout>
          <BannersAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/coupons">
        <AdminLayout>
          <CouponsAdmin />
        </AdminLayout>
      </Route>

      {/* Main site pages */}
      <Route>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/products" component={Products} />
              <Route path="/products/:id" component={ProductDetail} />
              <Route path="/cart" component={Cart} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/orders" component={Orders} />
              <Route path="/wishlist" component={Wishlist} />
              <Route path="/profile" component={Profile} />
              <Route>
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                  <h2 className="text-xl font-bold">404 - Page Not Found</h2>
                  <p className="text-muted-foreground text-sm mt-2">The requested industrial catalog resource could not be found.</p>
                </div>
              </Route>
            </Switch>
          </main>
          <Footer />
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ToastProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
