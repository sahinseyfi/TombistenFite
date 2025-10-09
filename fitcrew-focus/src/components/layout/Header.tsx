import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  action?: React.ReactNode;
  showNotifications?: boolean;
  notificationCount?: number;
}

export default function Header({ 
  title = 'FitCrew', 
  action, 
  showNotifications = true,
  notificationCount = 0 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-mobile mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-display font-bold gradient-primary bg-clip-text text-transparent">
          {title}
        </h1>
        
        <div className="flex items-center gap-2">
          {action}
          {showNotifications && (
            <Link to="/notifications" className="relative">
              <Bell className="w-6 h-6 text-foreground" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
