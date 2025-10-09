export type Measurement = {
  date: string;
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
};

export type AIComment = {
  summary: string;
  tips?: string[];
};

export type Post = {
  id: string;
  author: User;
  createdAt: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  photos: string[];
  caption?: string;
  weightKg?: number;
  measurements?: Partial<Measurement>;
  aiComment?: AIComment | null;
  visibility: 'public' | 'followers' | 'private';
  likes: number;
  commentsCount: number;
  isLiked?: boolean;
};

export type Comment = {
  id: string;
  author: User;
  content: string;
  createdAt: string;
};

export type User = {
  id: string;
  handle: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
};

export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  user: User;
  post?: Post;
  createdAt: string;
  read: boolean;
};

export type TreatItem = {
  id: string;
  name: string;
  photoUrl?: string;
  kcalHint?: string;
  portions?: ('Küçük' | 'Orta' | 'Tam')[];
};

export type TreatSpin = {
  id: string;
  treatId: string;
  date: string;
  portion: 'Küçük' | 'Orta' | 'Tam';
  bonusWalkMin: 0 | 15 | 20 | 30 | 60 | 90;
  completed?: boolean;
};

export type CheatEligibility = {
  eligible: boolean;
  reason?: string;
  etaDays?: number;
  progressDeltaKg?: number;
};
