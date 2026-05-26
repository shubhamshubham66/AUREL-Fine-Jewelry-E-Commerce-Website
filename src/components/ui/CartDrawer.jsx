import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQty, totals } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[75] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm"
            onClick={close}
            aria-label="Close cart drawer backdrop"
          />
          <motion.aside
            className="relative w-full max-w-md h-full glass-strong flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream/10">
              <h2 className="font-serif text-xl text-cream">Shopping Cart</h2>
              <button
                onClick={close}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-cream/5 text-cream/60 hover:text-gold transition-colors"
                aria-label="Close cart"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <FiShoppingBag className="text-4xl text-cream/20 mb-4" />
                <p className="text-cream/50 font-serif text-lg">Your cart is empty</p>
                <p className="text-cream/30 text-sm mt-1">
                  Discover our collection and add your favorites
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex gap-4 p-3 rounded-lg bg-onyx/40 border border-cream/5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-cream text-sm font-medium truncate">{item.name}</h3>
                      {item.config && (
                        <div className="text-cream/40 text-xs mt-0.5 space-x-2">
                          <span>{item.config.karat}</span>
                          <span>·</span>
                          <span>{item.config.diamond}</span>
                          <span>·</span>
                          <span>{item.config.metal}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(idx, item.qty - 1)}
                            className="w-6 h-6 rounded border border-cream/20 text-cream text-xs flex items-center justify-center hover:border-gold/50 transition-colors"
                            aria-label="Decrease item quantity"
                          >
                            −
                          </button>
                          <span className="text-cream text-sm w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(idx, item.qty + 1)}
                            className="w-6 h-6 rounded border border-cream/20 text-cream text-xs flex items-center justify-center hover:border-gold/50 transition-colors"
                            aria-label="Increase item quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-gold text-sm font-medium">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="self-start text-cream/30 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-cream/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-cream/60 text-sm">
                    Subtotal ({totals.count} item{totals.count !== 1 ? 's' : ''})
                  </span>
                  <span className="text-gold font-serif text-xl">
                    {formatPrice(totals.subtotal)}
                  </span>
                </div>
                <button
                  className="btn-gold w-full text-center"
                  aria-label="Proceed to checkout"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
