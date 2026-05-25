import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const NAV_LINKS = [
  { label: 'Collections', href: '#collections' },
  { label: 'Shop', href: '#shop' },
  { label: 'Craft', href: '#craft' },
  { label: 'Story', href: '#story' },
  { label: 'Journal', href: '#journal' },
];

export default function Navbar({ onSearchOpen, onAuthOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open, totals } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-strong border-b border-gold/10'
            : 'bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="container-luxe flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full border border-gold/50 flex items-center justify-center group-hover:border-gold transition-colors duration-300">
              <span className="text-gold font-serif text-sm">A</span>
            </div>
            <span className="font-serif text-cream text-lg tracking-[0.15em] hidden sm:block">
              AUREL
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative text-cream/70 hover:text-cream text-sm tracking-wide transition-colors duration-300"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onSearchOpen}
              className="w-10 h-10 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={onAuthOpen}
              className="w-10 h-10 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
              aria-label="Account"
            >
              <User className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={open}
              className="relative w-10 h-10 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totals.count > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-obsidian text-[10px] font-bold flex items-center justify-center rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  key={totals.count}
                >
                  {totals.count}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-cream/60 hover:text-cream transition-colors lg:hidden"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-72 bg-onyx border-l border-gold/10 z-[70] p-8 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end mb-8 text-cream/60 hover:text-cream"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
              <nav className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-cream/80 hover:text-cream font-serif text-xl tracking-wide transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto pt-8 border-t border-gold/10">
                <button
                  onClick={() => { onSearchOpen(); setMobileOpen(false); }}
                  className="flex items-center gap-3 text-cream/60 hover:text-cream text-sm"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
