import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQty, totals } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-obsidian/80 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[75] w-full max-w-md glass-strong border-l border-gold/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-gold" />
                <h2 className="font-serif text-xl text-cream">Your Cart</h2>
                <span className="text-sm text-cream/50">({totals.count})</span>
              </div>
              <button onClick={close} className="p-2 text-cream/60 hover:text-gold transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-gold/20 mb-4" />
                  <p className="text-cream/50 font-serif text-lg">Your cart is empty</p>
                  <p className="text-cream/30 text-sm mt-2">Discover our collection and add pieces you love.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 glass rounded-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm text-cream truncate">{item.name}</h4>
                        <p className="text-gold text-sm font-semibold mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.productId, item.qty - 1)}
                            className="p-1 text-cream/40 hover:text-gold transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm text-cream w-6 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.qty + 1)}
                            className="p-1 text-cream/40 hover:text-gold transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-cream/30 hover:text-rosegold transition-colors self-start"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gold/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cream/60">Subtotal</span>
                  <span className="text-xl font-serif text-gold">{formatPrice(totals.subtotal)}</span>
                </div>
                <button className="btn-gold w-full text-center">Proceed to Checkout</button>
                <button onClick={close} className="btn-outline-gold w-full text-center">Continue Shopping</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
