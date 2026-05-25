import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { PRODUCTS } from '../../data/products.js';
import { formatPrice } from '../../utils/format.js';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const results = query.length > 1
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center pt-20 md:pt-32 p-4"
        >
          <div
            className="absolute inset-0 bg-obsidian/95 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: -30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl glass-strong rounded-sm overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-4 p-5 border-b border-gold/10">
              <Search size={20} className="text-gold/60" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jewelry..."
                className="flex-1 bg-transparent text-cream text-lg placeholder-cream/30 focus:outline-none font-light"
              />
              <button onClick={onClose} className="p-2 text-cream/50 hover:text-gold transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length > 1 && results.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-cream/50 font-serif text-lg">No pieces found</p>
                  <p className="text-cream/30 text-sm mt-2">Try a different search term</p>
                </div>
              )}

              {results.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={onClose}
                  className="flex items-center gap-4 p-4 hover:bg-gold/5 cursor-pointer transition-colors duration-200 border-b border-gold/5 last:border-b-0"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-cream font-serif truncate">{product.name}</p>
                    <p className="text-xs text-cream/40 mt-0.5">{product.category}</p>
                  </div>
                  <p className="text-gold font-semibold text-sm">{formatPrice(product.price)}</p>
                </motion.div>
              ))}
            </div>

            {query.length <= 1 && (
              <div className="p-6 text-center">
                <p className="text-cream/30 text-sm">Start typing to search our collection</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
