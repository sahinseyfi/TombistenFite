import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileLayout from '@/components/layout/MobileLayout';
import EmptyState from '@/components/ui/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockNotifications } from '@/services/mockData';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus
};

const notificationTexts = {
  like: 'gönderini beğendi',
  comment: 'gönderine yorum yaptı',
  follow: 'seni takip etmeye başladı'
};

export default function Notifications() {
  return (
    <MobileLayout title="Bildirimler" showNotifications={false}>
      {mockNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Yeni bildirimin yok"
          description="Aktivite olduğunda burada göreceksin"
        />
      ) : (
        <div className="divide-y divide-border">
          {mockNotifications.map((notification) => {
            const Icon = notificationIcons[notification.type];
            const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: tr
            });

            return (
              <Link
                key={notification.id}
                to={notification.post ? `/post/${notification.post.id}` : `/profile/${notification.user.id}`}
                className={cn(
                  'flex items-start gap-3 p-4 transition-colors hover:bg-muted/50',
                  !notification.read && 'bg-primary/5'
                )}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={notification.user.avatarUrl} />
                  <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <Icon className={cn(
                      'w-5 h-5 mt-0.5 flex-shrink-0',
                      notification.type === 'like' && 'text-destructive',
                      notification.type === 'comment' && 'text-primary',
                      notification.type === 'follow' && 'text-secondary'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{notification.user.name}</span>{' '}
                        <span className="text-muted-foreground">
                          {notificationTexts[notification.type]}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                    </div>
                  </div>
                </div>

                {notification.post?.photos[0] && (
                  <img
                    src={notification.post.photos[0]}
                    alt="Post"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </MobileLayout>
  );
}
