
import React, { useState, useCallback, useEffect } from 'react';
import { getEcoTip, isGeminiAvailable } from '../services/geminiService'; // Updated import
import LoadingSpinner from './LoadingSpinner';

const SustainabilityInsights: React.FC = () => {
  const [tip, setTip] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geminiAvailableState, setGeminiAvailableState] = useState<boolean>(true); 

  const fetchTip = useCallback(async () => {
    setIsLoading(true);
    const newTip = await getEcoTip();
    setTip(newTip);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setGeminiAvailableState(isGeminiAvailable()); // Use directly
    if (isGeminiAvailable()) {
        fetchTip(); 
    } else {
        setTip("Eco-Tip: Opt for products with minimal or recycled packaging to reduce waste!");
    }
  }, [fetchTip]);

  return (
    <div className="bg-amazon-white dark:bg-amazon-navBlue p-4 sm:p-5 rounded-md shadow-md my-6 border border-amazon-mediumGray/30 dark:border-amazon-darkBlue/70">
      <div className="flex items-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-amazon-linkBlue dark:text-sky-400 mr-2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.354a15.055 15.055 0 0 1-4.5 0M3 16.5v-1.5M3 12V9M12 2.25V4.5m0-4.5v1.5m6.75 3.75l-1.06-1.06M21 12h-1.5m-15 0H3m16.5 0h1.5M12 21.75V19.5M4.22 4.22l1.06 1.06M18.78 4.22l-1.06 1.06M18.78 19.78l-1.06-1.06M4.22 19.78l1.06-1.06M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <h3 className="text-lg font-semibold text-amazon-textBlack dark:text-amazon-white">Eco-Tip Corner</h3>
      </div>
      {isLoading ? (
        <div className="h-20 flex items-center justify-center"> {/* Ensure spinner is visible */}
          <LoadingSpinner text="Fetching your daily eco-tip..." />
        </div>
      ) : (
        <p className="text-amazon-textBlack dark:text-amazon-white/90 text-sm sm:text-base italic leading-relaxed min-h-[3em]">"{tip}"</p>
      )}
      {geminiAvailableState && (
        <button
          onClick={fetchTip}
          disabled={isLoading}
          className="mt-4 w-full bg-amazon-linkBlue hover:bg-opacity-80 text-white font-medium py-2 px-3 rounded-lg shadow-sm hover:shadow focus:ring-2 focus:ring-amazon-orange focus:ring-offset-1 focus:outline-none transition duration-150 disabled:opacity-50 text-xs sm:text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 inline-block align-text-bottom">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.250L16.023 9.348M3.75 21V9h4.992V5.25A2.25 2.25 0 0 1 10.992 3h4.016a2.25 2.25 0 0 1 2.25 2.25v3.75h4.992v12h-4.992V15H8.742v6H3.75Z" />
          </svg>
          Get Another Tip
        </button>
      )}
       {!geminiAvailableState && !isLoading && (
         <p className="text-xs text-amazon-orange mt-3">AI Tip service currently unavailable. Showing a default tip.</p>
       )}
    </div>
  );
};

export default SustainabilityInsights;
