import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Páginas públicas
import Home from "@/pages/Home";
import Tours from "@/pages/Tours";
import TourDetail from "@/pages/TourDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import PaymentConfirmation from "@/pages/PaymentConfirmation";
import Contact from "@/pages/Contact";

// Páginas admin
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import AdminTours from "@/pages/admin/AdminTours";
import AdminSessions from "@/pages/admin/AdminSessions";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminUsers from "@/pages/admin/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rutas públicas con Navbar y Footer ─────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/confirmation/:confirmationCode"
            element={<PaymentConfirmation />}
          />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* ── Rutas admin (sin Navbar público) ───────────────── */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tours" element={<AdminTours />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
