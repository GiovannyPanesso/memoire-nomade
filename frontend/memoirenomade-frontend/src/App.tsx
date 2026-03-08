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
import AdminLayout from "./components/AdminLayout";
import AdminTourForm from "./pages/admin/AdminTourForm";

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

          <Route
            path="dashboard"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />

          <Route
            path="tours"
            element={
              <AdminLayout>
                <AdminTours />
              </AdminLayout>
            }
          />

          <Route
            path="tours/new"
            element={
              <AdminLayout>
                <AdminTourForm />
              </AdminLayout>
            }
          />

          <Route
            path="tours/:id/edit"
            element={
              <AdminLayout>
                <AdminTourForm />
              </AdminLayout>
            }
          />

          <Route
            path="sessions"
            element={
              <AdminLayout>
                <AdminSessions />
              </AdminLayout>
            }
          />

          <Route
            path="bookings"
            element={
              <AdminLayout>
                <AdminBookings />
              </AdminLayout>
            }
          />

          <Route
            path="messages"
            element={
              <AdminLayout>
                <AdminMessages />
              </AdminLayout>
            }
          />

          <Route
            path="users"
            element={
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            }
          />
        </Route>

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
