import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage, Language } from './LanguageContext';

export type CurrencyType = 'BRL' | 'USD' | 'EUR';

export interface AdminSettings {
  // Profile
  name: string;
  username: string;
  avatar: string;
  cover: string;
  verified: boolean;

  // Stats
  photos: number;
  videos: number;
  locked: number;
  likes: string;

  // Bios
  bio_pt: string;
  bio_es: string;
  bio_en: string;

  // Offer notices
  offerNotice_pt: string;
  offerNotice_es: string;
  offerNotice_en: string;

  // Currency (optional manual override)
  currency: CurrencyType;

  // Plan Prices
  monthly: {
    priceBRL: number;
    priceUSD: number;
    priceEUR: number;
    originalBRL: number;
    originalUSD: number;
    originalEUR: number;
    discountBadge: string;
  };
  quarterly: {
    priceBRL: number;
    priceUSD: number;
    priceEUR: number;
    originalBRL: number;
    originalUSD: number;
    originalEUR: number;
    discountBadge: string;
  };
  semiannual: {
    priceBRL: number;
    priceUSD: number;
    priceEUR: number;
    originalBRL: number;
    originalUSD: number;
    originalEUR: number;
    discountBadge: string;
  };

  // PIX Configuration
  pixKey?: string;
  pixName?: string;
  pixCity?: string;

  // SigiloPay Gateway
  sigilopayPublicKey?: string;
  sigilopaySecretKey?: string;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  name: 'Leticia Vargas',
  username: '@vargasleticiaz',
  avatar: '/src/assets/images/leticia_avatar_1790996538192.jpg',
  cover: '/src/assets/images/leticia_cover_1790996456942.jpg',
  verified: true,

  pixKey: 'guifzp7@gmail.com',
  pixName: 'Leticia Vargas',
  pixCity: 'SAO PAULO',

  sigilopayPublicKey: '',
  sigilopaySecretKey: '',

  photos: 59,
  videos: 45,
  locked: 12,
  likes: '4.3K',

  bio_pt: 'APROVEITE A PROMO!! 💖 Oii gato! Sou uma moreninha mais bonita da faculdade e eu tenho o MELHOR CONTEÚDO DA PRIVACY. Vem conversar comigo, quero realizar seus desejos. Mas...',
  bio_es: '¡¡APROVECHA LA PROMO!! 💖 ¡Hola guapo! Soy la morenita más linda de la universidad y tengo el MEJOR CONTENIDO DE PRIVACY. Ven a hablar conmigo, quiero cumplir tus deseos. Pero...',
  bio_en: "TAKE ADVANTAGE OF THE PROMO!! 💖 Hey handsome! I'm the prettiest brunette in college and I have the BEST CONTENT ON PRIVACY. Come chat with me, I want to fulfill your desires. But...",

  offerNotice_pt: 'CHAMADA DE VIDEO ONN ( 90% OFF )',
  offerNotice_es: 'VIDEOLLAMADA ONN ( 90% OFF )',
  offerNotice_en: 'VIDEO CALL ONN ( 90% OFF )',

  currency: 'BRL',

  monthly: {
    priceBRL: 14.95,
    priceUSD: 4.99,
    priceEUR: 4.49,
    originalBRL: 29.90,
    originalUSD: 9.99,
    originalEUR: 8.99,
    discountBadge: 'Economize 50%',
  },
  quarterly: {
    priceBRL: 45.75,
    priceUSD: 14.99,
    priceEUR: 13.49,
    originalBRL: 89.70,
    originalUSD: 29.99,
    originalEUR: 26.99,
    discountBadge: '49% off',
  },
  semiannual: {
    priceBRL: 89.70,
    priceUSD: 28.99,
    priceEUR: 25.99,
    originalBRL: 179.40,
    originalUSD: 59.99,
    originalEUR: 53.99,
    discountBadge: '50% off',
  },
};

interface AdminContextType {
  settings: AdminSettings;
  updateSettings: (newSettings: AdminSettings) => Promise<boolean>;
  resetSettings: () => Promise<void>;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  currentCurrency: CurrencyType;
  formatPrice: (amount: number, currencyOverride?: CurrencyType) => string;
  getActivePrice: (planKey: 'monthly' | 'quarterly' | 'semiannual') => {
    price: number;
    priceFormatted: string;
    originalPrice: number;
    originalFormatted: string;
    badge: string;
  };
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const local = localStorage.getItem('privacy_admin_settings');
      if (local) {
        return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(local) };
      }
    } catch {}
    return DEFAULT_ADMIN_SETTINGS;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Derive currency directly from selected language:
  // pt -> BRL (R$)
  // es -> EUR (€)
  // en -> USD ($)
  const currentCurrency: CurrencyType =
    language === 'en' ? 'USD' : language === 'es' ? 'EUR' : 'BRL';

  // Sync settings from server on load
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.default && data.name) {
          setSettings((prev) => ({ ...prev, ...data }));
          try {
            localStorage.setItem('privacy_admin_settings', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateSettings = async (newSettings: AdminSettings): Promise<boolean> => {
    setSettings(newSettings);
    try {
      localStorage.setItem('privacy_admin_settings', JSON.stringify(newSettings));
    } catch {}

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      return res.ok;
    } catch {
      return true;
    }
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_ADMIN_SETTINGS);
    try {
      localStorage.removeItem('privacy_admin_settings');
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_ADMIN_SETTINGS),
      });
    } catch {}
  };

  const formatPrice = (amount: number, currencyOverride?: CurrencyType): string => {
    const cur = currencyOverride || currentCurrency;
    if (cur === 'USD') {
      return `$ ${amount.toFixed(2)}`;
    }
    if (cur === 'EUR') {
      return `€ ${amount.toFixed(2).replace('.', ',')}`;
    }
    // Default BRL
    return `R$ ${amount.toFixed(2).replace('.', ',')}`;
  };

  const getActivePrice = (planKey: 'monthly' | 'quarterly' | 'semiannual') => {
    const plan = settings[planKey];
    const cur = currentCurrency;
    let price = plan.priceBRL;
    let original = plan.originalBRL;

    if (cur === 'USD') {
      price = plan.priceUSD;
      original = plan.originalUSD;
    } else if (cur === 'EUR') {
      price = plan.priceEUR;
      original = plan.originalEUR;
    }

    return {
      price,
      priceFormatted: formatPrice(price, cur),
      originalPrice: original,
      originalFormatted: formatPrice(original, cur),
      badge: plan.discountBadge,
    };
  };

  return (
    <AdminContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isAdminOpen,
        setIsAdminOpen,
        currentCurrency,
        formatPrice,
        getActivePrice,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminSettings = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminSettings must be used within an AdminSettingsProvider');
  }
  return context;
};
