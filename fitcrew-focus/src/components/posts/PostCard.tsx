import { Heart, MessageCircle, Share2, Bookmark, Sparkles } from 'lucide-react';
import { Post } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  onLike?: (id: string) => void;
}

const mealTypeLabels = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle',
  dinner: 'Akşam',
  snack: 'Ara Öğün'
};

export default function PostCard({ post, onLike }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { 
    addSuffix: true, 
    locale: tr 
  });

  return (
    <article className="bg-card rounded-2xl overflow-hidden border border-border animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link to={`/profile/${post.author.id}`}>
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author.id}`} className="font-semibold text-sm hover:underline">
            {post.author.name}
          </Link>
          <p className="text-xs text-muted-foreground">@{post.author.handle} · {timeAgo}</p>
        </div>

        {post.aiComment && (
          <Badge variant="secondary" className="gap-1 bg-secondary/20">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs">AI</span>
          </Badge>
        )}
      </div>

      {/* Images */}
      {post.photos.length > 0 && (
        <Link to={`/post/${post.id}`}>
          <div className={cn(
            "grid gap-1",
            post.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {post.photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Gönderi fotoğrafı ${idx + 1}`}
                className="w-full aspect-square object-cover"
              />
            ))}
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {post.mealType && (
            <Badge variant="outline" className="text-xs">
              {mealTypeLabels[post.mealType]}
            </Badge>
          )}
          {post.weightKg && (
            <Badge variant="outline" className="text-xs">
              {post.weightKg} kg
            </Badge>
          )}
          {post.measurements?.waistCm && (
            <Badge variant="outline" className="text-xs">
              Bel: {post.measurements.waistCm} cm
            </Badge>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm leading-relaxed">{post.caption}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 hover:text-destructive",
              post.isLiked && "text-destructive"
            )}
            onClick={() => onLike?.(post.id)}
          >
            <Heart className={cn("w-5 h-5", post.isLiked && "fill-current")} />
            <span className="text-sm font-medium">{post.likes}</span>
          </Button>

          <Link to={`/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.commentsCount}</span>
            </Button>
          </Link>

          <Button variant="ghost" size="sm" className="gap-2 hover:text-secondary">
            <Share2 className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="sm" className="ml-auto hover:text-warning">
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
