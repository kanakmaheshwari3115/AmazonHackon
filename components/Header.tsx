
import React from 'react';
import { Theme } from '../types';
import type { NavTarget } from '../App'; // Keep this import

interface HeaderProps {
  onGoHome: () => void;
  onShowCart: () => void;
  userCoins: number;
  cartItemCount: number;
  theme: Theme;
  toggleTheme: () => void;
  onNavigate: (target: NavTarget) => void; // Added
  onToggleSidebar: () => void;
  onShowDashboard: () => void; 
  onShowPersonalImpactDashboard: () => void; // Keep for now, might be used by sidebar or secondary nav
  onShowWalletPage: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onShowCart,
  userCoins,
  cartItemCount,
  theme,
  toggleTheme,
  onNavigate, // Added
  onToggleSidebar,
  onShowDashboard,
  onShowPersonalImpactDashboard, // Keep prop
  onShowWalletPage,
}) => {
  return (
    <header className="bg-amazon-navBlue text-amazon-white sticky top-0 z-50 shadow-md">
      {/* Main Navigation Bar */}
      <div className="container mx-auto px-2 sm:px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={onGoHome}
            className="flex items-center text-amazon-white hover:opacity-90 transition duration-150 mr-1 sm:mr-2 p-1 border border-transparent hover:border-amazon-white rounded-sm"
            aria-label="Go to Homepage"
            title="EcoShop Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-amazon-orange">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0 1 12 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253m0 0A11.978 11.978 0 0 0 12 16.5c2.998 0 5.74-1.1 7.843-2.918" />
            </svg>
            <span className="text-xl sm:text-2xl font-bold ml-1 sm:ml-2 hidden md:block">EcoShop</span>
          </button>
        </div>

        {/* Placeholder for Deliver to / Location - Common on Amazon */}
        <button className="hidden md:flex items-center p-1 border border-transparent hover:border-amazon-white rounded-sm text-left">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 text-amazon-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <div>
            <span className="block text-xs text-amazon-mediumGray leading-tight">Deliver to</span>
            <span className="text-sm font-bold text-amazon-white leading-tight">New Delhi 110043</span>
          </div>
        </button>

        {/* Central Search Bar - This is now primarily handled by MultiModalHub in App.tsx for main page. This header space is reduced. */}
        <div className="flex-grow max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-2 sm:mx-4">
           {/* This space intentionally left for main page search bar, or could house a simplified search trigger */}
        </div>
        
        {/* Right Side Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          {/* Theme Toggle - Minimal */}
           <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-sm hover:bg-amazon-darkBlue focus:outline-none border border-transparent hover:border-amazon-white"
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-amazon-yellow">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-amazon-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21c3.09 0 5.839-1.107 7.95-2.948a9.75 9.75 0 0 0 .802-3.05Z" />
              </svg>
            )}
          </button>

          {/* Account & Lists (Simplified to "My Dashboard") */}
          <button
            onClick={onShowDashboard}
            className="hidden sm:flex flex-col items-start px-1.5 py-1 hover:border hover:border-amazon-white rounded-sm transition-all duration-150 leading-tight"
            title="My Dashboard"
          >
            <span className="text-xs text-amazon-white font-bold flex items-center">My Eco</span>
            <span className="text-sm font-bold text-amazon-white flex items-center">Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
            </span>
          </button>

          {/* EcoCoins Wallet (Adapted from Orders/Returns slot) */}
          <button
            onClick={onShowWalletPage}
            className="flex flex-col items-start px-1.5 py-1 hover:border hover:border-amazon-white rounded-sm transition-all duration-150 leading-tight"
            aria-label="Open Wallet"
            title="My EcoCoins Wallet"
          >
            <span className="text-xs text-amazon-white">EcoCoins</span>
            <span className="text-sm font-bold text-amazon-white flex items-center">
              {userCoins}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-0.5 text-amazon-orange"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6.248a2.251 2.251 0 0 1-2.062 2.248H5.062A2.251 2.251 0 0 1 3 18.248V12m18 0V6.75A2.25 2.25 0 0 0 18.75 4.5H5.25A2.25 2.25 0 0 0 3 6.75v5.25m0 0H21" /></svg>
            </span>
          </button>

          {/* Cart */}
          <button
            onClick={onShowCart}
            className="relative flex items-end px-1.5 py-1 hover:border hover:border-amazon-white rounded-sm transition-all duration-150"
            aria-label="Open Cart"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-amazon-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-amazon-orange text-amazon-textBlack text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-bold ml-0.5 hidden sm:block mt-1">Cart</span>
          </button>
        </div>
      </div>
      
      {/* Secondary Navigation Bar (Amazon All, Today's Deals, etc.) */}
      <div className="bg-amazon-darkBlue text-amazon-white px-2 sm:px-4 py-1.5 text-xs sm:text-sm">
        <div className="container mx-auto flex items-center space-x-3 sm:space-x-4 overflow-x-auto whitespace-nowrap">
            <button onClick={onToggleSidebar} className="flex items-center p-1 hover:border hover:border-amazon-white rounded-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                All
            </button>
            <button onClick={() => alert("Today's Deals page (coming soon)")} className="p-1 hover:border hover:border-amazon-white rounded-sm">Today's Deals</button>
            <button onClick={onShowPersonalImpactDashboard} className="p-1 hover:border hover:border-amazon-white rounded-sm">My Impact</button>
            <button onClick={() => alert("Our Customer Service page is coming soon! In the meantime, feel free to explore the FAQ section, submit your feedback, or ask the Eco Assistant for help with your issue.")} className="p-1 hover:border hover:border-amazon-white rounded-sm">Customer Service</button>
            <button onClick={() => onNavigate('faq')} className="p-1 hover:border hover:border-amazon-white rounded-sm">FAQ</button>
            {/* Add more links as needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;

