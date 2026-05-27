import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import { PRODUCTS } from '../../data/products.js';
import { formatPrice } from '../../utils/format.js';
import { asset } from '../../utils/assets.js';

const POPULAR_SEARCHES = ['Rings', 'Necklaces', 'Diamond', 'Gold', 'Earrings', 'Bracelets'];

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
    if (!isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const results = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-xl" onClick={onClose} />

          <div className="relative z-10 w-full max-w-3xl mx-auto mt-20 sm:mt-28 px-4">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 text-xl" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jewelry..."
                className="w-full pl-12 pr-12 py-4 bg-onyx/80 border border-gold/20 rounded-lg text-cream placeholder-cream/40 text-lg focus:outline-none focus:border-gold/50 transition-colors"
                aria-label="Search jewelry products"
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/50 hover:text-gold transition-colors"
                aria-label="Close search"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Popular Searches */}
            {!query.trim() && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-cream/40 text-xs uppercase tracking-widest mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full border border-gold/20 text-cream/70 text-sm hover:border-gold/50 hover:text-gold transition-all"
                      aria-label={`Search for ${term}`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results */}
            {query.trim() && (
              <div className="mt-4">
                <p className="text-cream/40 text-xs uppercase tracking-widest mb-3">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {results.map((product) => (
                      <motion.button
                        key={product.id}
                        onClick={onClose}
                        className="flex items-center gap-4 p-3 rounded-lg bg-onyx/60 border border-cream/5 hover:border-gold/30 transition-all text-left group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        aria-label={`View ${product.name}`}
                      >
                        <img
                          src={asset(product.image)}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-cream font-medium text-sm truncate group-hover:text-gold transition-colors">
                            {product.name}
                          </p>
                          <p className="text-cream/40 text-xs">{product.category}</p>
                          <p className="text-gold text-sm mt-0.5">{formatPrice(product.price)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-cream/50 text-lg">No results found</p>
                    <p className="text-cream/30 text-sm mt-1">
                      Try searching for rings, necklaces, or earrings
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
