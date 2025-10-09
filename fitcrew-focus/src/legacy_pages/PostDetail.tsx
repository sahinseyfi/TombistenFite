import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Sparkles, Send } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { mockPosts, mockComments } from '@/services/mockData';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const mealTypeLabels = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle',
  dinner: 'Akşam',
  snack: 'Ara Öğün'
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  
  const post = mockPosts.find(p => p.id === id);

  if (!post) {
    return <div>Post not found</div>;
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: tr
  });

  const handleComment = () => {
    if (!comment.trim()) return;
    toast.success('Yorum eklendi');
    setComment('');
  };

  return (
    <MobileLayout
      title="Gönderi"
      headerAction={
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      }
      showNotifications={false}
    >
      <div className="pb-4">
        {/* Author */}
        <div className="flex items-center gap-3 p-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold">{post.author.name}</div>
            <div className="text-sm text-muted-foreground">@{post.author.handle} · {timeAgo}</div>
          </div>
        </div>

        {/* Images */}
        {post.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {post.photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Foto ${idx + 1}`}
                className="w-full aspect-square object-cover"
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {post.mealType && (
              <Badge variant="outline">{mealTypeLabels[post.mealType]}</Badge>
            )}
            {post.weightKg && <Badge variant="outline">{post.weightKg} kg</Badge>}
            {post.measurements?.waistCm && (
              <Badge variant="outline">Bel: {post.measurements.waistCm} cm</Badge>
            )}
          </div>

          {/* Caption */}
          {post.caption && <p className="leading-relaxed">{post.caption}</p>}

          {/* AI Comment */}
          {post.aiComment && (
            <div className="bg-secondary/10 rounded-xl p-4 space-y-3 border border-secondary/20">
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <Sparkles className="w-5 h-5" />
                <span>GPT-5 Önerisi</span>
              </div>
              <p className="text-sm leading-relaxed">{post.aiComment.summary}</p>
              {post.aiComment.tips && post.aiComment.tips.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {post.aiComment.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn('gap-2 hover:text-destructive', isLiked && 'text-destructive')}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
              <span className="font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.commentsCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-2 hover:text-secondary">
              <Share2 className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="sm" className="ml-auto hover:text-warning">
              <Bookmark className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Comments */}
        <div className="p-4 space-y-4">
          <h3 className="font-semibold">Yorumlar</h3>
          
          {mockComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.avatarUrl} />
                <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="sticky bottom-16 bg-background border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Yorum yaz..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            />
            <Button onClick={handleComment} className="gradient-primary">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
