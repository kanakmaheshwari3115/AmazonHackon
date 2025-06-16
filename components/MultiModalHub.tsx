
import React, { useState, ReactNode } from 'react';
import BarcodeScannerMockup from './multimodal/BarcodeScannerMockup';
import VoiceSearchMockup from './multimodal/VoiceSearchMockup';
import { BarcodeAnalysisResult, VoiceCommandInterpretation, AlertType, ExternalAnalysisResult, AppViewType } from './../types'; 
import SearchSuggestions from './SearchSuggestions'; 

type MultiModalNavTarget = AppViewType | 'cart' | 'dashboard' | 'wallet';

interface MultiModalHubProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (term: string) => void;
  showSearchSuggestions: boolean;
  setShowSearchSuggestions: (show: boolean) => void;
  SearchSuggestionsComponent: typeof SearchSuggestions; 
  onSuggestionClick: (suggestion: string) => void;
  predefinedSearchSuggestions: string[];
  isLoadingProducts: boolean; 
  isGeminiAvailable: boolean; 
  addAlert: (message: string, type: AlertType) => void;
  onExternalAnalysisComplete: (result: ExternalAnalysisResult | BarcodeAnalysisResult) => void;
  onNavigate?: (view: MultiModalNavTarget) => void;
  onGetEcoTip?: () => void;
}

type ActiveInputMethod = 'text' | 'barcode' | 'voice';

const MultiModalHub: React.FC<MultiModalHubProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  showSearchSuggestions,
  setShowSearchSuggestions,
  SearchSuggestionsComponent,
  onSuggestionClick,
  predefinedSearchSuggestions,
  isLoadingProducts,
  isGeminiAvailable,
  addAlert,
  onExternalAnalysisComplete,
  onNavigate,
  onGetEcoTip
}): React.JSX.Element => {
  const [activeSecondaryInput, setActiveSecondaryInput] = useState<ActiveInputMethod | null>(null);

  const handleBarcodeAnalysis = (result: BarcodeAnalysisResult) => {
    addAlert(result.message || `Product: ${result.productName}, Barcode (Sim): ${result.simulatedBarcode}`, AlertType.SUCCESS);
    onExternalAnalysisComplete(result);
    if (result.productName) {
        setSearchTerm(result.productName); 
        onSearch(result.productName); 
        setActiveSecondaryInput(null); 
    }
  };

  const handleVoiceCommandInterpretation = (interpretation: VoiceCommandInterpretation) => {
    addAlert(`AI interpreted: ${interpretation.action} for "${interpretation.originalTranscript}"`, AlertType.INFO);
    switch (interpretation.action) {
      case 'search_products':
        if (interpretation.parameters.query) {
          setSearchTerm(interpretation.parameters.query);
          onSearch(interpretation.parameters.query);
          setActiveSecondaryInput(null);
        } else { addAlert("AI understood search, but no query was extracted.", AlertType.INFO); }
        break;
      case 'analyze_product_by_name':
        if (interpretation.parameters.productName) {
          addAlert(`Voice command to analyze: "${interpretation.parameters.productName}". You can search for it or use 'Analyze Product' feature.`, AlertType.INFO);
          setSearchTerm(interpretation.parameters.productName);
          onSearch(interpretation.parameters.productName);
          setActiveSecondaryInput(null);
        } else { addAlert("AI understood analyze, but no product name was extracted.", AlertType.INFO); }
        break;
      case 'get_eco_tip':
        if (onGetEcoTip) onGetEcoTip();
        else addAlert("Fetching an eco tip! (Display logic pending).", AlertType.INFO);
        break;
      case 'navigate_to_section':
        if (interpretation.parameters.sectionName && onNavigate) onNavigate(interpretation.parameters.sectionName as MultiModalNavTarget);
        else addAlert(`Navigation to "${interpretation.parameters.sectionName}" understood, but action not fully wired.`, AlertType.INFO);
        break;
      default:
        addAlert(`AI could not determine a clear action for: "${interpretation.originalTranscript}"`, AlertType.INFO);
        break;
    }
  };
  
  const TextSearchComponent = (
    <div className="relative flex w-full shadow-sm">
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setShowSearchSuggestions(e.target.value.length > 0); }}
        onFocus={() => { setShowSearchSuggestions(searchTerm.length > 0); setActiveSecondaryInput(null); }}
        placeholder="Search EcoShop..."
        className="flex-grow h-10 sm:h-12 px-4 py-2 text-base border border-r-0 border-amazon-mediumGray rounded-l-md focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange outline-none bg-amazon-white text-amazon-textBlack placeholder-gray-500"
        onKeyPress={(e) => e.key === 'Enter' && !isLoadingProducts && onSearch(searchTerm)}
        aria-haspopup="listbox" 
        aria-expanded={showSearchSuggestions}
      />
      <button 
        onClick={() => onSearch(searchTerm)} 
        disabled={isLoadingProducts || (!isGeminiAvailable && !searchTerm.trim())}
        className="w-12 h-10 sm:w-14 sm:h-12 bg-amazon-yellow hover:bg-amber-400 text-amazon-textBlack rounded-r-md flex items-center justify-center focus:ring-2 focus:ring-amazon-orange focus:outline-none disabled:opacity-70"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </button>
      {showSearchSuggestions && searchTerm.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-0.5 z-30">
          <SearchSuggestionsComponent
            suggestions={predefinedSearchSuggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))}
            onSuggestionClick={onSuggestionClick}
          />
        </div>
      )}
    </div>
  );

  const SecondaryInputButton: React.FC<{buttonMethod: ActiveInputMethod, label: string, icon: ReactNode}> = ({buttonMethod, label, icon}) => {
    const baseClasses = "px-2.5 py-1.5 text-xs rounded-md flex items-center space-x-1.5 transition-colors";
    const isActive = activeSecondaryInput === buttonMethod;
    const activeClasses = "bg-amazon-linkBlue text-white shadow-sm";
    const inactiveClasses = "text-amazon-linkBlue hover:bg-amazon-lightGray dark:text-sky-300 dark:hover:bg-amazon-navBlue/60";
    
    return (
      <button
          onClick={() => setActiveSecondaryInput(isActive ? null : buttonMethod)}
          className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          title={label}
          aria-pressed={isActive}
      >
          {icon}
          <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-full p-3 sm:p-4 bg-amazon-white dark:bg-amazon-darkBlue rounded-lg shadow-md border border-amazon-mediumGray/30 dark:border-amazon-darkBlue/70">
      {TextSearchComponent}
      
      <div className="mt-2.5 flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 pt-2.5">
        <span className="text-xs text-gray-500 dark:text-amazon-mediumGray hidden sm:inline mr-1">Try alternative inputs:</span>
        <SecondaryInputButton 
            buttonMethod="barcode" 
            label="Image Scan" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>}
        />
        <SecondaryInputButton 
            buttonMethod="voice" 
            label="Voice Command" 
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 0 0 .75-.75V5.25A.75.75 0 0 0 12 4.5h-.75a.75.75 0 0 0-.75.75v13.5c0 .414.336.75.75.75h.75Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12a4.5 4.5 0 0 1 4.5-4.5M7.5 12a4.5 4.5 0 0 0 4.5 4.5M16.5 12a4.5 4.5 0 0 1-4.5 4.5m0-13.5a4.5 4.5 0 0 1 4.5 4.5" /></svg>}
        />
      </div>

      {activeSecondaryInput === 'barcode' && (
        <div className="mt-3 border-t border-amazon-mediumGray/30 dark:border-amazon-navBlue/70 pt-3">
          <BarcodeScannerMockup onScanResult={handleBarcodeAnalysis} addAlert={addAlert} />
        </div>
      )}
      {activeSecondaryInput === 'voice' && (
         <div className="mt-3 border-t border-amazon-mediumGray/30 dark:border-amazon-navBlue/70 pt-3">
          <VoiceSearchMockup onVoiceCommand={handleVoiceCommandInterpretation} addAlert={addAlert}/>
        </div>
      )}
    </div>
  );
};

export default MultiModalHub;
