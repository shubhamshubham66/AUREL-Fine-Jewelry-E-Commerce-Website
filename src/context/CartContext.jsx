import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = { items: [], isOpen: false };

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.productId === action.payload.productId);
      if (existing) return { ...state, items: state.items.map(i => i.productId === action.payload.productId ? { ...i, qty: i.qty + action.payload.qty } : i), isOpen: true };
      return { ...state, items: [...state.items, action.payload], isOpen: true };
    }
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter(i => i.productId !== action.payload) };
    case 'UPDATE_QTY': return { ...state, items: state.items.map(i => i.productId === action.payload.id ? { ...i, qty: Math.max(1, action.payload.qty) } : i) };
    case 'OPEN_CART': return { ...state, isOpen: true };
    case 'CLOSE_CART': return { ...state, isOpen: false };
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const open = () => dispatch({ type: 'OPEN_CART' });
  const close = () => dispatch({ type: 'CLOSE_CART' });
  const totals = state.items.reduce((acc, i) => ({ count: acc.count + i.qty, subtotal: acc.subtotal + i.price * i.qty }), { count: 0, subtotal: 0 });
  return <CartContext.Provider value={{ items: state.items, isOpen: state.isOpen, addItem, removeItem, updateQty, open, close, totals }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
