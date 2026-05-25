import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

const FILTERS = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

export default function ProductGrid({ onView3D }) {
  const [active, setActive] = useState('All');
  const { addItem } = useCart();

  const filtered = active === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === active);

  const handleQuickAdd = (product) => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
      config: { karat: '18K', diamond: '0.50 ct', metal: product.metal || 'Yellow Gold' },
    });
  };

  return (
    <section className="section" id="shop" aria-label="Shop products">
      <div className="container-luxe">
        <div className="text-center mb-10 md:mb-14">
          <p className="eyebrow justify-center mb-3">The Collection</p>
          <h2 className="h-display text-cream">
            Signature <span className="text-gold-gradient">Pieces</span>
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                active === f
                  ? 'bg-gold text-obsidian'
                  : 'border border-cream/15 text-cream/60 hover:border-gold/40 hover:text-gold'
              }`}
              aria-label={`Filter by ${f}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-lg overflow-hidden bg-onyx/30"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-gold/90 text-obsidian text-[10px] font-bold uppercase tracking-wider rounded-sm">
                      {product.badge}
                    </span>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => onView3D?.(product)}
                      className="w-10 h-10 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream hover:bg-gold hover:text-obsidian hover:border-gold transition-all"
                      aria-label={`View ${product.name} in 3D`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="w-10 h-10 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream hover:bg-gold hover:text-obsidian hover:border-gold transition-all"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gold/60 text-[10px] uppercase tracking-widest mb-1">
                    {product.category}
                  </p>
                  <h3 className="text-cream font-serif text-base sm:text-lg">{product.name}</h3>
                  <p className="text-gold mt-1 text-sm">{formatPrice(product.price)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
