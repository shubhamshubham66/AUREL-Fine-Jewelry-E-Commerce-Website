import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { PRODUCTS } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

const FILTERS = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

export default function ProductGrid({ onView3D }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const { addItem } = useCart();

  const filtered = activeFilter === 'All'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeFilter);

  const handleAddToCart = (product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
      config: { karat: '18K', diamond: '0.50 ct', metal: product.metal },
    });
  };

  return (
    <section id="shop" className="section">
      <div className="container-luxe">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow justify-center mb-4">The Collection</p>
          <h2 className="h-display">Signature Pieces</h2>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 text-sm tracking-wide rounded-full transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-gold text-obsidian font-medium'
                  : 'border border-gold/20 text-cream/60 hover:border-gold/50 hover:text-cream'
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-2xl mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-all duration-500" />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider bg-gold text-obsidian rounded-full">
                      {product.badge}
                    </span>
                  )}

                  {/* Hover Action Buttons */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <button
                      onClick={() => onView3D(product)}
                      className="w-11 h-11 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-300"
                      aria-label="View 3D"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-11 h-11 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-300"
                      aria-label="Add to bag"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      className="w-11 h-11 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-300"
                      aria-label="Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-1">
                  <p className="text-gold/60 text-xs uppercase tracking-widest mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-serif text-lg text-cream group-hover:text-cream/90 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gold font-medium mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
