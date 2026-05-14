import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  cartItemId: string; // unique string for the instance of the item in cart
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Record<string, string>;
  imageUrl?: string;
  isAccessory?: boolean;
  linkedProductName?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ahsen-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ahsen-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'cartItemId'>) => {
    setItems((prev) => {
      // Check if item with same ID and options already exists
      const existingItemIndex = prev.findIndex(
        (item) => item.productId === newItem.productId && JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions)
      );
      
      if (existingItemIndex >= 0) {
        // Just increase quantity up to 5
        const newItems = [...prev];
        const newQuantity = Math.min(newItems[existingItemIndex].quantity + newItem.quantity, 5);
        newItems[existingItemIndex] = { ...newItems[existingItemIndex], quantity: newQuantity };
        return newItems;
      }

      return [
        ...prev,
        { ...newItem, cartItemId: Math.random().toString(36).substr(2, 9), quantity: Math.min(newItem.quantity, 5) }
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setItems((prev) => prev.map((item) => 
      item.cartItemId === cartItemId ? { ...item, quantity: Math.min(Math.max(1, quantity), 5) } : item
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
