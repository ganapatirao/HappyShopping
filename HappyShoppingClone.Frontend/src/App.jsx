import { Routes, Route } from 'react-router-dom'
import Header from './features/shared/layout/Header'
import Footer from './features/shared/layout/Footer'
import Home from './features/shopping/Home'
import Shopping from './features/shopping/Shopping'
import ProductDetail from './features/shopping/ProductDetail'
import AdminDashboard from './features/admin/Dashboard'
import Cart from './features/shopping/Cart'
import SiteConfiguration from './features/admin/site-config/SiteConfiguration'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import ForgotPassword from './features/auth/ForgotPassword'
import UserDashboard from './features/user/Dashboard'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './styles/App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/configuration" element={<SiteConfiguration />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<UserDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
