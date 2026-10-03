import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Heart, Lock, Sparkles, CheckCheck } from 'lucide-react';
import { ChatMessage } from '../types';
import { INITIAL_CHAT, CREATOR_PROFILE } from '../data/mockData';

interface VipChatProps {
  isSubscribed: boolean;
  onOpenSubscribe: () => void;
}

const CREATOR_RESPONSES = [
  'Amei você ter me chamado aqui! Estou respondendo só quem tá no VIP hoje 💕',
  'Você é um fofo! O que você mais gostou das fotos que postei?',
  'Quer que eu grave um vídeo exclusivo falando seu nome? Me manda um mimo que eu faço agora mesmo 🙈✨',
  'Adoro conversar com você por aqui... mais tarde vou fazer uma live privada!',
  'Você não imagina o quanto você me deixa animada... me conta mais sobre você 💖',
];

export const VipChat: React.FC<VipChatProps> = ({ isSubscribed, onOpenSubscribe }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Trigger creator reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const randomReply =
        CREATOR_RESPONSES[Math.floor(Math.random() * CREATOR_RESPONSES.length)];
      const creatorMsg: ChatMessage = {
        id: 'reply_' + Date.now(),
        sender: 'creator',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, creatorMsg]);
    }, 1800);
  };

  if (!isSubscribed) {
    return (
      <div className="bg-white rounded-[24px] p-6 text-center border border-gray-200/60 privacy-card-shadow flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#f26522] flex items-center justify-center mb-3">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Chat Privado Bloqueado</h3>
        <p className="text-xs text-gray-600 max-w-sm mb-4">
          O bate-papo individual com Leticia Vargas está liberado exclusivamente para assinantes ativos.
        </p>
        <button
          onClick={onOpenSubscribe}
          className="privacy-gradient-btn text-gray-900 font-extrabold text-sm py-3 px-6 rounded-full flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Assinar por R$ 14,95 para liberar o chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-gray-200/60 privacy-card-shadow flex flex-col h-[520px]">
      {/* Chat Header */}
      <div className="p-3.5 bg-gray-50/80 border-b border-gray-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={CREATOR_PROFILE.avatar}
              alt={CREATOR_PROFILE.name}
              className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-gray-900">{CREATOR_PROFILE.name}</span>
              <svg className="w-3.5 h-3.5 text-[#3897f0] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Online agora no privado</p>
          </div>
        </div>

        <div className="bg-orange-100/70 text-[#f26522] text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Canal VIP</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#faf7f4]/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#f26522] text-white rounded-br-xs'
                    : 'bg-white text-gray-800 border border-gray-200/70 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                <span>{msg.timestamp}</span>
                {isUser && <CheckCheck className="w-3 h-3 text-emerald-500" />}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2.5 rounded-2xl w-fit border border-gray-200/60 shadow-xs">
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
            <span className="text-[11px] text-gray-400">Leticia está digitando...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Mande uma mensagem para a Leticia..."
          className="flex-1 bg-gray-100 border border-transparent focus:border-[#f26522] focus:bg-white rounded-full px-4 py-2 text-xs outline-none transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-8 h-8 rounded-full bg-[#f26522] text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
