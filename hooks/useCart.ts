import { useCallback } from 'react';
import { useCartContext } from '@/context/CartContext';
import type { CartItem, SanityImageReference } from '@/types';

export interface AddToCartParams {
  productId: string;
  productSlug: string;
  variantId: string;
  name: string;
  variantTitle?: string;
  price: number;
  sku: string;
  image: SanityImageReference;
  color?: string;
  size?: string;
  quantity?: number;
}

export function useCart() {
  const { cart, addItem, removeItem, updateItemQuantity, clearCart } = useCartContext();

  const addToCart = useCallback(async (params: AddToCartParams) => {
    try {
      // Fetch product details
      const response = await fetch(`/api/products/${params.productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const product = await response.json();
      
      // Create cart item
      const cartItem: CartItem = {
        id: `${params.productId}-${params.variantId}-${params.color ?? ''}-${params.size ?? ''}`,
        productId: params.productId,
        productSlug: params.productSlug,
        variantId: params.variantId,
        name: params.name,
        price: params.price,
        sku: params.sku,
        image: params.image,
        color: params.color,
        size: params.size,
        quantity: params.quantity ?? 1,
        variantTitle: params.variantTitle
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