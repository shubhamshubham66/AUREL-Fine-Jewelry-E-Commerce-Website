import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_LINKS = ['Collections', 'Shop', 'Craft', 'Story', 'Journal'];

export default function Navbar({ onSearchOpen, onAuthOpen }) {
  const { open, totals } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'
      }`}
      aria-label="Main navigation"
    >
      <div className="container-luxe flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2" aria-label="AUREL home">
          <span className="text-gold font-serif text-2xl font-bold">A</span>
          <span className="text-cream font-sans text-sm tracking-[0.3em] font-light hidden sm:inline">
            AUREL
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-cream/70 text-sm font-light tracking-wide hover:text-gold transition-colors duration-300"
              aria-label={link}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onSearchOpen}
            className="text-cream/70 hover:text-gold transition-colors"
            aria-label="Open search"
          >
            <FiSearch className="text-lg" />
          </button>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => {
                if (isAuthenticated) setUserDropdown(!userDropdown);
                else onAuthOpen?.();
              }}
              className="text-cream/70 hover:text-gold transition-colors"
              aria-label={isAuthenticated ? 'User menu' : 'Open login'}
            >
              <FiUser className="text-lg" />
            </button>
            <AnimatePresence>
              {userDropdown && isAuthenticated && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-lg p-3"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <p className="text-cream text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-cream/40 text-xs truncate mb-2">{user?.email}</p>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdown(false);
                    }}
                    className="w-full text-left text-red-400 text-xs hover:text-red-300 transition-colors"
                    aria-label="Logout"
                  >
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <button
            onClick={open}
            className="relative text-cream/70 hover:text-gold transition-colors"
            aria-label={`Open cart with ${totals.count} items`}
          >
            <FiShoppingBag className="text-lg" />
            {totals.count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-obsidian text-[10px] font-bold rounded-full flex items-center justify-center">
                {totals.count}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-cream/70 hover:text-gold transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden absolute top-full left-0 right-0 glass-strong border-t border-cream/5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-luxe py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-cream/80 text-lg font-light tracking-wide hover:text-gold transition-colors"
                  aria-label={link}
                >
                  {link}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
