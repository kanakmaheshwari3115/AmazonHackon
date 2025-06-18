
import React from 'react';

interface FooterProps {
  onNavigateToFAQ: () => void;
  onOpenFeedbackModal: () => void;
  onOpenSellerRegistration: () => void;
  onNavigateToSellerAdmin: () => void;
  onNavigateToReturns: () => void; // Added from previous error log and App.tsx structure
  // Consider adding onNavigateToDashboard or similar if "Your Account" should link specifically
}

const FooterLink: React.FC<{label: string, onClick?: () => void, href?: string, title?: string}> = ({ label, onClick, href, title }) => (
  <a // Changed to <a> for better semantics, can still use onClick for app navigation
    onClick={onClick} 
    href={href || '#'} // Provide a fallback href
    title={title || label}
    className="block text-sm text-amazon-mediumGray hover:text-amazon-white hover:underline py-1.5 text-left transition-colors duration-150"
  >
    {label}
  </a>
);


const Footer: React.FC<FooterProps> = ({
  onNavigateToFAQ,
  onOpenFeedbackModal,
  onOpenSellerRegistration,
  onNavigateToSellerAdmin,
  onNavigateToReturns,
}) => {
  const scrollToTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-amazon-navBlue text-amazon-white mt-auto">
      <div className="bg-amazon-darkBlue/80 hover:bg-amazon-darkBlue transition-colors duration-200">
        <button onClick={scrollToTop} className="block w-full text-center text-sm py-4 text-amazon-white hover:text-opacity-90">
          Back to top
        </button>
      </div>
      <div className="container mx-auto px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 text-left">
          <div>
            <h3 className="font-bold mb-3 text-base text-amazon-white">Get to Know Us</h3>
            <FooterLink label="About EcoShop" onClick={() => alert("About EcoShop (coming soon)")} />
            <FooterLink label="Sustainability Pledge" onClick={() => alert("Sustainability Pledge (coming soon)")} />
            {/* <FooterLink label="Careers (Simulated)" href="#" />
            <FooterLink label="Press Releases (Simulated)" href="#" /> */}
          </div>
          <div>
            <h3 className="font-bold mb-3 text-base text-amazon-white">Make Money with Us</h3>
            <FooterLink label="Sell on EcoShop" onClick={onOpenSellerRegistration} />
            <FooterLink label="Seller Admin Login" onClick={onNavigateToSellerAdmin} />
            {/* <FooterLink label="Become an Affiliate (Simulated)" href="#" />
            <FooterLink label="Advertise Your Products (Simulated)" href="#" /> */}
          </div>
          <div>
            <h3 className="font-bold mb-3 text-base text-amazon-white">EcoShop Payment Products</h3>
            <FooterLink label="EcoShop Rewards Card (Coming soon)" href="#" />
            <FooterLink label="Shop with Points (Coming soon)" href="#" />
            {/* <FooterLink label="Reload Your Balance (Simulated)" href="#" />
            <FooterLink label="EcoShop Currency Converter (Simulated)" href="#" /> */}
          </div>
          <div>
            <h3 className="font-bold mb-3 text-base text-amazon-white">Let Us Help You</h3>
            {/* <FooterLink label="Your Account (Dashboard)" onClick={() => alert("Navigate to Dashboard (To be implemented via prop if needed)")} /> */}
            <FooterLink label="Your Orders & Returns" onClick={onNavigateToReturns} />
            {/* <FooterLink label="Shipping Rates & Policies (Simulated)" href="#" /> */}
            <FooterLink label="FAQ & Help" onClick={onNavigateToFAQ} />
            <FooterLink label="Provide Feedback" onClick={onOpenFeedbackModal} />
          </div>
        </div>
      </div>
      <div className="bg-amazon-darkBlue py-8 text-center border-t border-amazon-mediumGray/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amazon-orange mr-2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0 1 12 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253m0 0A11.978 11.978 0 0 0 12 16.5c2.998 0 5.74-1.1 7.843-2.918" />
            </svg>
            <span className="text-xl font-semibold text-amazon-white">EcoShop Navigator</span>
          </div>
          <div className="flex justify-center space-x-4 mb-4 text-xs text-amazon-linkBlue">
            <a href="#" className="hover:underline">Conditions of Use</a>
            <a href="#" className="hover:underline">Privacy Notice</a>
            <a href="#" className="hover:underline">Your Ads Privacy Choices</a>
          </div>
          <p className="text-xs text-amazon-mediumGray">
            &copy; 1996-{new Date().getFullYear()}, EcoShop.com, Inc. or its affiliates.
          </p>
           <p className="text-xs text-amazon-mediumGray/70 mt-1">This is a prototype project and is not affiliated with Amazon or its services.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
