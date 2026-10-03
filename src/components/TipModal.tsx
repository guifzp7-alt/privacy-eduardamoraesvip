import React, { useState } from 'react';
import { X, DollarSign, Heart, CheckCircle2, Sparkles } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
}

const TIP_PRESETS = [5, 10, 20, 50, 100];

export const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, creatorName }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [customMessage, setCustomMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSendTip = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[24px] p-5 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSent ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Mimo Enviado com Sucesso!</h3>
            <p className="text-xs text-gray-500">
              Leticia recebeu sua gorjeta de R$ {selectedAmount},00 e vai te responder no privado! ❤️
            </p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-[#f26522] flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Enviar um Mimo para {creatorName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Mostre seu apoio e receba uma mensagem especial com foto exclusiva
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {TIP_PRESETS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedAmount === amt
                      ? 'border-[#f26522] bg-orange-50 text-[#f26522]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  R${amt}
                </button>
              ))}
            </div>

            {/* Custom note */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Deixe um recadinho carinhoso:
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ex: Amei as fotos, quero ver mais de você..."
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-[#f26522] outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSendTip}
              className="w-full privacy-gradient-btn text-gray-900 font-extrabold text-sm py-3 px-4 rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:opacity-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enviar R$ {selectedAmount},00 via PIX</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
