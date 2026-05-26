import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import LoadingScreen from './components/effects/LoadingScreen.jsx';
import MouseGlow from './components/effects/MouseGlow.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Hero from './components/sections/Hero.jsx';
import Marquee from './components/sections/Marquee.jsx';
import CategoryGrid from './components/sections/CategoryGrid.jsx';
import ProductGrid from './components/sections/ProductGrid.jsx';
import BrandStory from './components/sections/BrandStory.jsx';
import Craftsmanship from './components/sections/Craftsmanship.jsx';
import Testimonials from './components/sections/Testimonials.jsx';
import InstagramGallery from './components/sections/InstagramGallery.jsx';
import Newsletter from './components/sections/Newsletter.jsx';
import ProductViewModal from './components/ui/ProductViewModal.jsx';
import CartDrawer from './components/ui/CartDrawer.jsx';
import SearchOverlay from './components/ui/SearchOverlay.jsx';
import AuthModal from './components/ui/AuthModal.jsx';

export default function App() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <LoadingScreen />
        <MouseGlow />
        <div className="relative min-h-screen overflow-x-hidden bg-obsidian text-cream">
          <Navbar
            onSearchOpen={() => setSearchOpen(true)}
            onAuthOpen={() => setAuthModalOpen(true)}
          />
          <main>
            <Hero />
            <Marquee />
            <CategoryGrid />
            <ProductGrid onView3D={setActiveProduct} />
            <BrandStory />
            <Craftsmanship />
            <Testimonials />
            <InstagramGallery />
            <Newsletter />
          </main>
          <Footer />
          <ProductViewModal product={activeProduct} onClose={() => setActiveProduct(null)} />
          <CartDrawer />
          <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
