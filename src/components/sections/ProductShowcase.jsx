// Premium signature showcase: a single sticky 3D viewer paired with a
// minimal scrollable list of the 10 AUREL pieces. Clicking a card switches
// the model with a smooth fade/scale transition.

import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShoppingBag, Star } from 'lucide-react';
import { PRODUCTS, METAL_COLORS } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

const JewelryViewer3D = lazy(() => import('../JewelryViewer3D.jsx'));

function ViewerFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-cream/70">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-gold/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold border-r-gold/60" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-cream/50">Preparing 3D Studio</p>
      </div>
    </div>
  );
}

function metalSwatch(product) {
  return (
    METAL_COLORS.find((m) => m.id === product.metalKey)?.hex ||
    METAL_COLORS[0].hex
  );
}

export default function ProductShowcase({ onView3D }) {
  const [active, setActive] = useState(PRODUCTS[0]);
  const { addItem } = useCart();

  // Keyboard nav: Up / Down arrows to step between products.
  useEffect(() => {
    const handler = (e) => {
      const idx = PRODUCTS.findIndex((p) => p.id === active.id);
      if (e.key === 'ArrowDown') setActive(PRODUCTS[(idx + 1) % PRODUCTS.length]);
      if (e.key === 'ArrowUp') setActive(PRODUCTS[(idx - 1 + PRODUCTS.length) % PRODUCTS.length]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  const handleAdd = (product) => {
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
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow justify-center mb-4">The Signature Ten</p>
          <h2 className="h-display">Hold Each Piece in 3D</h2>
          <p className="mx-auto mt-5 max-w-xl text-cream/55 text-sm sm:text-base font-light leading-relaxed">
            Ten heirloom pieces — rendered in real-time with HDR lighting and physically
            correct materials. Drag, zoom, and turn each jewel like it is in your hand.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ───── 3D viewer ───── */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden rounded-2xl border border-gold/12 bg-gradient-to-b from-onyx/80 to-obsidian shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
                {/* Decorative frame corners */}
                <div className="pointer-events-none absolute top-4 left-4 h-8 w-8 border-l border-t border-gold/40" />
                <div className="pointer-events-none absolute top-4 right-4 h-8 w-8 border-r border-t border-gold/40" />
                <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-l border-b border-gold/40" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-r border-b border-gold/40" />

                <Suspense fallback={<ViewerFallback />}>
                  <JewelryViewer3D
                    product={active}
                    metalColor={metalSwatch(active)}
                    modelUrl={active.model}
                  />
                </Suspense>

                {/* Floating active product label */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    className="pointer-events-none absolute left-6 top-6 max-w-[60%]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.45 }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.32em] text-gold/80">
                      {active.subCategory || active.category}
                    </p>
                    <h3 className="font-serif text-2xl text-cream sm:text-3xl">
                      {active.name}
                    </h3>
                    <p className="mt-1 text-sm text-cream/55">
                      {formatPrice(active.price)}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Action buttons over the viewer */}
                <div className="pointer-events-auto absolute right-5 bottom-5 flex gap-2">
                  <button
                    onClick={() => onView3D?.(active)}
                    className="flex h-10 items-center gap-2 rounded-full border border-cream/15 bg-obsidian/65 px-4 text-[11px] uppercase tracking-[0.22em] text-cream/80 backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold"
                    aria-label="Open detailed view"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </button>
                  <button
                    onClick={() => handleAdd(active)}
                    className="flex h-10 items-center gap-2 rounded-full bg-gold px-4 text-[11px] uppercase tracking-[0.22em] text-obsidian shadow-gold-soft transition-transform hover:scale-[1.03]"
                    aria-label="Add to bag"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ───── Product list ───── */}
          <div className="lg:col-span-5">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {PRODUCTS.map((product, index) => {
                const isActive = product.id === active.id;
                return (
                  <motion.li
                    key={product.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: index * 0.04 }}
                  >
                    <button
                      onClick={() => setActive(product)}
                      className={`group relative flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-all duration-500 ${
                        isActive
                          ? 'border-gold/55 bg-gradient-to-r from-gold/10 via-onyx/60 to-obsidian shadow-gold-soft'
                          : 'border-gold/10 bg-onyx/40 hover:border-gold/35 hover:bg-onyx/60'
                      }`}
                      aria-pressed={isActive}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                        <img
                          src={product.thumbnail || product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                            isActive ? 'scale-105' : 'group-hover:scale-105'
                          }`}
                        />
                        {product.badge && (
                          <span className="absolute top-1 left-1 rounded-full bg-gold px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-obsidian">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-gold/70">
                            {String(index + 1).padStart(2, '0')} · {product.subCategory || product.category}
                          </p>
                          <span className="flex items-center gap-1 text-[10px] text-cream/45">
                            <Star className="h-3 w-3 fill-gold text-gold" />
                            {product.rating}
                          </span>
                        </div>
                        <h3
                          className={`font-serif text-lg leading-tight transition-colors ${
                            isActive ? 'text-cream' : 'text-cream/85 group-hover:text-cream'
                          }`}
                        >
                          {product.name}
                        </h3>
                        <p className="truncate text-[11px] text-cream/45">
                          {product.material} · {product.gemstone}
                        </p>
                        <div className="mt-1 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gold">
                              {formatPrice(product.price)}
                            </p>
                            <p className="text-[10px] text-cream/30 line-through">
                              {formatPrice(product.originalPrice)}
                            </p>
                          </div>
                          {isActive ? (
                            <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-gold">
                              Viewing
                            </span>
                          ) : (
                            <span className="rounded-full border border-cream/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-cream/40 group-hover:border-gold/30 group-hover:text-gold/80">
                              View 3D
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active indicator bar */}
                      <span
                        className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-gold transition-opacity duration-500 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            <p className="mt-6 text-center text-[10px] uppercase tracking-[0.28em] text-cream/35 lg:text-left">
              ↑ ↓ keys to step through · drag the jewel to rotate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
