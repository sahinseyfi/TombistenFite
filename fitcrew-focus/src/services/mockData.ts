import { User, Post, Notification, Measurement, Comment, TreatItem, TreatSpin, CheatEligibility } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    handle: 'ayse_fit',
    name: 'Ayşe Yılmaz',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse',
    bio: '💪 Fitness tutkunu | 🥗 Sağlıklı yaşam | 🏃‍♀️ Koşu sevdalısı',
    stats: { posts: 142, followers: 1248, following: 532 }
  },
  {
    id: '2',
    handle: 'mehmet_gains',
    name: 'Mehmet Kaya',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
    bio: '🔥 Keto yaşam tarzı | 🏋️ Ağırlık antrenmanı',
    stats: { posts: 89, followers: 856, following: 312 }
  },
  {
    id: '3',
    handle: 'zeynep_health',
    name: 'Zeynep Demir',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    bio: '🧘‍♀️ Yoga | 🌱 Vegan | ✨ Mindful living',
    stats: { posts: 256, followers: 2134, following: 892 }
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mealType: 'breakfast',
    photos: ['https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800'],
    caption: 'Güne harika bir kahvaltı ile başladım! Protein ağırlıklı ve çok doyurucu 🥑🍳',
    weightKg: 68.5,
    measurements: { waistCm: 72, hipCm: 95 },
    aiComment: {
      summary: 'Harika bir kahvaltı seçimi! Protein dengesi mükemmel.',
      tips: [
        'Su tüketimini artırmayı unutma',
        'Akşam öğününde karb miktarını azaltabilirsin',
        'Haftalık ilerleme çok iyi gidiyor!'
      ]
    },
    visibility: 'public',
    likes: 47,
    commentsCount: 12,
    isLiked: true
  },
  {
    id: '2',
    author: mockUsers[1],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    mealType: 'lunch',
    photos: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'
    ],
    caption: 'Öğle yemeği: izgara tavuk ve quinoa salatası. Keto gününün 3. günü 💪',
    weightKg: 82.3,
    aiComment: {
      summary: 'Keto diyetine uygun bir öğün. Protein ve yağ dengesi ideal.',
      tips: ['Yeşil yapraklı sebzeleri artırabilirsin']
    },
    visibility: 'public',
    likes: 93,
    commentsCount: 24,
    isLiked: false
  },
  {
    id: '3',
    author: mockUsers[2],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    mealType: 'snack',
    photos: ['https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800'],
    caption: 'Ara öğün: smoothie bowl 🍓🥥 Yoga sonrası mükemmel bir enerji kaynağı',
    weightKg: 59.2,
    measurements: { waistCm: 65, chestCm: 88, hipCm: 92 },
    visibility: 'public',
    likes: 156,
    commentsCount: 31,
    isLiked: true
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: mockUsers[1],
    post: mockPosts[0],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '2',
    type: 'comment',
    user: mockUsers[2],
    post: mockPosts[0],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '3',
    type: 'follow',
    user: mockUsers[1],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true
  }
];

export const mockMeasurements: Measurement[] = [
  { date: '2025-01-01', weightKg: 72.5, waistCm: 78, chestCm: 92, hipCm: 98 },
  { date: '2025-02-01', weightKg: 71.2, waistCm: 76, chestCm: 91, hipCm: 97 },
  { date: '2025-03-01', weightKg: 70.1, waistCm: 74, chestCm: 90, hipCm: 96 },
  { date: '2025-04-01', weightKg: 69.5, waistCm: 73, chestCm: 89, hipCm: 95 },
  { date: '2025-05-01', weightKg: 68.8, waistCm: 72, chestCm: 88, hipCm: 95 },
  { date: '2025-06-01', weightKg: 68.5, waistCm: 72, chestCm: 88, hipCm: 95 }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    author: mockUsers[1],
    content: 'Harika görünüyor! Tarif paylaşır mısın?',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    author: mockUsers[2],
    content: 'Motivasyon dolu bir paylaşım 💪',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
];

export const trendingTags = [
  { tag: '#keto', count: 1542 },
  { tag: '#intermittentfasting', count: 1234 },
  { tag: '#protein', count: 987 },
  { tag: '#yogalife', count: 856 },
  { tag: '#veganfitness', count: 743 },
  { tag: '#weightloss', count: 698 }
];

export const mockTreatItems: TreatItem[] = [
  {
    id: '1',
    name: 'Künefe',
    photoUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400',
    kcalHint: '~400-500 kcal',
    portions: ['Küçük', 'Orta', 'Tam']
  },
  {
    id: '2',
    name: 'İskender Kebap',
    photoUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    kcalHint: '~600-800 kcal',
    portions: ['Küçük', 'Orta', 'Tam']
  },
  {
    id: '3',
    name: 'Baklava',
    photoUrl: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=400',
    kcalHint: '~300-400 kcal',
    portions: ['Küçük', 'Orta', 'Tam']
  },
  {
    id: '4',
    name: 'Lahmacun',
    photoUrl: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=400',
    kcalHint: '~250-350 kcal',
    portions: ['Küçük', 'Orta', 'Tam']
  },
  {
    id: '5',
    name: 'Çikolatalı Pasta',
    photoUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    kcalHint: '~350-500 kcal',
    portions: ['Küçük', 'Orta', 'Tam']
  }
];

export const mockTreatSpins: TreatSpin[] = [
  {
    id: '1',
    treatId: '2',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    portion: 'Orta',
    bonusWalkMin: 30,
    completed: true
  },
  {
    id: '2',
    treatId: '3',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    portion: 'Küçük',
    bonusWalkMin: 20,
    completed: true
  },
  {
    id: '3',
    treatId: '1',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    portion: 'Tam',
    bonusWalkMin: 60,
    completed: false
  }
];

export const mockEligibility: CheatEligibility = {
  eligible: true,
  progressDeltaKg: -0.9
};
