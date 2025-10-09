import { Search, TrendingUp } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import PostCard from '@/components/posts/PostCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockPosts, trendingTags } from '@/services/mockData';

export default function Explore() {
  return (
    <MobileLayout title="Keşfet">
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Kullanıcı, etiket veya içerik ara..."
            className="pl-10 h-12 rounded-2xl"
          />
        </div>

        {/* Trending Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Trendler</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {trendingTags.map((tag) => (
              <Badge
                key={tag.tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap px-4 py-2"
              >
                {tag.tag} · {tag.count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Trending Posts */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Trend Gönderiler</h3>
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
