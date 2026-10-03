import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ProfileHeader } from './components/ProfileHeader';
import { Feed } from './components/Feed';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SUBSCRIPTION_PLANS } from './data/mockData';
import { Plan } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { AdminSettingsProvider, useAdminSettings } from './context/AdminSettingsContext';

function PrivacyApp() {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('privacy_is_vip') === 'true';
    } catch {
      return false;
    }
  });

  const { setIsAdminOpen } = useAdminSettings();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(SUBSCRIPTION_PLANS[0]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Secret URL parameters: ?admin=true, ?secret=admin, ?painel=master, #admin, #painel
  useEffect(() => {
    const checkSecretUrl = () => {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('admin') === 'true' ||
        params.get('secret') === 'admin' ||
        params.get('painel') === 'master' ||
        window.location.hash === '#admin' ||
        window.location.hash === '#painel'
      ) {
        setIsAdminOpen(true);
      }
    };
    checkSecretUrl();
    window.addEventListener('hashchange', checkSecretUrl);
    return () => window.removeEventListener('hashchange', checkSecretUrl);
  }, [setIsAdminOpen]);

  // Secret Keyboard Shortcut: Ctrl + Shift + A (or Cmd + Shift + A on Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAdminOpen]);

  // Secret Footer Click Trigger (5 rapid clicks on footer copyright)
  const footerClickRef = useRef(0);
  const footerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretFooterClick = () => {
    footerClickRef.current += 1;
    if (footerTimerRef.current) clearTimeout(footerTimerRef.current);
    footerTimerRef.current = setTimeout(() => {
      footerClickRef.current = 0;
    }, 2500);

    if (footerClickRef.current >= 5) {
      footerClickRef.current = 0;
      setIsAdminOpen(true);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleSubscribeSuccess = () => {
    setIsSubscribed(true);
    try {
      localStorage.setItem('privacy_is_vip', 'true');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-900 pb-12 flex flex-col items-center relative">
      {/* Sticky Top Header with Globe Language Selector */}
      <Header />

      {/* Main Single Column Container (Max-Width 420px, authentic to mobile screenshot) */}
      <main className="w-full max-w-[420px] px-3 pt-3 flex flex-col gap-3">
        {/* Creator Profile Summary & Plan Selector */}
        <ProfileHeader
          isSubscribed={isSubscribed}
          onSelectPlan={handleSelectPlan}
          onOpenTipModal={() => setIsCheckoutOpen(true)}
        />

        {/* Feed Posts */}
        <Feed
          onOpenSubscribe={() => handleSelectPlan(SUBSCRIPTION_PLANS[0])}
        />
      </main>

      {/* Subtle Footer with admin access */}
      <footer className="w-full max-w-[420px] px-4 py-8 text-center text-[11px] text-gray-400 select-none">
        <div className="flex items-center justify-center gap-1.5">
          <span 
            onClick={() => setIsAdminOpen(true)}
            className="cursor-pointer hover:text-gray-600 transition-colors"
          >
            © 2026 Privacy • Todos os direitos reservados
          </span>
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            title="Acessar Gestão Master"
            className="text-[11px] text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
          >
            ⚙️
          </button>
        </div>
      </footer>

      {/* Checkout Modal (Atenas Pay PIX + Stripe Card) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
        onSuccessSubscribe={handleSubscribeSuccess}
      />

      {/* Admin Panel Modal (With PIN/Password Gatekeeper) */}
      <AdminPanelModal />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AdminSettingsProvider>
        <PrivacyApp />
      </AdminSettingsProvider>
    </LanguageProvider>
  );
}
