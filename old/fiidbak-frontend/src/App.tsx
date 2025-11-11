import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { CreateProductPage } from './pages/CreateProductPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/create-product" element={<CreateProductPage />} />
      </Routes>
    </Layout>
  )
}

export default App
