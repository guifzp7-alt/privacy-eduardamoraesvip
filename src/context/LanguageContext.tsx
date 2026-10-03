import React, { createContext, useContext, useState } from 'react';

export type Language = 'pt' | 'es' | 'en';

export interface Translations {
  // Navigation & Header
  langLabel: string;
  adminPanel: string;

  // Profile
  bio: string;
  readMore: string;
  showLess: string;
  subscriptionOffer: string;
  offerNotice: string;
  saveBadge: string;
  subscribeNow: string;
  originalPrice: string;
  subscriptions: string;
  months3: string;
  months6: string;
  postsTab: string;
  mediaTab: string;

  // Locked Media
  exclusiveContent: string;
  photosLabel: string;
  videosLabel: string;
  likesLabel: string;

  // Checkout - Step 1 (Login / Register)
  checkoutModalTitle: string;
  identifyTitle: string;
  tabLogin: string;
  tabRegister: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  continueToPayment: string;
  securityFooterNotice: string;

  // Checkout - Step 2 (Payment)
  orderSummary: string;
  selectedPlanLabel: string;
  discountAppliedLabel: string;
  totalToPayLabel: string;
  paymentMethodLabel: string;
  pixTitle: string;
  cardTitle: string;
  pixInstantNotice: string;
  pixWaiting: string;
  pixCopyPasteLabel: string;
  pixCopyButton: string;
  pixCopied: string;
  pixPaidButton: string;
  pixVerifying: string;
  cardHolderLabel: string;
  cardHolderPlaceholder: string;
  cardNumberLabel: string;
  expiryLabel: string;
  cvvLabel: string;
  cpfLabel: string;
  installmentsLabel: string;
  installments1x: string;
  cardPayButton: string;
  processingPayment: string;
  secureProcessing: string;

  // Checkout - Step 3 (Success)
  successTitle: string;
  successMessage: string;
  receiptMethod: string;
  receiptGateway: string;
  receiptAmount: string;
  receiptCode: string;
  accessVipButton: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    langLabel: 'Português',
    adminPanel: 'Painel Admin',

    bio: 'APROVEITE A PROMO!! 💖 Oii gato! Sou uma moreninha mais bonita da faculdade e eu tenho o MELHOR CONTEÚDO DA PRIVACY. Vem conversar comigo, quero realizar seus desejos. Mas...',
    readMore: 'Ler mais',
    showLess: 'Mostrar menos',
    subscriptionOffer: 'Oferta de assinatura',
    offerNotice: 'CHAMADA DE VIDEO ONN ( 90% OFF )',
    saveBadge: 'Economize 50%',
    subscribeNow: 'Assinar agora',
    originalPrice: 'Preço original',
    subscriptions: 'Assinaturas',
    months3: '3 meses (49% off )',
    months6: '6 meses (50% off )',
    postsTab: '71 Postagens',
    mediaTab: '104 Mídias',

    exclusiveContent: 'Conteúdo Exclusivo para Assinantes',
    photosLabel: 'Fotos',
    videosLabel: 'Vídeos',
    likesLabel: 'Curtidas',

    checkoutModalTitle: 'Finalizar Assinatura',
    identifyTitle: 'Identifique-se para continuar',
    tabLogin: 'Já tenho conta',
    tabRegister: 'Criar nova conta',
    emailLabel: 'E-mail para recebimento do acesso',
    emailPlaceholder: 'seu@email.com',
    passwordLabel: 'Senha de acesso',
    passwordPlaceholder: 'Sua senha segura',
    continueToPayment: 'Continuar para Pagamento',
    securityFooterNotice: 'Seus dados estão protegidos com criptografia de ponta a ponta.',

    orderSummary: 'Resumo do Pedido',
    selectedPlanLabel: 'Plano Selecionado:',
    discountAppliedLabel: 'Desconto Aplicado:',
    totalToPayLabel: 'Total a Pagar:',
    paymentMethodLabel: 'Forma de Pagamento',
    pixTitle: 'PIX (Instantâneo)',
    cardTitle: 'Cartão de Crédito',
    pixInstantNotice: 'Pagamento Instantâneo via PIX',
    pixWaiting: 'Aguardando PIX... Expira em',
    pixCopyPasteLabel: 'Código Pix Copia e Cola:',
    pixCopyButton: 'Copiar Código Pix',
    pixCopied: 'Código Copiado!',
    pixPaidButton: 'Já fiz o pagamento via Pix',
    pixVerifying: 'Confirmando pagamento via Pix...',
    cardHolderLabel: 'Nome impresso no cartão',
    cardHolderPlaceholder: 'Como está no cartão',
    cardNumberLabel: 'Número do Cartão',
    expiryLabel: 'Validade',
    cvvLabel: 'CVV',
    cpfLabel: 'CPF do Titular',
    installmentsLabel: 'Parcelamento',
    installments1x: '1x sem juros (À vista)',
    cardPayButton: 'Pagar com Cartão',
    processingPayment: 'Processando pagamento...',
    secureProcessing: 'Processamento 100% criptografado e seguro',

    successTitle: 'Pagamento Aprovado com Sucesso!',
    successMessage: 'Sua assinatura foi confirmada. Aproveite todo o conteúdo exclusivo da Privacy.',
    receiptMethod: 'Forma de Pagamento',
    receiptGateway: 'Gateway',
    receiptAmount: 'Valor Pago',
    receiptCode: 'Código da Transação',
    accessVipButton: 'Acessar Conteúdo VIP Agora',
  },
  es: {
    langLabel: 'Español',
    adminPanel: 'Panel Admin',

    bio: '¡¡APROVECHA LA PROMO!! 💖 ¡Hola guapo! Soy la morenita más linda de la universidad y tengo el MEJOR CONTENIDO DE PRIVACY. Ven a hablar conmigo, quiero cumplir tus deseos. Pero...',
    readMore: 'Leer más',
    showLess: 'Mostrar menos',
    subscriptionOffer: 'Oferta de suscripción',
    offerNotice: 'VIDEOLLAMADA ONN ( 90% OFF )',
    saveBadge: 'Ahorra 50%',
    subscribeNow: 'Suscribirse ahora',
    originalPrice: 'Precio original',
    subscriptions: 'Suscripciones',
    months3: '3 meses (49% off )',
    months6: '6 meses (50% off )',
    postsTab: '71 Publicaciones',
    mediaTab: '104 Medios',

    exclusiveContent: 'Contenido Exclusivo para Suscriptores',
    photosLabel: 'Fotos',
    videosLabel: 'Videos',
    likesLabel: 'Me gusta',

    checkoutModalTitle: 'Completar Suscripción',
    identifyTitle: 'Identifícate para continuar',
    tabLogin: 'Ya tengo cuenta',
    tabRegister: 'Crear cuenta nueva',
    emailLabel: 'Correo electrónico para acceso',
    emailPlaceholder: 'tu@correo.com',
    passwordLabel: 'Contraseña de acceso',
    passwordPlaceholder: 'Tu contraseña segura',
    continueToPayment: 'Continuar al Pago',
    securityFooterNotice: 'Tus datos están protegidos con cifrado de extremo a extremo.',

    orderSummary: 'Resumen del Pedido',
    selectedPlanLabel: 'Plan Seleccionado:',
    discountAppliedLabel: 'Descuento Aplicado:',
    totalToPayLabel: 'Total a Pagar:',
    paymentMethodLabel: 'Método de Pago',
    pixTitle: 'PIX (Instantáneo)',
    cardTitle: 'Tarjeta de Crédito',
    pixInstantNotice: 'Pago Instantáneo disponible',
    pixWaiting: 'Esperando PIX... Expira en',
    pixCopyPasteLabel: 'Código Pix Copiar y Pegar:',
    pixCopyButton: 'Copiar Código Pix',
    pixCopied: '¡Código Copiado!',
    pixPaidButton: 'Ya realicé el pago por Pix',
    pixVerifying: 'Confirmando pago...',
    cardHolderLabel: 'Nombre en la tarjeta',
    cardHolderPlaceholder: 'Como figura en la tarjeta',
    cardNumberLabel: 'Número de Tarjeta',
    expiryLabel: 'Vencimiento',
    cvvLabel: 'CVV',
    cpfLabel: 'Documento de Identidad',
    installmentsLabel: 'Cuotas',
    installments1x: '1 pago (Sin intereses)',
    cardPayButton: 'Pagar con Tarjeta',
    processingPayment: 'Procesando pago seguro...',
    secureProcessing: 'Procesamiento 100% cifrado y seguro',

    successTitle: '¡Pago Aprobado con Éxito!',
    successMessage: 'Tu suscripción ha sido confirmada. Disfruta de todo el contenido exclusivo de Privacy.',
    receiptMethod: 'Método de Pago',
    receiptGateway: 'Pasarela',
    receiptAmount: 'Monto Pagado',
    receiptCode: 'Código de Transacción',
    accessVipButton: 'Acceder al Contenido VIP Ahora',
  },
  en: {
    langLabel: 'English',
    adminPanel: 'Admin Panel',

    bio: "TAKE ADVANTAGE OF THE PROMO!! 💖 Hey handsome! I'm the prettiest brunette in college and I have the BEST CONTENT ON PRIVACY. Come chat with me, I want to fulfill your desires. But...",
    readMore: 'Read more',
    showLess: 'Show less',
    subscriptionOffer: 'Subscription offer',
    offerNotice: 'VIDEO CALL ONN ( 90% OFF )',
    saveBadge: 'Save 50%',
    subscribeNow: 'Subscribe now',
    originalPrice: 'Original price',
    subscriptions: 'Subscriptions',
    months3: '3 months (49% off )',
    months6: '6 months (50% off )',
    postsTab: '71 Posts',
    mediaTab: '104 Media',

    exclusiveContent: 'Exclusive Subscriber-Only Content',
    photosLabel: 'Photos',
    videosLabel: 'Videos',
    likesLabel: 'Likes',

    checkoutModalTitle: 'Complete Subscription',
    identifyTitle: 'Sign in to continue',
    tabLogin: 'Already have an account',
    tabRegister: 'Create new account',
    emailLabel: 'Email for access confirmation',
    emailPlaceholder: 'your@email.com',
    passwordLabel: 'Access password',
    passwordPlaceholder: 'Your secure password',
    continueToPayment: 'Continue to Payment',
    securityFooterNotice: 'Your data is protected with end-to-end encryption.',

    orderSummary: 'Order Summary',
    selectedPlanLabel: 'Selected Plan:',
    discountAppliedLabel: 'Applied Discount:',
    totalToPayLabel: 'Total to Pay:',
    paymentMethodLabel: 'Payment Method',
    pixTitle: 'PIX (Instant QR)',
    cardTitle: 'Credit Card',
    pixInstantNotice: 'Instant Payment via Gateway',
    pixWaiting: 'Waiting for PIX... Expires in',
    pixCopyPasteLabel: 'Pix Copy and Paste code:',
    pixCopyButton: 'Copy Pix Code',
    pixCopied: 'Code Copied!',
    pixPaidButton: "I've already paid via Pix",
    pixVerifying: 'Verifying payment...',
    cardHolderLabel: 'Cardholder Name',
    cardHolderPlaceholder: 'As shown on card',
    cardNumberLabel: 'Card Number',
    expiryLabel: 'Expiry',
    cvvLabel: 'CVV',
    cpfLabel: 'Tax ID / Document',
    installmentsLabel: 'Payment Type',
    installments1x: '1x Full Payment',
    cardPayButton: 'Pay with Card',
    processingPayment: 'Processing secure payment...',
    secureProcessing: '100% encrypted & secure payment processing',

    successTitle: 'Payment Approved Successfully!',
    successMessage: 'Your subscription is now active. Enjoy full access to all exclusive Privacy content.',
    receiptMethod: 'Payment Method',
    receiptGateway: 'Gateway',
    receiptAmount: 'Amount Paid',
    receiptCode: 'Transaction ID',
    accessVipButton: 'Access VIP Content Now',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'pt',
  setLanguage: () => {},
  t: translations.pt,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('privacy_language') as Language;
      if (saved && (saved === 'pt' || saved === 'es' || saved === 'en')) {
        return saved;
      }
    } catch {}
    return 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('privacy_language', lang);
    } catch {}
  };

  const t = translations[language] || translations.pt;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
