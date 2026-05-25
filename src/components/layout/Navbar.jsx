import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export default function Navbar({ onSearchOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open, totals } = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = ['Collections', 'Craftsmanship', 'Story', 'Contact'];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-strong py-3' : 'py-5 bg-transparent'
        }`}
      >
        <div className="container-luxe flex items-center justify-between">
          <a href="#" className="font-serif text-2xl md:text-3xl text-gold-gradient tracking-[0.15em]">
            AUREL
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-cream/70 hover:text-gold transition-colors duration-300 tracking-wide"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onSearchOpen}
              className="p-2 text-cream/70 hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              onClick={open}
              className="relative p-2 text-cream/70 hover:text-gold transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totals.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-obsidian text-xs font-bold rounded-full flex items-center justify-center">
                  {totals.count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-cream/70 hover:text-gold transition-colors md:hidden"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-obsidian/98 flex flex-col items-center justify-center gap-8"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-cream/70 hover:text-gold"
            >
              <X size={28} />
            </button>
            {links.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-3xl text-cream hover:text-gold transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
