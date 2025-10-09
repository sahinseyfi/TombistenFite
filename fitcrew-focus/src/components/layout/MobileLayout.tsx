import { ReactNode } from 'react';
import BottomTabBar from './BottomTabBar';
import Header from './Header';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  headerAction?: ReactNode;
  showNotifications?: boolean;
  notificationCount?: number;
}

export default function MobileLayout({ 
  children, 
  title, 
  headerAction,
  showNotifications,
  notificationCount 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background max-w-mobile mx-auto relative">
      <Header 
        title={title} 
        action={headerAction} 
        showNotifications={showNotifications}
        notificationCount={notificationCount}
      />
      
      <main className="pb-20 min-h-[calc(100vh-3.5rem)]">
        {children}
      </main>
      
      <BottomTabBar />
    </div>
  );
}
