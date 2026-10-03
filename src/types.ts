export interface Plan {
  id: string;
  name: string;
  priceFormatted: string;
  priceNumber: number;
  originalPriceFormatted?: string;
  discountBadge?: string;
  durationText: string;
  isPopular?: boolean;
}

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  aspectRatio?: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  timestamp: string;
  text: string;
  isLocked: boolean;
  mediaCount: {
    photos: number;
    videos: number;
  };
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  unlockedMedia?: PostMedia[];
  blurPreviewUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'creator' | 'user';
  text: string;
  timestamp: string;
  mediaUrl?: string;
}
