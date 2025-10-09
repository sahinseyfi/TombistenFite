import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import PostCard from '@/components/posts/PostCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPosts, mockNotifications } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Feed() {
  const [filter, setFilter] = useState<'all' | 'following' | 'nearby'>('all');
  const [posts, setPosts] = useState(mockPosts);
  
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  return (
    <MobileLayout 
      title="Akış"
      headerAction={
        <Button variant="ghost" size="icon">
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      }
      notificationCount={unreadCount}
    >
      {/* Filters */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-3 px-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">Herkes</TabsTrigger>
            <TabsTrigger value="following">Takip</TabsTrigger>
            <TabsTrigger value="nearby">Yakınlar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <div key={post.id} className="p-4">
            <PostCard post={post} onLike={handleLike} />
          </div>
        ))}
      </div>
    </MobileLayout>
  );
}
