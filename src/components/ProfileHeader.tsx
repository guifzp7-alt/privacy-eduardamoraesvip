import React, { useState } from 'react';
import { Camera, Grid, Lock, Heart, ChevronUp, ChevronDown } from 'lucide-react';
import { Plan } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAdminSettings } from '../context/AdminSettingsContext';

interface ProfileHeaderProps {
  isSubscribed: boolean;
  onSelectPlan: (plan: Plan) => void;
  onOpenTipModal: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isSubscribed,
  onSelectPlan,
}) => {
  const { language, t } = useLanguage();
  const { settings, getActivePrice } = useAdminSettings();
  const [showFullBio, setShowFullBio] = useState(false);
  const [showAssinaturas, setShowAssinaturas] = useState(true);

  const monthlyPrice = getActivePrice('monthly');
  const quarterlyPrice = getActivePrice('quarterly');
  const semiannualPrice = getActivePrice('semiannual');

  // Bio based on language
  const activeBio = 
    language === 'es' ? settings.bio_es :
    language === 'en' ? settings.bio_en :
    settings.bio_pt;

  const activeNotice = 
    language === 'es' ? settings.offerNotice_es :
    language === 'en' ? settings.offerNotice_en :
    settings.offerNotice_pt;

  const handlePlanClick = (planId: 'monthly' | 'quarterly' | 'semiannual') => {
    const p = getActivePrice(planId);
    const planName = 
      planId === 'monthly' ? 'Assinatura Mensal' :
      planId === 'quarterly' ? 'Plano Trimestral (3 meses)' :
      'Plano Semestral (6 meses)';

    onSelectPlan({
      id: planId,
      name: planName,
      priceFormatted: p.priceFormatted,
      priceNumber: p.price,
      originalPriceFormatted: p.originalFormatted,
      discountBadge: p.badge,
      durationText: planId === 'monthly' ? '1 mês de acesso' : `${planId} acesso`,
    });
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100">
      {/* Cover Banner */}
      <div className="h-32 sm:h-36 w-full relative bg-gray-200">
        <img
          src={settings.cover}
          alt="Capa de Perfil"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Profile Details Container */}
      <div className="px-4 pb-4 pt-0">
        {/* Avatar & Stats Row */}
        <div className="flex justify-between items-end -mt-10 mb-2.5">
          <div className="relative">
            <img
              src={settings.avatar}
              alt={settings.name}
              className="w-[74px] h-[74px] sm:w-[82px] sm:h-[82px] rounded-full border-[3px] border-white object-cover shadow-sm bg-white"
            />
          </div>

          {/* Stats Bar: 🖼 photos  ▦ videos  🔒 locked  ♡ likes */}
          <div className="flex items-center gap-3 text-gray-500 text-[11.5px] font-medium pb-1 pr-1">
            <div className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-gray-400 stroke-[1.8]" />
              <span>{settings.photos}</span>
            </div>
            <div className="flex items-center gap-1">
              <Grid className="w-3.5 h-3.5 text-gray-400 stroke-[1.8]" />
              <span>{settings.videos}</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-gray-400 stroke-[1.8]" />
              <span>{isSubscribed ? 0 : settings.locked}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-gray-400 stroke-[1.8]" />
              <span>{settings.likes}</span>
            </div>
          </div>
        </div>

        {/* Name, Verified Badge & Username */}
        <div className="mb-2">
          <div className="flex items-center gap-1">
            <h1 className="text-[17px] font-extrabold text-gray-900 tracking-tight leading-tight">
              {settings.name}
            </h1>
            {settings.verified && (
              <svg
                className="w-4 h-4 text-[#3897f0] fill-current shrink-0"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
          <p className="text-[11.5px] text-gray-400 font-normal">{settings.username}</p>
        </div>

        {/* Bio Text */}
        <div className="text-[12px] leading-relaxed text-gray-700">
          <p className="font-normal inline">
            {activeBio}
          </p>
          <button
            onClick={() => setShowFullBio(!showFullBio)}
            className="text-[#f26522] font-semibold hover:underline inline-block text-[12px] cursor-pointer ml-1"
          >
            {showFullBio ? t.showLess : t.readMore}
          </button>
        </div>

        {/* Oferta de Assinatura Card */}
        <div className="mt-3.5 bg-[#fdfbf9] rounded-2xl p-3.5 border border-[#fae2d6]">
          {/* Header */}
          <div className="flex items-center gap-1.5 text-gray-900 font-extrabold text-xs mb-2.5">
            <span className="text-[#f26522] text-sm">💸</span>
            <span>{t.subscriptionOffer}</span>
          </div>

          {/* Highlight White Box */}
          <div className="bg-white rounded-lg py-2 px-3 text-center border border-gray-100 shadow-2xs mb-2.5">
            <span className="text-[11.5px] font-bold text-gray-800 tracking-wide">
              {activeNotice}
            </span>
          </div>

          {/* Economize 50% Badge */}
          <div className="mb-1">
            <span className="bg-[#e1f9ee] text-[#1b8a53] text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block">
              {monthlyPrice.badge}
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => handlePlanClick('monthly')}
            className="w-full bg-[#f08162] hover:bg-[#ea7352] text-gray-900 font-extrabold text-[14px] py-2.5 px-4 rounded-full text-center tracking-tight cursor-pointer shadow-xs transition-all active:scale-[0.99]"
          >
            {t.subscribeNow} {monthlyPrice.priceFormatted}
          </button>

          {/* Original price note */}
          <div className="text-right mt-1.5">
            <span className="text-[10px] text-gray-500">
              {t.originalPrice} <span className="line-through">{monthlyPrice.originalFormatted}</span>
            </span>
          </div>

          {/* Assinaturas Accordion */}
          <div className="mt-2.5 pt-2">
            <div
              onClick={() => setShowAssinaturas(!showAssinaturas)}
              className="flex justify-between items-center text-xs font-bold text-gray-900 mb-2 cursor-pointer select-none"
            >
              <span>{t.subscriptions}</span>
              {showAssinaturas ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              )}
            </div>

            {showAssinaturas && (
              <div className="flex flex-col gap-2">
                {/* 3 meses */}
                <button
                  onClick={() => handlePlanClick('quarterly')}
                  className="w-full bg-[#f08162] hover:bg-[#ea7352] text-gray-900 font-extrabold text-[13px] py-2.5 px-4 rounded-full flex justify-between items-center cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                >
                  <span>{t.months3}</span>
                  <span>{quarterlyPrice.priceFormatted}</span>
                </button>

                {/* 6 meses */}
                <button
                  onClick={() => handlePlanClick('semiannual')}
                  className="w-full bg-[#f08162] hover:bg-[#ea7352] text-gray-900 font-extrabold text-[13px] py-2.5 px-4 rounded-full flex justify-between items-center cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                >
                  <span>{t.months6}</span>
                  <span>{semiannualPrice.priceFormatted}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
