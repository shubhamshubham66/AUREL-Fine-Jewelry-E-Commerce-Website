import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'aurel_cart_v2';

function loadFromStorage() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY) || window.localStorage.getItem('aurel_cart');
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.productId && item?.name && Number.isFinite(item?.price))
      : [];
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  return [];
}

const initialState = { items: loadFromStorage(), isOpen: false };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId &&
          i.config?.karat === action.payload.config?.karat &&
          i.config?.diamond === action.payload.config?.diamond &&
          i.config?.metal === action.payload.config?.metal
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === existing.productId &&
            i.config?.karat === existing.config?.karat &&
            i.config?.diamond === existing.config?.diamond &&
            i.config?.metal === existing.config?.metal
              ? { ...i, qty: i.qty + action.payload.qty }
              : i
          ),
          isOpen: true,
        };
      }
      return { ...state, items: [...state.items, action.payload], isOpen: true };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i, idx) => idx !== action.payload) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i, idx) =>
          idx === action.payload.index ? { ...i, qty: Math.max(1, action.payload.qty) } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (index) => dispatch({ type: 'REMOVE_ITEM', payload: index });
  const updateQty = (index, qty) => dispatch({ type: 'UPDATE_QTY', payload: { index, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const open = () => dispatch({ type: 'OPEN_CART' });
  const close = () => dispatch({ type: 'CLOSE_CART' });

  const totals = useMemo(
    () =>
      state.items.reduce(
        (acc, i) => ({
          count: acc.count + i.qty,
          subtotal: acc.subtotal + i.price * i.qty,
        }),
        { count: 0, subtotal: 0 }
      ),
    [state.items]
  );

  return (
    <CartContext.Provider
      value={{ items: state.items, isOpen: state.isOpen, addItem, removeItem, updateQty, clearCart, open, close, totals }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
