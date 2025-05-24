import { useEffect, useState } from 'react';
import { useStock } from '@/hooks/useStock';
import { cn } from '@/lib/utils';

interface StockStatusProps {
  productSlug: string;
  variantId?: string;
  className?: string;
}

export default function StockStatus({
  productSlug,
  variantId,
  className,
}: StockStatusProps) {
  const { getStockStatus, isLoading, error } = useStock();
  const [stockInfo, setStockInfo] = useState<{
    stock: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  } | null>(null);

  useEffect(() => {
    const fetchStockStatus = async () => {
      try {
        const status = await getStockStatus(productSlug, variantId);
        setStockInfo({
          stock: status.stock,
          stockStatus: status.stockStatus,
        });
      } catch (err) {
        console.error('Failed to fetch stock status:', err);
      }
    };

    fetchStockStatus();
  }, [productSlug, variantId, getStockStatus]);

  if (isLoading) {
    return (
      <div className={cn('text-sm text-gray-500', className)}>
        Checking stock...
      </div>
    );
  }

  if (error || !stockInfo) {
    return (
      <div className={cn('text-sm text-red-500', className)}>
        Unable to check stock
      </div>
    );
  }

  const getStatusStyles = () => {
    switch (stockInfo.stockStatus) {
      case 'out_of_stock':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'low_stock':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusText = () => {
    switch (stockInfo.stockStatus) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'low_stock':
        return `Only ${stockInfo.stock} left`;
      default:
        return `In Stock (${stockInfo.stock} available)`;
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(),
        className
      )}
    >
      {getStatusText()}
    </div>
  );
} 