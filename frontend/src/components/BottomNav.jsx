import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, User, Bell } from 'lucide-react';
import { notificationsAPI } from '../utils/api';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getAll({ limit: 1 });
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Marketplace', path: '/marketplace' },
    { icon: Bell, label: 'Notifications', path: '/dashboard?tab=notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: '/dashboard?tab=profile' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-dark-200 z-30 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-lg transition-all touch-feedback relative ${
                active ? 'text-primary-600' : 'text-dark-400'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                {item.badge > 0 && (
                  <span className="badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </div>
              <span className={`text-xs mt-1 font-${active ? 'semibold' : 'normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
