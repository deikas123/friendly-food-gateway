import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Critical pages loaded immediately
const Home = lazy(() => import("@/pages/Index"));

// Less critical pages with delayed loading
const Shop = lazy(() => import("@/pages/Shop"));
const About = lazy(() => import("@/pages/About"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Category = lazy(() => import("@/pages/Category"));

// Auth pages
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));

// User pages
const Profile = lazy(() => import("@/pages/Profile"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const LoyaltyPage = lazy(() => import("@/pages/Loyalty"));

// Feature pages
const FoodBaskets = lazy(() => import("@/pages/FoodBaskets"));
const AutoReplenish = lazy(() => import("@/pages/AutoReplenish"));
const PayLater = lazy(() => import("@/pages/PayLater"));

// Admin and staff routes
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const DeliveryRoutes = lazy(() => import("./DeliveryRoutes"));
const StaffRoutes = lazy(() => import("./StaffRoutes"));

// Other pages
const NotFound = lazy(() => import("@/pages/NotFound"));
import Timer from "@/pages/Timer";

// Optimized loading fallback
const FastLoadingFallback = () => (
  <div className="flex flex-col min-h-screen">
    <div className="h-20 bg-background border-b animate-pulse" />
    <main className="flex-grow pt-8 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="h-6 bg-muted rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </main>
    <div className="h-20 bg-background border-t animate-pulse" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<FastLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/categories/:slug" element={<Category />} />
        <Route path="/food-baskets" element={<FoodBaskets />} />
        <Route path="/auto-replenish" element={<AutoReplenish />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/loyalty" element={<LoyaltyPage />} />
        <Route path="/pay-later" element={<PayLater />} />
        <Route path="/timer" element={<Timer />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Delivery Routes */}
        <Route path="/delivery/*" element={<DeliveryRoutes />} />
        
        {/* Staff Routes */}
        <Route path="/staff/*" element={<StaffRoutes />} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
