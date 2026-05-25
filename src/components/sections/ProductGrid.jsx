import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShoppingBag, Filter } from 'lucide-react';
import { PRODUCTS } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

export default function ProductGrid({ onView3D }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const { addItem } = useCart();
  const filters = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

  const filtered = activeFilter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeFilter);

  const handleAdd = (product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
  };

  return (
    <section className="section bg-onyx/30">
      <div className="container-luxe">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="eyebrow justify-center">Curated Selection</span>
          <h2 className="h-display mt-4 text-cream">
            Signature <span className="text-gold-gradient">Pieces</span>
          </h2>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
          <Filter size={16} className="text-gold/60" />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 text-sm rounded-sm transition-all duration-300 ${
                activeFilter === f
                  ? 'bg-gold text-obsidian font-semibold'
                  : 'border border-gold/20 text-cream/60 hover:border-gold/50 hover:text-cream'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative bg-onyx/50 rounded-sm overflow-hidden border border-gold/5 hover:border-gold/20 transition-all duration-500"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/40 transition-all duration-500" />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold bg-gold/90 text-obsidian rounded-sm">
                      {product.badge}
                    </span>
                  )}

                  {/* Hover actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => onView3D(product)}
                      className="p-3 glass rounded-full text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
                      aria-label="View product"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleAdd(product)}
                      className="p-3 glass rounded-full text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-gold/60 uppercase tracking-wider">{product.category}</p>
                  <h3 className="font-serif text-lg text-cream mt-1 group-hover:text-gold transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-gold font-semibold mt-2">{formatPrice(product.price)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
