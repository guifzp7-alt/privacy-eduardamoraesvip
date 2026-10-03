import React, { useState } from 'react';
import { 
  Lock, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Camera, 
  Grid, 
  MoreVertical,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAdminSettings } from '../context/AdminSettingsContext';

interface FeedProps {
  onOpenSubscribe: () => void;
}

export const Feed: React.FC<FeedProps> = ({ onOpenSubscribe }) => {
  const { t } = useLanguage();
  const { settings } = useAdminSettings();
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-xl py-2 px-3 border border-gray-100 shadow-2xs flex justify-around items-center">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 text-xs font-semibold pb-1 cursor-pointer transition-colors ${
            activeTab === 'posts'
              ? 'text-[#f26522] border-b-2 border-[#f26522]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 stroke-[2]" />
          <span>{t.postsTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-1.5 text-xs font-semibold pb-1 cursor-pointer transition-colors ${
            activeTab === 'media'
              ? 'text-[#f26522] border-b-2 border-[#f26522]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5 stroke-[2]" />
          <span>{t.mediaTab}</span>
        </button>
      </div>

      {/* Locked Post Card */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xs flex flex-col">
        {/* Post Header */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={settings.avatar}
              alt={settings.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[13px] text-gray-900 leading-none">
                  {settings.name}
                </span>
                {settings.verified && (
                  <svg
                    className="w-3.5 h-3.5 text-[#3897f0] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{settings.username}</p>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-700 p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Locked Media Area (Subtle tan radial background with central lock & counters) */}
        <div 
          onClick={onOpenSubscribe}
          className="w-full aspect-[4/4.5] sm:aspect-square bg-[#f8f5ee] relative flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
          style={{
            background: 'radial-gradient(circle, #ebe2d0 0%, #f4ede0 50%, #f9f6f0 100%)'
          }}
        >
          {/* Subtle concentric decorative circle */}
          <div className="absolute w-[80%] aspect-square rounded-full border border-[#e4dac5]/60 pointer-events-none" />

          {/* Central Padlock Icon & Stats */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Outlined Padlock matching screenshot */}
            <div className="mb-3 text-[#525a65]">
              <Lock className="w-12 h-12 stroke-[1.7]" />
            </div>

            {/* Counters row under padlock: 🖼 photos  ▦ videos  ♡ likes */}
            <div className="flex items-center gap-3 text-[#525a65] text-xs font-semibold">
              <div className="flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 stroke-[2]" />
                <span>{settings.photos}</span>
              </div>
              <div className="flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 stroke-[2]" />
                <span>{settings.videos}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 stroke-[2]" />
                <span>{settings.likes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Footer Action Bar */}
        <div className="px-3.5 py-2.5 bg-white flex justify-between items-center text-gray-600 border-t border-gray-50">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setHasLiked(!hasLiked)}
              className="hover:text-red-500 cursor-pointer transition-colors"
            >
              <Heart
                className={`w-4 h-4 stroke-[1.8] ${hasLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
            <button 
              onClick={onOpenSubscribe}
              className="hover:text-gray-900 cursor-pointer transition-colors"
            >
              <MessageCircle className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button 
              onClick={onOpenSubscribe}
              className="hover:text-gray-900 cursor-pointer transition-colors"
            >
              <div className="w-4 h-4 rounded-full border-[1.5px] border-gray-600 flex items-center justify-center text-[10px] font-bold">
                $
              </div>
            </button>
          </div>

          <button
            onClick={() => setHasSaved(!hasSaved)}
            className="hover:text-gray-900 cursor-pointer transition-colors"
          >
            <Bookmark
              className={`w-4 h-4 stroke-[1.8] ${hasSaved ? 'fill-gray-900 text-gray-900' : ''}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
