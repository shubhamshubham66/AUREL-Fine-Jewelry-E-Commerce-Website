import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';
import { KARATS, DIAMOND_SIZES, METAL_COLORS } from '../../data/products.js';

const JewelryViewer3D = lazy(() => import('./JewelryViewer3D.jsx'));

const KARAT_MULTIPLIER = { '14K': 1.0, '18K': 1.3, '22K': 1.7 };
const DIAMOND_MULTIPLIER = { '0.25 ct': 1.0, '0.50 ct': 1.4, '0.75 ct': 1.8, '1.00 ct': 2.3 };

export default function ProductViewModal({ product, onClose }) {
  const { addItem } = useCart();
  const [karat, setKarat] = useState('18K');
  const [diamond, setDiamond] = useState('0.50 ct');
  const [metal, setMetal] = useState(METAL_COLORS[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!product) return null;

  const calculatedPrice = Math.round(
    product.price * KARAT_MULTIPLIER[karat] * DIAMOND_MULTIPLIER[diamond]
  );

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: calculatedPrice,
      qty,
      config: { karat, diamond, metal: metal.name },
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close modal backdrop"
          />
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl glass-strong"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-onyx/80 text-cream hover:text-gold transition-colors"
              aria-label="Close product modal"
            >
              ✕
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              {/* 3D Viewer */}
              <div className="relative h-72 sm:h-80 md:h-[520px] bg-gradient-to-b from-onyx/80 to-obsidian/90 rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
                {/* Decorative gold radial glow behind the 3D object */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
                </div>
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center w-full h-full gap-3">
                      <div className="w-14 h-14 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                      <span className="text-[10px] uppercase tracking-widest text-cream/40">Loading 3D View</span>
                    </div>
                  }
                >
                  <JewelryViewer3D metalColor={metal.hex} />
                </Suspense>
              </div>

              {/* Configurator */}
              <div className="p-6 sm:p-8 flex flex-col gap-5">
                <div>
                  <p className="text-gold/70 text-xs uppercase tracking-widest mb-1">
                    {product.category}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-cream font-light">
                    {product.name}
                  </h2>
                  <p className="text-cream/60 text-sm mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Karat */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/50 mb-2 block">
                    Gold Karat
                  </label>
                  <div className="flex gap-2">
                    {KARATS.map((k) => (
                      <button
                        key={k}
                        onClick={() => setKarat(k)}
                        className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                          karat === k
                            ? 'bg-gold text-obsidian'
                            : 'border border-cream/20 text-cream/70 hover:border-gold/50'
                        }`}
                        aria-label={`Select ${k} gold`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diamond */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/50 mb-2 block">
                    Diamond Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIAMOND_SIZES.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDiamond(d)}
                        className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                          diamond === d
                            ? 'bg-gold text-obsidian'
                            : 'border border-cream/20 text-cream/70 hover:border-gold/50'
                        }`}
                        aria-label={`Select ${d} diamond`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metal Color */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/50 mb-2 block">
                    Metal Color
                  </label>
                  <div className="flex gap-3">
                    {METAL_COLORS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMetal(m)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          metal.id === m.id ? 'border-gold scale-110' : 'border-cream/20'
                        }`}
                        style={{ backgroundColor: m.hex }}
                        aria-label={`Select ${m.name}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/50 mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-9 h-9 rounded-sm border border-cream/20 text-cream flex items-center justify-center hover:border-gold/50 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-cream font-medium w-8 text-center">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-9 h-9 rounded-sm border border-cream/20 text-cream flex items-center justify-center hover:border-gold/50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto pt-4 border-t border-cream/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-cream/50 text-sm">Total</span>
                    <span className="text-gold font-serif text-2xl">
                      {formatPrice(calculatedPrice * qty)}
                    </span>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="btn-gold w-full text-center"
                    aria-label="Add to cart"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
