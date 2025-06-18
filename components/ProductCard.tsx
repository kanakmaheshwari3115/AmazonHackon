import React, { useState } from 'react';
import { Product, CartType } from '../types';
import ShippingOptionsPopover from './ShippingOptionsPopover';
import { COINS_SUSTAINABLE_PURCHASE_HIGH_ECOSCORE, HIGH_ECOSCORE_THRESHOLD } from '../constants';

const StarRating: React.FC<{ score: number, reviewCount?: number }> = ({ score, reviewCount }) => {
  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.25 && score % 1 < 0.75;
  const filledStars = score % 1 >= 0.75 ? fullStars + 1 : fullStars;
  const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center my-1">
      {[...Array(filledStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-4 h-4 text-amazon-orange" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.722c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
      {halfStar && (
         <svg key="half" className="w-4 h-4 text-amazon-orange" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.722c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            <path d="M10 4.25v11.49l2.857-2.078a.5.5 0 01.572.017l.002.002 1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 15.475V4.25z" clipRule="evenodd" style={{ opacity: 0.5 }} />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-4 h-4 text-amazon-mediumGray/70" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.722c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
      {reviewCount !== undefined && <span className="ml-1.5 text-xs text-amazon-linkBlue hover:underline">({reviewCount})</span>}
    </div>
  );
};


interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, cartType: CartType) => void;
  triggerPurchaseAnimation: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onAddToCart, triggerPurchaseAnimation }) => {
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [addedToCartType, setAddedToCartType] = useState<CartType | null>(null);

  const handleAddToCartClick = (cartType: CartType) => {
    onAddToCart(product, cartType);
    triggerPurchaseAnimation(product.id);
    setAddedToCartType(cartType); // Track which cart it was added to for UI feedback
    setTimeout(() => setAddedToCartType(null), 2000); // Reset after 2s
  };
  
  const ecoScoreWhole = Math.floor(product.ecoScore);
  const ecoScoreDecimal = product.ecoScore - ecoScoreWhole;
  
  const primeSimulated = product.price > 20 && Math.random() > 0.3; // Simulate Prime eligibility

  return (
    <div 
      className="bg-amazon-white dark:bg-amazon-navBlue rounded-lg shadow-md overflow-hidden flex flex-col w-full sm:w-64 md:w-[270px] lg:w-[280px] product-card-animate h-full cursor-pointer transform transition-all hover:shadow-xl hover:-translate-y-0.5"
      onClick={() => onViewDetails(product)}
      role="group"
      aria-label={`View details for ${product.name}`}
    >
      <div className="relative p-3">
        <img 
          className="w-full h-48 object-contain rounded-md transition-transform duration-300 group-hover:scale-105" 
          src={product.imageUrl} 
          alt={product.name} 
          loading="lazy"
        />
      </div>

      <div className="p-3 pt-0 flex flex-col flex-grow">
        <h3 
          className="text-sm font-medium text-amazon-textBlack dark:text-amazon-white mb-1 h-10 leading-tight overflow-hidden hover:text-amazon-linkBlue"
          title={product.name}
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
        >
          {product.name}
        </h3>
        
        <StarRating score={product.ecoScore} reviewCount={Math.floor(Math.random() * 200) + 10} />
        
        {product.ecoScore >= HIGH_ECOSCORE_THRESHOLD ? (
          <p className="text-xs text-green-600 dark:text-green-400 font-semibold my-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
                <path fillRule="evenodd" d="M10 4.5a.75.75 0 01.75.75v1.316a3.783 3.783 0 011.654.813.75.75 0 11-.916 1.158A2.286 2.286 0 0010.75 8.01V10H9.25V8.01A2.286 2.286 0 008.5 8.537a.75.75 0 11-.916-1.158 3.783 3.783 0 011.654-.813V5.25A.75.75 0 0110 4.5z" clipRule="evenodd" />
            </svg>
            Earn {COINS_SUSTAINABLE_PURCHASE_HIGH_ECOSCORE} coins!
          </p>
        ) : (
          <div className="h-4 my-1"></div> 
        )}

        <div className="flex items-baseline mb-1.5">
          <span className="text-xl font-bold text-amazon-textBlack dark:text-amazon-white">${product.price.toFixed(2)}</span>
          {Math.random() > 0.5 && product.price < 50 && ( // Simulate old price for some items
            <span className="ml-1.5 text-xs text-amazon-mediumGray line-through">${(product.price * (1 + (Math.random() * 0.3 + 0.1))).toFixed(2)}</span>
          )}
        </div>
        
        {primeSimulated && (
          <div className="flex items-center mb-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amazon-linkBlue" viewBox="0 0 24 13" fill="currentColor">
                <path d="M0 3.37A.37.37 0 01.37 3H1.8v7H.37a.37.37 0 01-.37-.37V3.37zM4.48 3h1.41a.37.37 0 01.36.26L7.77 9h.55l1.43-5.74a.37.37 0 01.36-.26h1.4a.37.37 0 01.37.37v6.26a.37.37 0 01-.37.37H11.4a.37.37 0 01-.37-.37V5l-1.22 4.87a.37.37 0 01-.35.28h-.5a.37.37 0 01-.35-.28L7.4 5v4.63a.37.37 0 01-.37.37H5.61a.37.37 0 01-.37-.37V5l-1.22 4.87a.37.37 0 01-.35.28H3.1a.37.37 0 01-.35-.28L1.53 5v4.63a.37.37 0 01-.37.37H.37a.37.37 0 01-.37-.37V3.37A.37.37 0 01.37 3h1.15l1.52 6.09.22.89h.09l1.13-4.87V3.37A.37.37 0 014.84 3h-.36zM13.24 3h1.4a.37.37 0 01.37.37v6.26a.37.37 0 01-.37.37h-1.4a.37.37 0 01-.37-.37V3.37a.37.37 0 01.37-.37zM17.32 3h1.41a.37.37 0 01.37.37v2.4a.37.37 0 01-.37.37h-1.04V10H16.2V3.37a.37.37 0 01.37-.37h.74zm3.46 0h1.4a.37.37 0 01.37.37v6.26a.37.37 0 01-.37.37h-1.4a.37.37 0 01-.37-.37V3.37a.37.37 0 01.37-.37z"/>
                <path d="M2.2.01l21.6 0V2.5H2.2V.01z"/>
            </svg>
            <span className="ml-1 text-xs text-amazon-textBlack dark:text-amazon-white">Get it by <span className="font-semibold">Tomorrow</span></span>
          </div>
        )}

        {/* Placeholder for 'Limited time deal' or other badges */}
        {!primeSimulated && Math.random() < 0.15 && (
            <div className="mb-1.5">
                <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-sm font-semibold">Limited time deal</span>
            </div>
        )}
        {!primeSimulated && <div className="h-[1.125rem] mb-1.5"></div>} {/* Equivalent height of prime text + margin */}


        <div className="mt-auto relative">
          <button
            onClick={(e) => { 
              e.stopPropagation(); // Prevent card click when button is clicked
              setShowShippingOptions(prev => !prev); 
            }}
            className="w-full bg-amazon-yellow hover:bg-amber-400 text-amazon-textBlack font-medium py-2 px-3 rounded-md shadow-sm text-xs focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:ring-offset-1"
            aria-haspopup="true"
            aria-expanded={showShippingOptions}
          >
            Add to Cart
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3 h-3 inline-block ml-1 transition-transform duration-200 ${showShippingOptions ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
          </button>
          {showShippingOptions && (
            <div 
              className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-slate-700 border border-amazon-mediumGray dark:border-slate-600 rounded-md shadow-lg z-10 p-2 space-y-1.5"
              onMouseLeave={() => setShowShippingOptions(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleAddToCartClick(CartType.INDIVIDUAL); setShowShippingOptions(false); }}
                className="w-full text-left text-xs px-2.5 py-1.5 rounded hover:bg-amazon-lightGray dark:hover:bg-slate-600 text-amazon-textBlack dark:text-amazon-white flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-sky-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h10.5M15.75 8.25v-1.5a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5m3 0h3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                Individual
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAddToCartClick(CartType.GROUP_BUY); setShowShippingOptions(false); }}
                className="w-full text-left text-xs px-2.5 py-1.5 rounded hover:bg-amazon-lightGray dark:hover:bg-slate-600 text-amazon-textBlack dark:text-amazon-white flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
                Group Buy
              </button>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-500">
                 <ShippingOptionsPopover additionalClassName="ml-16"> {/* Apply user-suggested offset for card view */}
                    <span className="text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-help flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                        Shipping Info
                    </span>
                </ShippingOptionsPopover>
              </div>
            </div>
          )}
        </div>
        {addedToCartType && (
            <div className="text-center text-xs text-green-700 dark:text-green-300 font-medium mt-1.5 p-1 bg-green-100 dark:bg-green-700/50 rounded-sm">
                Added to {addedToCartType === CartType.GROUP_BUY ? "Group Buy" : "Individual"}!
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;