import { useState } from 'react';

interface StockUpdateParams {
  productSlug: string;
  variantId?: string;
  quantity: number;
  type: 'added' | 'reduced' | 'reserved' | 'released';
  reason: string;
}

interface StockStatus {
  stock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  lowStockThreshold: number;
  stockHistory: Array<{
    date: string;
    quantity: number;
    type: string;
    reason: string;
  }>;
}

export function useStock() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStock = async ({
    productSlug,
    variantId,
    quantity,
    type,
    reason,
  }: StockUpdateParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productSlug}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
          quantity,
          type,
          reason,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update stock');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = async (
    productSlug: string,
    variantId?: string
  ): Promise<StockStatus> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`/api/products/${productSlug}/stock`, window.location.origin);
      if (variantId) {
        url.searchParams.append('variantId', variantId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get stock status');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get stock status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reserveStock = async (
    productSlug: string,
    variantId: string | undefined,
    quantity: number
  ) => {
    return updateStock({
      productSlug,
      variantId,
      quantity,
      type: 'reserved',
      reason: 'Cart reservation',
    });
  };

  const releaseStock = async (
    productSlug: string,
    variantId: string | undefined,
    quantity: number
  ) => {
    return updateStock({
      productSlug,
      variantId,
      quantity,
      type: 'released',
      reason: 'Cart release',
    });
  };

  const reduceStock = async (
    productSlug: string,
    variantId: string | undefined,
    quantity: number
  ) => {
    return updateStock({
      productSlug,
      variantId,
      quantity,
      type: 'reduced',
      reason: 'Purchase completed',
    });
  };

  return {
    isLoading,
    error,
    updateStock,
    getStockStatus,
    reserveStock,
    releaseStock,
    reduceStock,
  };
} 