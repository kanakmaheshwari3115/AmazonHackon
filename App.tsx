import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import SustainabilityInsights from './components/SustainabilityInsights';
import ProductDetailModal from './components/ProductDetailModal';
import LoadingSpinner from './components/LoadingSpinner';
import Alerts from './components/Alerts';
import CustomerDashboard from './components/CustomerDashboard';
import CartModal from './components/CartModal';
import PurchaseAnimation from './components/PurchaseAnimation';
import CheckoutAnimation from './components/CheckoutAnimation';
import ExternalProductAnalyzer from './components/ExternalProductAnalyzer';
import SustainabilityChatbot from './components/SustainabilityChatbot';
import WalletPage from './components/WalletPage';
import SustainabilityQuizModal from './components/SustainabilityQuizModal';
import FeedbackModal from './components/feedback/FeedbackModal';
import SellerRegistrationWizard from './components/seller/SellerRegistrationWizard';
import SellerAdminPage from './components/seller_admin/SellerAdminPage';
import PersonalImpactDashboard from './components/analytics/PersonalImpactDashboard';
import MultiModalHub from './components/multimodal/MultiModalHub';
import MarketplaceView from './components/marketplace/MarketplaceView';
import CreateListingModal from './components/marketplace/CreateListingModal';
import MarketplaceListingDetailModal from './components/marketplace/MarketplaceListingDetailModal';
import MarketplaceChatModal from './components/marketplace/MarketplaceChatModal';
import Footer from './components/Footer';
import FAQView from './components/faq/FAQView';
import ReturnPackagingView from './components/returns/ReturnPackagingView';
import ReturnInitiationModal from './components/returns/ReturnInitiationModal';
import Sidebar from './components/Sidebar';


import {
    Product, CartItem, GeneratedProductIdea, AlertMessage, AlertType, UserProfile,
    CartType, Theme, ExternalAnalysisResult, ChatMessage, MarketplaceChatMessage,
    CoinTransaction, CoinReward,
    UserStreaks, UserMilestones, Quiz,
    FeedbackContextData, ClientFeedbackSubmission,
    SellerFormData, AppViewType,
    NewProductFormData, SellerProduct,
    UserImpactMetrics, BarcodeAnalysisResult,
    VoiceCommandInterpretation,
    MarketplaceListing, MarketplaceListingStatus, FAQItem,
    ReturnablePackage, ReturnPackageStatus, PackageCondition
} from './types';
import {
    INITIAL_PRODUCTS, DEFAULT_GROUP_BUY_DISCOUNT_PERCENTAGE, ECO_PACKAGING_CO2_SAVING, PREDEFINED_SEARCH_SUGGESTIONS,
    COINS_DAILY_LOGIN, INITIAL_MOCK_REWARDS, COINS_PER_KG_CO2_SAVED, MIN_COINS_PER_ANALYSIS, HIGH_ECOSCORE_THRESHOLD,
    COINS_SUSTAINABLE_PURCHASE_HIGH_ECOSCORE, FIRST_ANALYSIS_BONUS, NOVICE_ANALYZER_THRESHOLD,
    NOVICE_ANALYZER_BONUS, ANALYSIS_STREAK_3_DAY_THRESHOLD, ANALYSIS_STREAK_3_DAY_BONUS,
    ANALYSIS_STREAK_7_DAY_THRESHOLD, ANALYSIS_STREAK_7_DAY_BONUS,
    COINS_PROFILE_COMPLETION, ECO_EXPLORER_THRESHOLD, ECO_EXPLORER_BONUS,
    CARBON_CRUSHER_THRESHOLD_KG, CARBON_CRUSHER_BONUS,
    ACHIEVEMENT_FIRST_ANALYSIS, ACHIEVEMENT_NOVICE_ANALYZER, ACHIEVEMENT_ECO_EXPLORER,
    ACHIEVEMENT_CARBON_CRUSHER, ACHIEVEMENT_PROFILE_COMPLETION,
    ACHIEVEMENT_ANALYSIS_STREAK_3_DAYS, ACHIEVEMENT_ANALYSIS_STREAK_7_DAYS,
    COINS_FIRST_EVER_SUSTAINABLE_PURCHASE, ACHIEVEMENT_FIRST_EVER_SUSTAINABLE_PURCHASE,
    AVAILABLE_QUIZZES, COINS_QUIZ_COMPLETION, FIRST_QUIZ_BONUS, ACHIEVEMENT_FIRST_QUIZ_COMPLETED, COINS_QUIZ_PERFECT_SCORE_BONUS,
    FEEDBACK_CATEGORIES, INITIAL_SELLER_PRODUCTS,
    SELLER_ONBOARDING_ACHIEVEMENTS, MOCK_USER_IMPACT_METRICS,
    INITIAL_MARKETPLACE_LISTINGS, COINS_FOR_LISTING_ITEM, COINS_FOR_MARKETPLACE_PURCHASE_USED_ITEM, ESTIMATED_CO2_SAVING_PER_USED_ITEM_KG,
    FAQ_DATA,
    INITIAL_RETURNABLE_PACKAGES, COINS_PACKAGE_RETURN_BASE, COINS_PACKAGE_GOOD_CONDITION_BONUS, PENALTY_PACKAGE_SLIGHT_DAMAGE, PENALTY_PACKAGE_HEAVY_DAMAGE
} from './constants';
import { generateProductIdeas, isGeminiAvailable, getEcoTip as fetchEcoTip, getSimulatedSellerResponse } from './services/geminiService'; 
import { calculateComprehensiveEcoScore } from './utils/ecoScoreCalculator';
import SearchSuggestions from './components/SearchSuggestions'; // Import directly for MultiModalHub prop

const MAX_ANALYSIS_HISTORY = 10;
const MAX_FEEDBACK_HISTORY = 20;
const MAX_MARKETPLACE_LISTINGS_DISPLAY = 50;

export type NavTarget = AppViewType | 'cart' | 'dashboard' | 'wallet';


const App: React.FC = (): React.JSX.Element => {
  const [products, setProducts] = useState<Product[]>(() => {
    const productsWithCalculatedScores = INITIAL_PRODUCTS.map(p => {
        const calculatedScore = calculateComprehensiveEcoScore(p);
        return { ...p, ecoScore: calculatedScore };
      });
    return productsWithCalculatedScores;
  });

  const [groupBuyCart, setGroupBuyCart] = useState<CartItem[]>([]);
  const [individualCart, setIndividualCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [geminiAvailableState, setGeminiAvailableState] = useState<boolean>(true); 

  const [userProfile, setUserProfile] = useState<UserProfile>((): UserProfile => {
    const storedProfile = localStorage.getItem('userProfile');
    const defaultUserId = `simUser-${Date.now()}`;
    const defaultState: UserProfile = { name: "Eco User", ecoInterests: [], userId: defaultUserId };
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed && typeof parsed.name === 'string' && Array.isArray(parsed.ecoInterests) && typeof parsed.userId === 'string') {
          return parsed as UserProfile;
        }
      } catch (e) {
        console.error("Failed to parse stored userProfile, using default.", e);
      }
    }
    return defaultState;
  });


  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [sustainablePackaging, setSustainablePackaging] = useState<boolean>(() => {
    const storedPref = localStorage.getItem('sustainablePackaging');
    return storedPref ? JSON.parse(storedPref) : false;
  });
  const [currentCartCo2Saved, setCurrentCartCo2Saved] = useState<number>(0);
  const [animatingProductId, setAnimatingProductId] = useState<string | null>(null);

  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [lifetimeCo2Saved, setLifetimeCo2Saved] = useState<number>(() => {
     const storedVal = localStorage.getItem('lifetimeCo2Saved');
     return storedVal ? JSON.parse(storedVal) : 0;
  });

  const searchContainerRef = useRef<HTMLDivElement>(null); // Keep for MultiModalHub wrapper if needed, or move ref inside MultiModalHub
  const [showSearchSuggestions, setShowSearchSuggestions] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<AppViewType>('home');
  const [analysisHistory, setAnalysisHistory] = useState<(ExternalAnalysisResult | BarcodeAnalysisResult)[]>(() => {
    const storedHistory = localStorage.getItem('analysisHistory');
    return storedHistory ? JSON.parse(storedHistory).map((item:any) => ({...item, analysisDate: new Date(item.analysisDate)})) : [];
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userCoins, setUserCoins] = useState<number>(() => {
    const storedCoins = localStorage.getItem('userEcoCoins');
    return storedCoins ? JSON.parse(storedCoins) : 100;
  });
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>(() => {
    const storedTransactions = localStorage.getItem('userCoinTransactions');
    return storedTransactions ? JSON.parse(storedTransactions).map((tx:any) => ({...tx, date: new Date(tx.date)})) : [];
  });
  const [showWalletPage, setShowWalletPage] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<Quiz | null>(null);


  const initialStreaks: UserStreaks = { analysisStreakDays: 0, lastAnalysisDate: null };
  const initialMilestones: UserMilestones = {
    productsAnalyzedCount: 0,
    sustainablePurchasesCount: 0,
    totalCo2EstimatedFromAnalyses: 0,
    quizzesCompletedCount: 0,
    achievementsUnlocked: [],
    marketplaceItemsListed: 0,
    marketplaceItemsSold: 0,
    marketplaceItemsPurchased: 0,
    packagesReturnedSuccessfully: 0,
  };

  const [userStreaks, setUserStreaks] = useState<UserStreaks>(() => {
    const storedStreaks = localStorage.getItem('userEcoStreaks');
    return storedStreaks ? JSON.parse(storedStreaks) : initialStreaks;
  });
  const [userMilestones, setUserMilestones] = useState<UserMilestones>(() => {
    const storedMilestones = localStorage.getItem('userEcoMilestones');
    if (storedMilestones) {
      const parsed = JSON.parse(storedMilestones);
      return {
        ...initialMilestones,
        ...parsed,
        achievementsUnlocked: Array.isArray(parsed.achievementsUnlocked) ? parsed.achievementsUnlocked : [],
      };
    }
    return initialMilestones;
  });

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackContextData, setFeedbackContextData] = useState<FeedbackContextData | undefined>(undefined);
  const [submittedFeedback, setSubmittedFeedback] = useState<ClientFeedbackSubmission[]>(() => {
    const storedFeedback = localStorage.getItem('userSubmittedFeedback');
    return storedFeedback ? JSON.parse(storedFeedback).map((fb:any) => ({...fb, submissionDate: new Date(fb.submissionDate)})) : [];
  });

  const [showSellerRegistrationWizard, setShowSellerRegistrationWizard] = useState(false);
  const [sellerApplicationData, setSellerApplicationData] = useState<SellerFormData | null>(() => {
    const storedData = localStorage.getItem('sellerApplicationData');
    return storedData ? JSON.parse(storedData) : null;
  });

  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState<boolean>(() => {
     return localStorage.getItem('isSellerRegistered') === 'true' && localStorage.getItem('isSellerLoggedIn') === 'true';
  });

  const [userImpactData, setUserImpactData] = useState<UserImpactMetrics>(MOCK_USER_IMPACT_METRICS);

  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(() => {
    const storedListings = localStorage.getItem('marketplaceListings');
    return storedListings ? JSON.parse(storedListings).map((l:any) => ({...l, listedDate: new Date(l.listedDate)})) : INITIAL_MARKETPLACE_LISTINGS;
  });
  const [showCreateListingModal, setShowCreateListingModal] = useState<boolean>(false);
  const [viewingMarketplaceListing, setViewingMarketplaceListing] = useState<MarketplaceListing | null>(null);
  
  const [showMarketplaceChatModal, setShowMarketplaceChatModal] = useState<boolean>(false);
  const [chattingWithSellerForListing, setChattingWithSellerForListing] = useState<MarketplaceListing | null>(null);
  const [currentMarketplaceChatMessages, setCurrentMarketplaceChatMessages] = useState<MarketplaceChatMessage[]>([]);
  const [isMarketplaceChatLoading, setIsMarketplaceChatLoading] = useState<boolean>(false);

  const [returnablePackages, setReturnablePackages] = useState<ReturnablePackage[]>(() => {
    const storedPackages = localStorage.getItem('returnablePackages');
    const initialPackagesWithUser = INITIAL_RETURNABLE_PACKAGES.map(pkg => ({
      ...pkg,
      userId: userProfile.userId 
    }));
    return storedPackages ? JSON.parse(storedPackages).map((p:any) => ({...p, returnByDate: p.returnByDate ? new Date(p.returnByDate) : undefined })) : initialPackagesWithUser;
  });
  const [showReturnInitiationModal, setShowReturnInitiationModal] = useState<boolean>(false);
  const [selectedPackageForReturn, setSelectedPackageForReturn] = useState<ReturnablePackage | null>(null);


  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) return storedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const addAlert = useCallback((message: string, type: AlertType, isCoinAlert: boolean = false) => {
    const id = Date.now().toString();
    const finalMessage = isCoinAlert ? `💰 ${message}` : message;
    setAlerts(prevAlerts => [...prevAlerts, { id, message: finalMessage, type }]);
    setTimeout(() => {
      setAlerts(currentAlerts => currentAlerts.filter(alert => alert.id !== id));
    }, isCoinAlert ? 7000 : 5000);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      body.classList.remove('bg-amazon-lightGray', 'text-amazon-textBlack');
      body.classList.add('dark:bg-amazon-darkBlue', 'dark:text-amazon-white');
    } else {
      document.documentElement.classList.remove('dark');
      body.classList.remove('dark:bg-amazon-darkBlue', 'dark:text-amazon-white');
      body.classList.add('bg-amazon-lightGray', 'text-amazon-textBlack');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addCoins = useCallback((amount: number, reason: string, achievementKey?: string, context?: CoinTransaction['context']) => {
    if (amount <= 0) return;
    setUserCoins(prevCoins => prevCoins + amount);
    const makeTransaction = (): CoinTransaction => ({
      id: `ct-${Date.now()}`, type: 'earned', amount, reason, date: new Date(), context
    });
    setCoinTransactions(prevTx => [makeTransaction(), ...prevTx].slice(0, 50));
    addAlert(`You earned ${amount} EcoCoin(s) for: ${reason}!`, AlertType.SUCCESS, true);
    if (achievementKey) {
        setUserMilestones(prev => ({ ...prev, achievementsUnlocked: [...new Set([...prev.achievementsUnlocked, achievementKey])] })); 
    }
  }, [addAlert]);


  const spendCoins = useCallback((amount: number, rewardName: string): boolean => {
    if (amount <= 0) return false;
    if (userCoins < amount) {
      addAlert(`Not enough EcoCoins to redeem "${rewardName}". You need ${amount - userCoins} more.`, AlertType.ERROR);
      return false;
    }
    setUserCoins(prevCoins => prevCoins - amount);
    const newTransaction: CoinTransaction = {
      id: `ct-${Date.now()}`, type: 'spent', amount, reason: `Redeemed: ${rewardName}`, date: new Date(),
    };
    setCoinTransactions(prevTx => [newTransaction, ...prevTx].slice(0, 50));
    addAlert(`Successfully redeemed "${rewardName}" for ${amount} EcoCoins!`, AlertType.SUCCESS, true);
    return true;
  }, [userCoins, addAlert]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyLoginAwardedToday = coinTransactions.some(
        tx => tx.reason === "Daily Login Bonus" && 
              new Date(tx.date).toISOString().split('T')[0] === todayStr
    );
    if (!dailyLoginAwardedToday) addCoins(COINS_DAILY_LOGIN, "Daily Login Bonus");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  useEffect(() => { localStorage.setItem('userEcoCoins', JSON.stringify(userCoins)); }, [userCoins]);
  useEffect(() => { localStorage.setItem('userCoinTransactions', JSON.stringify(coinTransactions)); }, [coinTransactions]);
  useEffect(() => { localStorage.setItem('userEcoStreaks', JSON.stringify(userStreaks)); }, [userStreaks]);
  useEffect(() => { localStorage.setItem('userEcoMilestones', JSON.stringify(userMilestones)); }, [userMilestones]);
  useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('sustainablePackaging', JSON.stringify(sustainablePackaging)); }, [sustainablePackaging]);
  useEffect(() => { localStorage.setItem('lifetimeCo2Saved', JSON.stringify(lifetimeCo2Saved)); }, [lifetimeCo2Saved]);
  useEffect(() => { localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory)); }, [analysisHistory]);
  useEffect(() => { localStorage.setItem('userSubmittedFeedback', JSON.stringify(submittedFeedback)); }, [submittedFeedback]);
  useEffect(() => { localStorage.setItem('sellerApplicationData', JSON.stringify(sellerApplicationData));}, [sellerApplicationData]);
  useEffect(() => { localStorage.setItem('isSellerLoggedIn', JSON.stringify(isSellerLoggedIn)); }, [isSellerLoggedIn]);
  useEffect(() => { localStorage.setItem('marketplaceListings', JSON.stringify(marketplaceListings)); }, [marketplaceListings]);
  useEffect(() => { localStorage.setItem('returnablePackages', JSON.stringify(returnablePackages)); }, [returnablePackages]);

  useEffect(() => { 
    setGeminiAvailableState(isGeminiAvailable()); 
  }, []); 

  useEffect(() => {
    const co2SavedFromGroupBuys = groupBuyCart.reduce((sum, item) => {
      const originalItemCarbon = item.carbonFootprint * item.quantity;
      return sum + (originalItemCarbon * DEFAULT_GROUP_BUY_DISCOUNT_PERCENTAGE) / 100;
    }, 0);
    const hasItemsInAnyCart = groupBuyCart.length > 0 || individualCart.length > 0;
    const packagingSaving = sustainablePackaging && hasItemsInAnyCart ? ECO_PACKAGING_CO2_SAVING : 0;
    const co2SavedFromEcoProductsInCart = [...groupBuyCart, ...individualCart].reduce((sum, item) => sum + (item.ecoScore >= 4 ? (0.1 * item.quantity) : 0), 0);
    setCurrentCartCo2Saved(co2SavedFromGroupBuys + packagingSaving + co2SavedFromEcoProductsInCart);
  }, [groupBuyCart, individualCart, sustainablePackaging]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const removeAlert = (id: string) => setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  const handleViewDetails = (product: Product) => setSelectedProduct(product);
  const handleCloseModal = () => setSelectedProduct(null);

  const handleAddToCart = (productToAdd: Product, cartType: CartType) => {
    const cartSetter = cartType === CartType.GROUP_BUY ? setGroupBuyCart : setIndividualCart;
    cartSetter(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);
      if (existingItem) return prevItems.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prevItems, { ...productToAdd, quantity: 1, cartType }];
    });
    addAlert(`${productToAdd.name} added to ${cartType === CartType.GROUP_BUY ? 'Group Buy' : 'Individual'} cart!`, AlertType.SUCCESS);
    triggerPurchaseAnimation(productToAdd.id);
    if (productToAdd.ecoScore >= HIGH_ECOSCORE_THRESHOLD) {
      addCoins(COINS_SUSTAINABLE_PURCHASE_HIGH_ECOSCORE, `Sustainable pick: ${productToAdd.name.substring(0, 20)}...`, undefined, { productId: productToAdd.id });
      if (!userMilestones.achievementsUnlocked.includes(ACHIEVEMENT_FIRST_EVER_SUSTAINABLE_PURCHASE)) {
        addCoins(COINS_FIRST_EVER_SUSTAINABLE_PURCHASE, "First Ever Sustainable Purchase Bonus!", ACHIEVEMENT_FIRST_EVER_SUSTAINABLE_PURCHASE, { productId: productToAdd.id });
      }
      setUserMilestones(prev => ({ ...prev, sustainablePurchasesCount: prev.sustainablePurchasesCount + 1 }));
    }
  };

  const handleRemoveFromCart = (productId: string, cartType: CartType) => {
    const cartSetter = cartType === CartType.GROUP_BUY ? setGroupBuyCart : setIndividualCart;
    cartSetter(prevItems => prevItems.filter(item => item.id !== productId));
    addAlert(`Item removed from ${cartType === CartType.GROUP_BUY ? 'Group Buy' : 'Individual'} cart.`, AlertType.INFO);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, cartType: CartType) => {
    if (quantity < 1) { handleRemoveFromCart(productId, cartType); return; }
    const cartSetter = cartType === CartType.GROUP_BUY ? setGroupBuyCart : setIndividualCart;
    cartSetter(prevItems => prevItems.map(item => (item.id === productId ? { ...item, quantity } : item)));
  };

  const executeSearch = useCallback(async (currentSearchTerm: string) => {
    if (!currentSearchTerm.trim()) {
      setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, ecoScore: calculateComprehensiveEcoScore(p) })));
      return;
    }
    if (!geminiAvailableState) { 
      const filtered = INITIAL_PRODUCTS.filter(p => p.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) || p.category.toLowerCase().includes(currentSearchTerm.toLowerCase())).map(p => ({ ...p, ecoScore: calculateComprehensiveEcoScore(p) }));
      setProducts(filtered);
      setIsLoadingProducts(false); 
      return;
    }
    setIsLoadingProducts(true);
    try {
      const ideas: GeneratedProductIdea[] = await generateProductIdeas(currentSearchTerm, userProfile.ecoInterests);
      if (ideas.length > 0) {
        const newProducts: Product[] = ideas.map((idea, index) => {
          const tempProduct: Product = {
            id: `gemini-${Date.now()}-${index}`, name: idea.name, imageUrl: `https://picsum.photos/seed/${encodeURIComponent(idea.name)}/400/300`, description: idea.description, ecoScore: 0,
            carbonFootprint: parseFloat((Math.random() * 5 + 0.5).toFixed(1)), category: idea.category, certifications: Math.random() > 0.5 ? ['GRS Certified Recycled'] : ['Organic Content'], price: idea.price,
            materials: idea.materials || [], durabilityScore: idea.durabilityScore || 3, packagingScore: idea.packagingScore || 3, healthImpactScore: idea.healthImpactScore || 3,
          };
          return { ...tempProduct, ecoScore: calculateComprehensiveEcoScore(tempProduct) };
        });
        setProducts(newProducts);
      } else {
        setProducts([]);
        addAlert(`No AI-suggested products found for "${currentSearchTerm}". Try different keywords.`, AlertType.INFO);
      }
    } catch (error) {
      console.error("Search error:", error);
      setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, ecoScore: calculateComprehensiveEcoScore(p) })));
      addAlert("Error fetching AI product suggestions. Showing initial products.", AlertType.ERROR);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [geminiAvailableState, userProfile.ecoInterests, addAlert]);


  const handleSearch = (currentSearchTerm: string) => {
    setShowSearchSuggestions(false);
    executeSearch(currentSearchTerm);
  };

  const handleSearchSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSearchSuggestions(false);
    executeSearch(suggestion);
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const clearAppStates = (options: { preserveView?: boolean } = {}) => {
    setSearchTerm(''); setSelectedProduct(null); setShowDashboard(false); setShowCartModal(false);
    setShowSearchSuggestions(false); setShowQuizModal(null); setIsFeedbackModalOpen(false);
    setShowSellerRegistrationWizard(false); setShowCreateListingModal(false); setViewingMarketplaceListing(null);
    setShowReturnInitiationModal(false); setSelectedPackageForReturn(null); setShowMarketplaceChatModal(false); 
    setChattingWithSellerForListing(null); setCurrentMarketplaceChatMessages([]);
    if (!options.preserveView) setIsSidebarOpen(false);
  };

  const handleGoHome = () => {
    setCurrentView('home'); clearAppStates();
    setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, ecoScore: calculateComprehensiveEcoScore(p) })));
  };

  const handleNavigation = (view: NavTarget) => {
    clearAppStates({ preserveView: view === currentView }); setIsSidebarOpen(false);
    if (view === 'cart') setShowCartModal(true);
    else if (view === 'dashboard') setShowDashboard(true);
    else if (view === 'wallet') setShowWalletPage(true);
    else setCurrentView(view);
  };

  const handleShowExternalAnalyzer = () => handleNavigation('analyzeExternal');
  const handleShowPersonalImpactDashboard = () => handleNavigation('personalImpactDashboard');

  const handleShowEcoTip = async () => {
    if (geminiAvailableState) { 
      const tip = await fetchEcoTip(); addAlert(tip, AlertType.INFO);
    } else { addAlert("Eco-Tip: AI unavailable.", AlertType.INFO); }
  };

  const handleAnalysisComplete = (result: ExternalAnalysisResult | BarcodeAnalysisResult) => {
    setAnalysisHistory(prevHistory => [result, ...prevHistory.slice(0, MAX_ANALYSIS_HISTORY - 1)]);
    const co2ForCoins = Math.max(0, result.co2FootprintKg);
    const coinsFromCo2 = Math.floor(co2ForCoins * COINS_PER_KG_CO2_SAVED);
    const analysisCoinsAwarded = Math.max(MIN_COINS_PER_ANALYSIS, coinsFromCo2);
    let analysisReason = `Product Analysis (${result.productName.substring(0,20)}...)`;
    if ('simulatedBarcode' in result) analysisReason = `Image Scan: ${result.productName.substring(0,15)}... (BC: ...${result.simulatedBarcode.slice(-4)})`;
    addCoins(analysisCoinsAwarded, analysisReason, undefined, { analyzedCo2Kg: result.co2FootprintKg });
    const todayStr = new Date().toISOString().split('T')[0];
    setUserMilestones(prev => {
        let updated = { ...prev, productsAnalyzedCount: prev.productsAnalyzedCount + 1, totalCo2EstimatedFromAnalyses: (prev.totalCo2EstimatedFromAnalyses || 0) + result.co2FootprintKg };
        if (updated.productsAnalyzedCount === 1 && !updated.achievementsUnlocked.includes(ACHIEVEMENT_FIRST_ANALYSIS)) addCoins(FIRST_ANALYSIS_BONUS, "First Product Analysis", ACHIEVEMENT_FIRST_ANALYSIS);
        if (updated.productsAnalyzedCount === NOVICE_ANALYZER_THRESHOLD && !updated.achievementsUnlocked.includes(ACHIEVEMENT_NOVICE_ANALYZER)) addCoins(NOVICE_ANALYZER_BONUS, `Novice Analyzer (${NOVICE_ANALYZER_THRESHOLD} Analyses)`, ACHIEVEMENT_NOVICE_ANALYZER);
        if (updated.productsAnalyzedCount === ECO_EXPLORER_THRESHOLD && !updated.achievementsUnlocked.includes(ACHIEVEMENT_ECO_EXPLORER)) addCoins(ECO_EXPLORER_BONUS, `Eco Explorer (${ECO_EXPLORER_THRESHOLD} Analyses)`, ACHIEVEMENT_ECO_EXPLORER);
        if (updated.totalCo2EstimatedFromAnalyses >= CARBON_CRUSHER_THRESHOLD_KG && !updated.achievementsUnlocked.includes(ACHIEVEMENT_CARBON_CRUSHER)) addCoins(CARBON_CRUSHER_BONUS, `Carbon Crusher (${CARBON_CRUSHER_THRESHOLD_KG}kg CO2)`, ACHIEVEMENT_CARBON_CRUSHER);
        return updated;
    });
    setUserStreaks(prev => {
      let currentStreak = prev.analysisStreakDays;
      if (prev.lastAnalysisDate) {
        const diffDays = Math.ceil((new Date(todayStr).getTime() - new Date(prev.lastAnalysisDate).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) currentStreak++; else if (diffDays > 1) currentStreak = 1;
      } else { currentStreak = 1; }
      if (currentStreak >= ANALYSIS_STREAK_3_DAY_THRESHOLD && !userMilestones.achievementsUnlocked.includes(ACHIEVEMENT_ANALYSIS_STREAK_3_DAYS)) addCoins(ANALYSIS_STREAK_3_DAY_BONUS, `${ANALYSIS_STREAK_3_DAY_THRESHOLD}-Day Analysis Streak`, ACHIEVEMENT_ANALYSIS_STREAK_3_DAYS);
      if (currentStreak >= ANALYSIS_STREAK_7_DAY_THRESHOLD && !userMilestones.achievementsUnlocked.includes(ACHIEVEMENT_ANALYSIS_STREAK_7_DAYS)) addCoins(ANALYSIS_STREAK_7_DAY_BONUS, `${ANALYSIS_STREAK_7_DAY_THRESHOLD}-Day Analysis Streak`, ACHIEVEMENT_ANALYSIS_STREAK_7_DAYS);
      return { analysisStreakDays: currentStreak, lastAnalysisDate: todayStr };
    });
    if (userMilestones.productsAnalyzedCount % 3 === 0) handleOpenFeedbackModal({ page: 'ExternalProductAnalyzer', userAction: 'analysis_completed', productId: result.productName });
  };

  const handleToggleDashboard = () => setShowDashboard(prev => !prev);
  const handleToggleCartModal = () => setShowCartModal(prev => !prev);
  const handleToggleWalletPage = () => setShowWalletPage(prev => !prev);
  const handleUpdatePackagingPreference = (preference: boolean) => { setSustainablePackaging(preference); addAlert(`Sustainable packaging ${preference ? 'enabled' : 'disabled'}.`, AlertType.INFO); };
  const handleUpdateEcoInterests = (interests: string[]) => {
    const hadPreviousInterests = userProfile.ecoInterests.length > 0;
    setUserProfile(prev => ({ ...prev, ecoInterests: interests }));
    addAlert("Eco-preferences updated!", AlertType.SUCCESS);
    if (!hadPreviousInterests && interests.length > 0 && !userMilestones.achievementsUnlocked.includes(ACHIEVEMENT_PROFILE_COMPLETION)) {
        addCoins(COINS_PROFILE_COMPLETION, "Profile Setup: Eco-Interests", ACHIEVEMENT_PROFILE_COMPLETION);
    }
  };

  const handleCheckout = () => {
    if (groupBuyCart.length === 0 && individualCart.length === 0) {
      addAlert("Your cart is empty.", AlertType.INFO); return;
    }
    setIsCheckingOut(true);
    const totalCO2CurrentOrder = currentCartCo2Saved;
    setTimeout(() => {
      setLifetimeCo2Saved(prev => prev + totalCO2CurrentOrder);
      setGroupBuyCart([]); setIndividualCart([]);
      setIsCheckingOut(false);
      addAlert("Checkout successful! Thank you for your eco-conscious purchase.", AlertType.SUCCESS);
    }, 2500);
  };

  const triggerPurchaseAnimation = (productId: string) => {
    setAnimatingProductId(productId);
    setTimeout(() => setAnimatingProductId(null), 2500);
  };

  const handleQuizComplete = (quizId: string, score: number, totalQuestions: number, coinsEarnedBase: number) => {
    setUserMilestones(prev => {
      const updatedMilestones = { ...prev, quizzesCompletedCount: prev.quizzesCompletedCount + 1 };
      if (updatedMilestones.quizzesCompletedCount === 1 && !updatedMilestones.achievementsUnlocked.includes(ACHIEVEMENT_FIRST_QUIZ_COMPLETED)) {
        addCoins(FIRST_QUIZ_BONUS, "First Quiz Completed!", ACHIEVEMENT_FIRST_QUIZ_COMPLETED, { quizId });
      }
      return updatedMilestones;
    });
    if (score === totalQuestions && AVAILABLE_QUIZZES.find(q=>q.id === quizId)?.coinsPerfectScoreBonus) {
      addCoins(AVAILABLE_QUIZZES.find(q=>q.id === quizId)!.coinsPerfectScoreBonus!, "Quiz Perfect Score!", undefined, { quizId });
    }
    setShowQuizModal(null); 
  };

  const handleOpenFeedbackModal = (context?: FeedbackContextData) => {
    setFeedbackContextData(context); setIsFeedbackModalOpen(true);
  };
  const handleFeedbackSubmit = (submission: ClientFeedbackSubmission) => {
    setSubmittedFeedback(prev => [submission, ...prev.slice(0, MAX_FEEDBACK_HISTORY -1)]);
    if (submission.coinsAwarded > 0) {
        addCoins(submission.coinsAwarded, `Feedback: ${submission.category}`, undefined, {feedbackId: submission.id});
    }
    addAlert("Thank you for your feedback!", AlertType.SUCCESS);
  };

  const handleSellerRegistrationComplete = (data: SellerFormData, totalCoinRewardFromSteps: number) => {
    setSellerApplicationData(data);
    localStorage.setItem('isSellerRegistered', 'true'); 
    addCoins(SELLER_ONBOARDING_ACHIEVEMENTS.registration_quick_starter.coins, SELLER_ONBOARDING_ACHIEVEMENTS.registration_quick_starter.name, SELLER_ONBOARDING_ACHIEVEMENTS.registration_quick_starter.id);
    addAlert("Seller registration complete! You can now log in to your Seller Admin dashboard.", AlertType.SUCCESS);
    setShowSellerRegistrationWizard(false);
  };

  const handleSellerLogin = () => setIsSellerLoggedIn(true);
  const handleSellerLogout = () => setIsSellerLoggedIn(false);
  
  const handleAddMarketplaceListing = (listingData: Omit<MarketplaceListing, 'id' | 'userId' | 'listedDate' | 'status' | 'estimatedCo2Saved'> & { imageFiles?: File[] }) => {
    const newListing: MarketplaceListing = {
      ...listingData,
      id: `mp-${Date.now()}`,
      userId: userProfile.userId,
      listedDate: new Date(),
      status: MarketplaceListingStatus.AVAILABLE,
      estimatedCo2Saved: ESTIMATED_CO2_SAVING_PER_USED_ITEM_KG, 
      images: listingData.images || ['https://picsum.photos/seed/default_list/400/300'], 
    };
    setMarketplaceListings(prev => [newListing, ...prev.slice(0, MAX_MARKETPLACE_LISTINGS_DISPLAY -1)]);
    addCoins(COINS_FOR_LISTING_ITEM, "New Marketplace Item Listed", undefined, { marketplaceListingId: newListing.id });
    addAlert("Your item has been listed on the marketplace!", AlertType.SUCCESS);
  };

  const handlePurchaseMarketplaceItem = (listingId: string) => {
    const item = marketplaceListings.find(l => l.id === listingId);
    if (!item || item.status === MarketplaceListingStatus.SOLD || item.userId === userProfile.userId) {
      addAlert("This item cannot be purchased.", AlertType.ERROR); return;
    }
    setMarketplaceListings(prev => prev.map(l => l.id === listingId ? {...l, status: MarketplaceListingStatus.SOLD} : l));
    if (item.currency !== 'Trade') { 
        addCoins(COINS_FOR_MARKETPLACE_PURCHASE_USED_ITEM, `Purchased: ${item.title.substring(0,15)}...`, undefined, {marketplaceListingId: item.id});
    }
    setLifetimeCo2Saved(prev => prev + (item.estimatedCo2Saved || ESTIMATED_CO2_SAVING_PER_USED_ITEM_KG));
    setUserMilestones(prev => ({...prev, marketplaceItemsPurchased: prev.marketplaceItemsPurchased + 1}));
    addAlert(`You purchased "${item.title}" from the marketplace!`, AlertType.SUCCESS);
    setViewingMarketplaceListing(null); 
  };

  const handleOpenMarketplaceChat = (listing: MarketplaceListing) => {
    setChattingWithSellerForListing(listing);
    setCurrentMarketplaceChatMessages([]); 
    if(isGeminiAvailable()) { 
        const greetingMsg: MarketplaceChatMessage = {
          id: `seller-greet-${Date.now()}`,
          listingId: listing.id,
          text: `Hello! Thanks for your interest in "${listing.title}". How can I help you?`,
          sender: 'seller',
          timestamp: new Date()
        };
        setCurrentMarketplaceChatMessages([greetingMsg]);
    }
    setShowMarketplaceChatModal(true);
  };

  const handleSendMarketplaceChatMessage = async (messageText: string) => {
    if (!chattingWithSellerForListing) return;
    const userMsg: MarketplaceChatMessage = {
      id: `user-chat-${Date.now()}`,
      listingId: chattingWithSellerForListing.id,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    setCurrentMarketplaceChatMessages(prev => [...prev, userMsg]);
    
    if (!isGeminiAvailable()) { 
        const unavailableMsg: MarketplaceChatMessage = {
            id: `seller-unavail-${Date.now()}`, listingId: chattingWithSellerForListing.id,
            text: "Sorry, the seller (AI simulation) is currently offline.", sender: 'seller', timestamp: new Date()
        };
        setCurrentMarketplaceChatMessages(prev => [...prev, unavailableMsg]);
        return;
    }

    setIsMarketplaceChatLoading(true);
    try {
        const sellerResponseText = await getSimulatedSellerResponse(chattingWithSellerForListing, messageText, [...currentMarketplaceChatMessages, userMsg]);
        const sellerMsg: MarketplaceChatMessage = {
            id: `seller-resp-${Date.now()}`, listingId: chattingWithSellerForListing.id,
            text: sellerResponseText, sender: 'seller', timestamp: new Date()
        };
        setCurrentMarketplaceChatMessages(prev => [...prev, sellerMsg]);
    } catch (error) {
        console.error("Error getting seller response:", error);
        const errorMsg: MarketplaceChatMessage = {
             id: `seller-error-${Date.now()}`, listingId: chattingWithSellerForListing.id,
             text: "Sorry, I'm having a bit of trouble. Could you try again?", sender: 'seller', timestamp: new Date()
        };
        setCurrentMarketplaceChatMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsMarketplaceChatLoading(false);
    }
  };

  const handleOpenReturnInitiationModal = (pkg: ReturnablePackage) => {
    setSelectedPackageForReturn(pkg);
    setShowReturnInitiationModal(true);
  };

  const handleInitiateReturn = (packageId: string, reportedCondition: PackageCondition) => {
    setReturnablePackages(prev => prev.map(p => 
        p.id === packageId 
        ? { ...p, status: ReturnPackageStatus.RETURN_INITIATED, reportedConditionByUser: reportedCondition } 
        : p
    ));
    addAlert(`Return initiated for package ${packageId.slice(-6)}. Please use the QR code at a drop-off point.`, AlertType.SUCCESS);
    setShowReturnInitiationModal(false);
  };

  const handleSimulatePackageProcessing = (packageId: string) => {
    const pkg = returnablePackages.find(p => p.id === packageId);
    if (!pkg || pkg.status !== ReturnPackageStatus.RETURN_INITIATED) return;

    let assessedCondition = pkg.reportedConditionByUser || PackageCondition.GOOD;
    let coinReward = COINS_PACKAGE_RETURN_BASE;
    let alertType = AlertType.SUCCESS;
    let alertMessage = "";

    if (Math.random() < 0.1 && assessedCondition !== PackageCondition.HEAVILY_DAMAGED) { 
        assessedCondition = assessedCondition === PackageCondition.GOOD ? PackageCondition.SLIGHTLY_DAMAGED : PackageCondition.HEAVILY_DAMAGED;
    }
    
    let finalStatus = ReturnPackageStatus.RETURN_COMPLETED;

    if (assessedCondition === PackageCondition.GOOD) {
        coinReward += COINS_PACKAGE_GOOD_CONDITION_BONUS;
        alertMessage = `Package ${packageId.slice(-6)} processed. Condition: Good. ${coinReward} EcoCoins awarded!`;
    } else if (assessedCondition === PackageCondition.SLIGHTLY_DAMAGED) {
        coinReward -= PENALTY_PACKAGE_SLIGHT_DAMAGE; 
        coinReward = Math.max(0, coinReward); 
        alertMessage = `Package ${packageId.slice(-6)} processed. Condition: Slightly Damaged. ${coinReward} EcoCoins awarded.`;
    } else { 
        finalStatus = ReturnPackageStatus.RETURN_REJECTED;
        coinReward = 0; 
        alertMessage = `Package ${packageId.slice(-6)} return rejected due to heavy damage. No EcoCoins awarded.`;
        alertType = AlertType.ERROR;
    }
    
    if (finalStatus === ReturnPackageStatus.RETURN_COMPLETED && coinReward > 0) {
        addCoins(coinReward, `Package Return: ${pkg.productName.substring(0,15)}...`, undefined, {returnPackageId: packageId});
        setUserMilestones(prev => ({...prev, packagesReturnedSuccessfully: prev.packagesReturnedSuccessfully + 1}));
    }

    setReturnablePackages(prev => prev.map(p => 
        p.id === packageId 
        ? { ...p, status: finalStatus, assessedConditionByHub: assessedCondition, rewardEcoCoins: finalStatus === ReturnPackageStatus.RETURN_COMPLETED ? coinReward : undefined } 
        : p
    ));
    addAlert(alertMessage, alertType);
  };


  const renderHomeView = () => (
    <div className="container mx-auto px-2 sm:px-4 py-4">
      <div className="mb-6 sm:mb-8" ref={searchContainerRef}>
         <MultiModalHub
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={handleSearch}
            showSearchSuggestions={showSearchSuggestions}
            setShowSearchSuggestions={setShowSearchSuggestions}
            SearchSuggestionsComponent={SearchSuggestions}
            onSuggestionClick={handleSearchSuggestionClick}
            predefinedSearchSuggestions={PREDEFINED_SEARCH_SUGGESTIONS}
            isLoadingProducts={isLoadingProducts}
            isGeminiAvailable={geminiAvailableState}
            addAlert={addAlert}
            onExternalAnalysisComplete={handleAnalysisComplete}
            onNavigate={handleNavigation}
            onGetEcoTip={handleShowEcoTip}
          />
      </div>
      
      <ProductList
        products={products}
        onViewDetails={handleViewDetails}
        onAddToCart={handleAddToCart}
        isLoading={isLoadingProducts}
        title="Featured Eco-Friendly Products"
        triggerPurchaseAnimation={triggerPurchaseAnimation}
      />
      <ProductList
        products={products.slice(0,4).reverse()} 
        onViewDetails={handleViewDetails}
        onAddToCart={handleAddToCart}
        isLoading={isLoadingProducts}
        title="Recently Viewed Products"
        triggerPurchaseAnimation={triggerPurchaseAnimation}
      />
      <SustainabilityInsights />
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home': return renderHomeView();
      case 'analyzeExternal': return <ExternalProductAnalyzer addAlert={addAlert} isGeminiAvailable={geminiAvailableState} onAnalysisComplete={handleAnalysisComplete} />; 
      case 'sellerAdmin': return <SellerAdminPage isSellerLoggedIn={isSellerLoggedIn} onLogin={handleSellerLogin} onLogout={handleSellerLogout} addAlert={addAlert} calculateEcoScore={calculateComprehensiveEcoScore} />;
      case 'personalImpactDashboard': return <PersonalImpactDashboard userImpactData={userImpactData} addAlert={addAlert} />;
      case 'marketplace': return <MarketplaceView listings={marketplaceListings} onViewListing={setViewingMarketplaceListing} onOpenCreateListingModal={() => setShowCreateListingModal(true)} isLoading={false} />;
      case 'faq': return <FAQView faqData={FAQ_DATA} onGoHome={handleGoHome} />;
      case 'returns': return <ReturnPackagingView packages={returnablePackages.filter(p=>p.userId === userProfile.userId)} onInitiateReturn={handleOpenReturnInitiationModal} onSimulateProcessing={handleSimulatePackageProcessing} />;
      default: return renderHomeView();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-amazon-lightGray dark:bg-amazon-darkBlue">
      <Header
        onGoHome={handleGoHome}
        onShowCart={handleToggleCartModal}
        userCoins={userCoins}
        cartItemCount={groupBuyCart.reduce((sum, item) => sum + item.quantity, 0) + individualCart.reduce((sum, item) => sum + item.quantity, 0)}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleSidebar={toggleSidebar}
        onNavigate={handleNavigation} 
        onShowDashboard={() => handleNavigation('dashboard')}
        onShowPersonalImpactDashboard={handleShowPersonalImpactDashboard}
        onShowWalletPage={() => handleNavigation('wallet')}
      />
      <main className="flex-grow">
        {renderCurrentView()}
      </main>
      <SustainabilityChatbot analysisHistory={analysisHistory} isGeminiAvailable={geminiAvailableState} addAlert={addAlert}/> 
      <Footer 
        onNavigateToFAQ={() => handleNavigation('faq')}
        onOpenFeedbackModal={() => handleOpenFeedbackModal({page: currentView, userAction: "opened_feedback_from_footer"})}
        onOpenSellerRegistration={() => setShowSellerRegistrationWizard(true)}
        onNavigateToSellerAdmin={() => handleNavigation('sellerAdmin')}
        onNavigateToReturns={() => handleNavigation('returns')}
      />
      <Alerts alerts={alerts} removeAlert={removeAlert} />
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} onAddToCart={handleAddToCart} triggerPurchaseAnimation={triggerPurchaseAnimation} userEcoInterests={userProfile.ecoInterests} />}
      {showDashboard && <CustomerDashboard currentCartCo2Saved={currentCartCo2Saved} lifetimeCo2Saved={lifetimeCo2Saved} packagingPreference={sustainablePackaging} onUpdatePackagingPreference={handleUpdatePackagingPreference} onClose={handleToggleDashboard} userProfile={userProfile} onUpdateEcoInterests={handleUpdateEcoInterests} groupBuyItemsCount={groupBuyCart.length} activeGroupBuySimulationsCount={groupBuyCart.length > 0 ? 1:0} />}
      {showCartModal && <CartModal isOpen={showCartModal} onClose={handleToggleCartModal} groupBuyItems={groupBuyCart} individualItems={individualCart} onRemoveItem={handleRemoveFromCart} onUpdateQuantity={handleUpdateCartQuantity} onProceedToCheckout={handleCheckout} />}
      {animatingProductId && <PurchaseAnimation productId={animatingProductId} onAnimationEnd={() => setAnimatingProductId(null)} />}
      {isCheckingOut && <CheckoutAnimation isOpen={isCheckingOut} />}
      {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onNavigate={handleNavigation} onShowExternalAnalyzer={handleShowExternalAnalyzer} onNavigateToMarketplace={() => handleNavigation('marketplace')} onNavigateToReturns={()=> handleNavigation('returns')} onNavigateToFAQ={() => handleNavigation('faq')} onOpenFeedbackModal={() => { setIsFeedbackModalOpen(true); setIsSidebarOpen(false); }} onOpenSellerRegistration={() => { setShowSellerRegistrationWizard(true); setIsSidebarOpen(false);}} onNavigateToSellerAdmin={() => handleNavigation('sellerAdmin')} isSellerLoggedIn={isSellerLoggedIn} sellerApplicationData={sellerApplicationData} userProfileName={userProfile.name}/>}
      {showQuizModal && <SustainabilityQuizModal quiz={showQuizModal} isOpen={!!showQuizModal} onClose={() => setShowQuizModal(null)} onQuizComplete={handleQuizComplete} addCoins={addCoins} />}
      {isFeedbackModalOpen && <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} onSubmit={handleFeedbackSubmit} contextData={feedbackContextData} />}
      {showSellerRegistrationWizard && <SellerRegistrationWizard isOpen={showSellerRegistrationWizard} onClose={() => setShowSellerRegistrationWizard(false)} onComplete={handleSellerRegistrationComplete} addCoins={addCoins} userProfile={userProfile} />}
      {showCreateListingModal && <CreateListingModal isOpen={showCreateListingModal} onClose={() => setShowCreateListingModal(false)} onAddListing={handleAddMarketplaceListing} isGeminiAvailable={geminiAvailableState} addAlert={addAlert} />} 
      {viewingMarketplaceListing && <MarketplaceListingDetailModal listing={viewingMarketplaceListing} onClose={() => setViewingMarketplaceListing(null)} onPurchase={handlePurchaseMarketplaceItem} currentUserProfile={userProfile} onOpenChat={handleOpenMarketplaceChat}/>}
      {showMarketplaceChatModal && chattingWithSellerForListing && <MarketplaceChatModal isOpen={showMarketplaceChatModal} onClose={() => setShowMarketplaceChatModal(false)} listing={chattingWithSellerForListing} messages={currentMarketplaceChatMessages} onSendMessage={handleSendMarketplaceChatMessage} isLoading={isMarketplaceChatLoading} isGeminiAvailable={geminiAvailableState} />} 
      {showReturnInitiationModal && selectedPackageForReturn && <ReturnInitiationModal isOpen={showReturnInitiationModal} onClose={() => setShowReturnInitiationModal(false)} packageData={selectedPackageForReturn} onInitiateReturn={handleInitiateReturn}/>}
      {showWalletPage && <WalletPage
          isOpen={showWalletPage}
          onClose={handleToggleWalletPage}
          userCoins={userCoins}
          transactions={coinTransactions}
          rewards={INITIAL_MOCK_REWARDS}
          onRedeemReward={(reward) => spendCoins(reward.cost, reward.name)}
          addAlert={addAlert}
          userMilestones={userMilestones}
          onTakeQuiz={(quiz) => { setShowQuizModal(quiz); setShowWalletPage(false); }}
        />}
    </div>
  );
};

export default App;

