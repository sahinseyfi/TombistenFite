import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import PostCard from '@/components/posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockUsers, mockPosts } from '@/services/mockData';

export default function Profile() {
  const user = mockUsers[0];
  const userPosts = mockPosts.filter(p => p.author.id === user.id);

  return (
    <MobileLayout
      title="Profil"
      headerAction={
        <Link to="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      }
    >
      {/* Profile Header */}
      <div className="relative">
        {/* Cover */}
        <div className="h-32 gradient-primary" />
        
        {/* Avatar & Info */}
        <div className="px-4 pb-4">
          <div className="relative -mt-16 mb-4">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-display font-bold">{user.name}</h2>
              <p className="text-muted-foreground">@{user.handle}</p>
            </div>

            {user.bio && (
              <p className="text-sm leading-relaxed">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{user.stats?.posts}</div>
                <div className="text-xs text-muted-foreground">Gönderi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.stats?.followers}</div>
                <div className="text-xs text-muted-foreground">Takipçi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.stats?.following}</div>
                <div className="text-xs text-muted-foreground">Takip</div>
              </div>
            </div>

            <Button className="w-full gradient-primary">
              Profili Düzenle
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="px-4">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">Gönderiler</TabsTrigger>
          <TabsTrigger value="measurements" className="flex-1">Ölçüler</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="measurements" className="mt-4">
          <div className="text-center py-12 text-muted-foreground">
            <p>Ölçü geçmişi grafikler sayfasında görüntülenebilir</p>
          </div>
        </TabsContent>
      </Tabs>
    </MobileLayout>
  );
}
