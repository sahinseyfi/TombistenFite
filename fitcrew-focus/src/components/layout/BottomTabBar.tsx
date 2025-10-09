import { Home, Search, CircleDashed, TrendingUp, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Akış', icon: Home, path: '/feed' },
  { name: 'Keşfet', icon: Search, path: '/explore' },
  { name: 'Çark', icon: CircleDashed, path: '/treats', isAction: true },
  { name: 'Grafikler', icon: TrendingUp, path: '/analytics' },
  { name: 'Profil', icon: User, path: '/profile' }
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-mobile mx-auto px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                  tab.isAction
                    ? 'gradient-primary text-primary-foreground shadow-glow scale-110'
                    : isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('w-6 h-6', tab.isAction && 'w-7 h-7')} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
