'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SanityImageReference } from '@/types';

// Types
export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantTitle?: string;
  price: number;
  sku: string;
  image: SanityImageReference;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateItemQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage key
const CART_STORAGE_KEY = 'dannys-store-cart';

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate cart items
        const validItems = parsedCart.filter((item: any) => {
          const isValid = 
            typeof item.productId === 'string' &&
            typeof item.variantId === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            typeof item.sku === 'string';
          
          if (!isValid) {
            console.warn('Invalid cart item found:', item);
          }
          return isValid;
        });
        setCart(validItems);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCart([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isInitialized]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    console.log('CartContext: Adding item:', newItem);
    
    // Validate required fields
    if (!newItem.productId || !newItem.variantId || !newItem.name || 
        typeof newItem.price !== 'number' || !newItem.sku) {
      console.error('Invalid cart item:', newItem);
      throw new Error('Invalid cart item: missing required fields');
    }

    setCart(currentItems => {
      console.log('Current cart items:', currentItems);
      
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === newItem.productId && item.variantId === newItem.variantId
      );

      console.log('Existing item index:', existingItemIndex);

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1
        };
        console.log('Updated cart items:', updatedItems);
        return updatedItems;
      }

      // Add new item with quantity 1
      const newItems = [...currentItems, { ...newItem, quantity: 1 }];
      console.log('New cart items:', newItems);
      return newItems;
    });
  };

  const removeItem = (variantId: string) => {
    setCart(currentItems => 
      currentItems.filter(item => item.variantId !== variantId)
    );
  };

  const updateItemQuantity = (variantId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(variantId);
      return;
    }

    setCart(currentItems =>
      currentItems.map(item =>
        item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Only render children after cart is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export useCartContext as an alias for useCart
export const useCartContext = useCart; 