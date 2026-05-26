import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShoppingBag, Heart, Star } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

const FILTERS = ['All', ...CATEGORIES.map((category) => category.name)];

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
      config: { karat: '18K', diamond: '0.50 ct', metal: product.material || product.metal },
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
          className="mx-auto mb-12 flex max-w-6xl flex-wrap items-center justify-center gap-2.5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-xs sm:text-sm tracking-wide rounded-full transition-all duration-300 ${
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
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group rounded-xl border border-gold/10 bg-gradient-to-b from-onyx/70 to-obsidian/80 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/35 hover:shadow-gold-soft"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-lg mb-4 bg-cream">
                  <img
                    src={product.thumbnail || product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/65 via-obsidian/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider bg-gold text-obsidian rounded-full shadow-gold-soft">
                      {product.badge}
                    </span>
                  )}

                  <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-obsidian/70 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur-md">
                    <Star className="h-3 w-3 fill-gold text-gold" />
                    {product.rating}
                  </span>

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
                <div className="px-1 pb-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-gold/65 text-[11px] uppercase tracking-widest">
                      {product.subCategory || product.category}
                    </p>
                    <p className="shrink-0 text-cream/35 text-[11px]">
                      {product.reviews} reviews
                    </p>
                  </div>
                  <h3 className="font-serif text-xl leading-tight text-cream group-hover:text-cream/90 transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-cream/45">
                    {product.material} · {product.gemstone}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-gold font-semibold">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-cream/30 line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    </div>
                    <p className="rounded-full border border-cream/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-cream/45">
                      {product.stock > 10 ? 'In Stock' : 'Limited'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
