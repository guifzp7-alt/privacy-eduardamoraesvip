import { Plan, Post, ChatMessage } from '../types';

export const CREATOR_PROFILE = {
  name: 'Leticia Vargas',
  username: '@vargasleticiaz',
  verified: true,
  avatar: '/src/assets/images/leticia_avatar_1790996538192.jpg',
  cover: '/src/assets/images/leticia_cover_1790996456942.jpg',
  stats: {
    photos: 59,
    videos: 45,
    locked: 12,
    likes: '4.3K',
  },
  shortBio: 'APROVEITE A PROMO!! 💖 Oii gato! Sou uma moreninha mais bonita da faculdade e eu tenho o MELHOR CONTEÚDO DA PRIVACY. Vem conversar comigo, quero realizar seus desejos. Mas...',
  fullBio: 'APROVEITE A PROMO!! 💖 Oii gato! Sou uma moreninha mais bonita da faculdade e eu tenho o MELHOR CONTEÚDO DA PRIVACY. Vem conversar comigo, quero realizar seus desejos. Mas...',
  offerNotice: 'CHAMADA DE VIDEO ONN ( 90% OFF )',
};

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Assinatura Mensal',
    priceFormatted: 'R$ 14,95',
    priceNumber: 14.95,
    originalPriceFormatted: 'R$ 29,90',
    discountBadge: 'Economize 50%',
    durationText: '1 mês de acesso ilimitado',
    isPopular: true,
  },
  {
    id: 'quarterly',
    name: 'Plano Trimestral (3 meses)',
    priceFormatted: 'R$ 45,75',
    priceNumber: 45.75,
    originalPriceFormatted: 'R$ 89,70',
    discountBadge: '49% OFF',
    durationText: '3 meses (R$ 15,25/mês)',
  },
  {
    id: 'semiannual',
    name: 'Plano Semestral (6 meses)',
    priceFormatted: 'R$ 89,70',
    priceNumber: 89.70,
    originalPriceFormatted: 'R$ 179,40',
    discountBadge: '50% OFF',
    durationText: '6 meses (R$ 14,95/mês)',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorName: 'Leticia Vargas',
    authorUsername: '@vargasleticiaz',
    authorAvatar: '/src/assets/images/leticia_avatar_1790996538192.jpg',
    timestamp: 'Há 2 horas',
    text: 'Aquele ensaio na banheira que vocês tanto pediram... gravei 18 minutos sem corte pra vocês! Ficou simplesmente surreal 🔥 Me fala se gostaram nos comentários!',
    isLocked: true,
    mediaCount: {
      photos: 8,
      videos: 2,
    },
    likes: 342,
    commentsCount: 28,
    blurPreviewUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    unlockedMedia: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=85',
      },
    ],
  },
  {
    id: 'post-2',
    authorName: 'Leticia Vargas',
    authorUsername: '@vargasleticiaz',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    timestamp: 'Ontem às 21:40',
    text: 'Vesti a lingerie vermelha rendada nova... vem cá ver como ficou de costas 👀🔞 Quem mandar gorjeta ganha um mimo na DM!',
    isLocked: true,
    mediaCount: {
      photos: 12,
      videos: 1,
    },
    likes: 589,
    commentsCount: 45,
    blurPreviewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    unlockedMedia: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=85',
      },
    ],
  },
  {
    id: 'post-3',
    authorName: 'Leticia Vargas',
    authorUsername: '@vargasleticiaz',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    timestamp: '3 dias atrás',
    text: 'Oi amores! Tô online no chat particular respondendo todo mundo. Quem já garantiu a assinatura para a chamada de vídeo hoje a noite? 💕',
    isLocked: false,
    mediaCount: {
      photos: 1,
      videos: 0,
    },
    likes: 1240,
    commentsCount: 92,
    unlockedMedia: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85',
      },
    ],
  },
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'creator',
    text: 'Oii meu bem! Que delícia ter você aqui no meu VIP oficial! 💖',
    timestamp: '19:30',
  },
  {
    id: 'msg-2',
    sender: 'creator',
    text: 'Pode me mandar o que você quer ver hoje... estou gravando alguns mimos exclusivos pros meus assinantes favoritos 🥰',
    timestamp: '19:31',
  },
];
