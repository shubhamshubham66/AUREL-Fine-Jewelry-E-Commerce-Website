import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ShoppingBag, Minus, Plus } from 'lucide-react';
import { KARATS, DIAMOND_SIZES, METAL_COLORS } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

export default function ProductViewModal({ product, onClose }) {
  const [rotation, setRotation] = useState(0);
  const [selectedKarat, setSelectedKarat] = useState('18K');
  const [selectedSize, setSelectedSize] = useState('0.50 ct');
  const [selectedMetal, setSelectedMetal] = useState('yellow');
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-strong rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-cream/60 hover:text-gold transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* 3D Viewer */}
              <div className="relative aspect-square bg-onyx/50 flex items-center justify-center overflow-hidden">
                <motion.img
                  src={product.image}
                  alt={product.name}
                  className="w-4/5 h-4/5 object-cover rounded-sm"
                  style={{ transform: `rotateY(${rotation}deg)` }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <button
                    onClick={() => setRotation(r => r - 45)}
                    className="p-2 glass rounded-full text-gold hover:bg-gold/20 transition-colors"
                    aria-label="Rotate left"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => setRotation(r => r + 45)}
                    className="p-2 glass rounded-full text-gold hover:bg-gold/20 transition-colors"
                    aria-label="Rotate right"
                  >
                    <RotateCcw size={16} className="scale-x-[-1]" />
                  </button>
                </div>
                {product.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold bg-gold text-obsidian rounded-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Configurator */}
              <div className="p-8 md:p-10 flex flex-col">
                <p className="text-xs text-gold/60 uppercase tracking-wider">{product.category}</p>
                <h2 className="font-serif text-3xl text-cream mt-2">{product.name}</h2>
                <p className="text-2xl text-gold font-semibold mt-3">{formatPrice(product.price)}</p>
                <p className="mt-4 text-cream/60 text-sm leading-relaxed">{product.description}</p>

                <div className="hairline my-6" />

                {/* Metal Color */}
                <div className="mb-5">
                  <label className="text-xs text-cream/50 uppercase tracking-wider block mb-3">Metal</label>
                  <div className="flex gap-3">
                    {METAL_COLORS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMetal(m.id)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                          selectedMetal === m.id ? 'border-gold scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: m.hex }}
                        aria-label={m.name}
                        title={m.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Karat */}
                <div className="mb-5">
                  <label className="text-xs text-cream/50 uppercase tracking-wider block mb-3">Karat</label>
                  <div className="flex gap-2">
                    {KARATS.map(k => (
                      <button
                        key={k}
                        onClick={() => setSelectedKarat(k)}
                        className={`px-4 py-2 text-sm rounded-sm transition-all duration-300 ${
                          selectedKarat === k
                            ? 'bg-gold text-obsidian font-semibold'
                            : 'border border-gold/20 text-cream/60 hover:border-gold/50'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diamond Size */}
                <div className="mb-6">
                  <label className="text-xs text-cream/50 uppercase tracking-wider block mb-3">Diamond</label>
                  <div className="flex flex-wrap gap-2">
                    {DIAMOND_SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-2 text-xs rounded-sm transition-all duration-300 ${
                          selectedSize === s
                            ? 'bg-gold text-obsidian font-semibold'
                            : 'border border-gold/20 text-cream/60 hover:border-gold/50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Add */}
                <div className="mt-auto flex items-center gap-4">
                  <div className="flex items-center border border-gold/20 rounded-sm">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="p-2 text-cream/60 hover:text-gold transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 text-cream font-medium">{qty}</span>
                    <button
                      onClick={() => setQty(q => q + 1)}
                      className="p-2 text-cream/60 hover:text-gold transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button onClick={handleAdd} className="btn-gold flex-1 flex items-center justify-center gap-2">
                    <ShoppingBag size={18} />
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
