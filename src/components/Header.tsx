import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';
import { useAdminSettings } from '../context/AdminSettingsContext';

export const Header: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { setIsAdminOpen } = useAdminSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Secret admin click trigger (5 rapid clicks on logo or dot)
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2500);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setIsAdminOpen(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; country: string; label: string }[] = [
    { code: 'pt', country: 'BR', label: 'Português' },
    { code: 'es', country: 'ES', label: 'Español' },
    { code: 'en', country: 'EN', label: 'English' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 py-3 px-4 sticky top-0 z-50">
      <div className="max-w-[420px] mx-auto relative flex items-center justify-center min-h-[36px]">
        {/* Brand Logo - Dead Center */}
        <div 
          onClick={handleSecretLogoClick}
          className="flex items-center gap-0.5 select-none cursor-pointer"
        >
          <span className="font-logo text-[25px] font-extrabold tracking-tight text-black lowercase leading-none">
            privacy
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#f26522] inline-block mt-3 ml-0.5"></span>
        </div>

        {/* Language Selector Button - Positioned on the Right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Selecionar idioma"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer border border-gray-200/60 shadow-2xs"
          >
            <Globe className="w-4.5 h-4.5 stroke-[1.8]" />
          </button>

          {/* Language Dropdown Modal / Popover */}
          {isOpen && (
            <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-4 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-extrabold text-[13px] text-gray-900 w-6">
                      {lang.country}
                    </span>
                    <span
                      className={`text-[13.5px] font-medium ${
                        isSelected ? 'text-[#f26522] font-semibold' : 'text-gray-800'
                      }`}
                    >
                      {lang.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
