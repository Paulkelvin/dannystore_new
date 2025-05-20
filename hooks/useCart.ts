import { useCallback } from 'react';
import { useCartContext } from '@/context/CartContext';
import type { CartItem } from '@/types';

interface AddToCartParams {
  productId: string;
  quantity: number;
  variant?: {
    color?: string;
    size?: string;
  };
}

export function useCart() {
  const { cart, addItem, removeItem, updateItemQuantity, clearCart } = useCartContext();

  const addToCart = useCallback(async ({ productId, quantity, variant }: AddToCartParams) => {
    try {
      // Fetch product details
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const product = await response.json();
      
      // Create cart item
      const cartItem: CartItem = {
        id: `${productId}-${variant?.color || 'default'}-${variant?.size || 'default'}`,
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.mainImage,
        variant,
        stock: product.stock,
      };

      // Add to cart
      addItem(cartItem);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [addItem]);

  const removeFromCart = useCallback((itemId: string) => {
    removeItem(itemId);
  }, [removeItem]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    updateItemQuantity(itemId, quantity);
  }, [updateItemQuantity]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  };
} 