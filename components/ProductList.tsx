
import React from 'react';
import { Product, CartType } from '../types';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

interface ProductListProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, cartType: CartType) => void; 
  isLoading: boolean;
  title?: string;
  triggerPurchaseAnimation: (productId: string) => void; 
}

const ProductList: React.FC<ProductListProps> = ({ products, onViewDetails, onAddToCart, isLoading, title = "Discover Eco-Friendly Products", triggerPurchaseAnimation }) => {
  if (isLoading) {
    return (
        <div className="py-6 sm:py-8 bg-amazon-white dark:bg-amazon-navBlue my-4 rounded-md shadow">
            <div className="container mx-auto px-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-amazon-textBlack dark:text-amazon-white mb-4 sm:mb-6">{title}</h2>
                <LoadingSpinner text="Loading products..." />
            </div>
        </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 bg-amazon-white dark:bg-amazon-navBlue my-4 rounded-md shadow"> {/* Card-like container for each list */}
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-amazon-textBlack dark:text-amazon-white mb-4 sm:mb-6">{title}</h2>
        {products.length === 0 && !isLoading ? (
          <p className="text-center text-gray-500 dark:text-amazon-mediumGray text-lg py-8">No products found. Try broadening your search or check back later!</p>
        ) : (
          // Using flex-wrap for grid, can be enhanced for horizontal scroll (carousel) with more CSS/JS
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-5 product-grid"> 
            {products.map((product, index) => (
              // The animation delay is managed by ProductCard directly via its `product-card-animate` class
              // The key is essential here for React's rendering
              <ProductCard
                  key={product.id} 
                  product={product}
                  onViewDetails={onViewDetails}
                  onAddToCart={onAddToCart} 
                  triggerPurchaseAnimation={triggerPurchaseAnimation} 
                />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
