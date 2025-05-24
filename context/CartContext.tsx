'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SanityImageReference } from '@/types';
import { useStock } from '@/hooks/useStock';

// Types
export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
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
  const [items, setItems] = useState<CartItem[]>([]);
  const { reserveStock, releaseStock } = useStock();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = async (item: Omit<CartItem, 'quantity'>) => {
    try {
      // Reserve stock when adding to cart
      await reserveStock(item.productSlug, item.variantId, 1);

      setItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(
          i => i.productId === item.productId && 
               i.variantId === item.variantId &&
               (!i.color || i.color === item.color) &&
               (!i.size || i.size === item.size)
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
          return updatedItems;
        }

        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const itemToRemove = items.find(item => item.id === itemId);
      if (itemToRemove) {
        // Release stock when removing from cart
        await releaseStock(
          itemToRemove.productSlug,
          itemToRemove.variantId,
          itemToRemove.quantity
        );
      }

      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    try {
      const itemToUpdate = items.find(item => item.id === itemId);
      if (!itemToUpdate) return;

      const quantityDiff = quantity - itemToUpdate.quantity;

      if (quantityDiff > 0) {
        // Reserve additional stock
        await reserveStock(
          itemToUpdate.productSlug,
          itemToUpdate.variantId,
          quantityDiff
        );
      } else if (quantityDiff < 0) {
        // Release excess stock
        await releaseStock(
          itemToUpdate.productSlug,
          itemToUpdate.variantId,
          Math.abs(quantityDiff)
        );
      }

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      // Release all reserved stock
      await Promise.all(
        items.map(item =>
          releaseStock(item.productSlug, item.variantId, item.quantity)
        )
      );
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: items,
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