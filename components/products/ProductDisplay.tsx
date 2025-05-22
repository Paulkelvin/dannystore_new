'use client';

import { type FC, useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import ProductSkeleton from './ProductSkeleton';
import RelatedProducts from './RelatedProducts';
import ProductGallery from './ProductGallery';
import ProductVariantSelector from './ProductVariantSelector';
import { FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';

interface ProductDisplayProps {
  product: Product;
  relatedProducts: Product[];
  isLoading?: boolean;
}

const ProductDisplay: FC<ProductDisplayProps> = ({ product, relatedProducts, isLoading = false }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [shareUrl, setShareUrl] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    try {
      // Ensure we have a valid image reference
      if (!product.mainImage || !product.mainImage.asset) {
        throw new Error('Product image is required');
      }
      // Create cart item with consistent structure
      const cartItem = {
        productId: product._id,
        variantId: selectedVariant?._key || `${product._id}-default`,
        name: product.name,
        variantTitle: selectedVariant 
          ? `${selectedVariant.color?.name || ''} / ${selectedVariant.size?.name || ''}`.trim()
          : undefined,
        price: selectedVariant?.price || product.price,
        sku: selectedVariant?.sku || `${product._id}-default`,
        image: product.mainImage,
        color: selectedVariant?.color?.name || undefined,
        size: selectedVariant?.size?.name || undefined
      };
      addItem(cartItem);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return <ProductSkeleton />;
  }

  // Calculate rating for display
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <>
      <div className="bg-[#F8F9FA] pt-32 pb-24 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Product gallery */}
            <div className="w-full lg:w-1/2">
              <ProductGallery 
                mainImage={product.mainImage} 
                gallery={product.gallery ?? []} 
                productName={product.name} 
              />
            </div>
            {/* Product info */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              {rating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.round(rating) ? 'text-[#FFC300] fill-[#FFC300]' : 'text-[#DEE2E6]'}`}
                        fill={i < Math.round(rating) ? '#FFC300' : '#DEE2E6'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">{reviewCount} reviews</span>
                </div>
              )}
              <p className="text-2xl font-bold text-gray-900 mb-4">
                ${product.price.toFixed(2)}
              </p>
              {/* Key Benefits */}
              {product.keyBenefits && product.keyBenefits.length > 0 && (
                <div className="flex flex-wrap gap-6 mb-6">
                  {product.keyBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-green-600 text-lg">✓</span>
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-8">
                  <ProductVariantSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onVariantSelect={setSelectedVariant}
                  />
                </div>
              )}
              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`w-full bg-[#42A5F5] text-white py-3 px-6 rounded-lg font-medium mb-8 transition-colors ${isAddingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1e88e5]'}`}
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              {/* Product details section */}
              <div id="product-description" className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
                {/* Description */}
                {product.description && product.description.length > 0 && (
                  <div className="prose prose-sm max-w-none text-gray-600 mb-8">
                    {product.description.map((block, index) => (
                      <p key={index} className="mb-4">
                        {block.children?.[0]?.text || ''}
                      </p>
                    ))}
                  </div>
                )}
                {/* Specifications */}
                {Array.isArray(product.specifications) && product.specifications.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Specifications</h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {product.specifications.map((spec, idx) => (
                        <div key={spec._key || idx}>
                          <dt className="text-sm text-gray-500">{spec.key}</dt>
                          <dd className="mt-1 text-sm text-gray-900">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                {/* Benefits */}
                {product.benefits && product.benefits.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Benefits</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Product details link - moved after the description section */}
              <button
                onClick={() => {
                  const el = document.getElementById('product-description');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-sm text-gray-600 hover:text-gray-900 mb-8 inline-flex items-center gap-1 focus:outline-none"
              >
                View product details
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {/* Short description */}
              {product.shortDescription && (
                <div className="prose prose-sm text-gray-600 mb-8">
                  <p>{product.shortDescription}</p>
                </div>
              )}
              {/* Social share */}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-gray-600">Share:</span>
                <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FaFacebookF className="h-5 w-5 text-[#4267B2]" />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FaTwitter className="h-5 w-5 text-[#1DA1F2]" />
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <FaWhatsapp className="h-5 w-5 text-[#25D366]" />
                </a>
              </div>
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={tag + idx}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Related products */}
      <RelatedProducts currentProduct={product} products={relatedProducts} />
    </>
  );
};

export default ProductDisplay;