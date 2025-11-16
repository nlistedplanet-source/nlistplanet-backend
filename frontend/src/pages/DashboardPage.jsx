import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, TrendingUp, TrendingDown, Bell, Gift, User as UserIcon, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MyPostsTab from '../components/dashboard/MyPostsTab';
import BidsTab from '../components/dashboard/BidsTab';
import OffersTab from '../components/dashboard/OffersTab';
import NotificationsTab from '../components/dashboard/NotificationsTab';
import ReferralsTab from '../components/dashboard/ReferralsTab';
import ProfileTab from '../components/dashboard/ProfileTab';

const DashboardPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'posts');

  const tabs = [
    { id: 'posts', label: 'My Posts', icon: FileText },
    { id: 'bids', label: 'Bids Received', icon: TrendingUp },
    { id: 'offers', label: 'Offers Made', icon: TrendingDown },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-16 bg-white border-b border-dark-200 z-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
              <p className="text-sm text-dark-600">Welcome back, @{user.username}!</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-700 font-bold text-xl">
                  {user.username[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-100 text-dark-600'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === 'posts' && <MyPostsTab />}
        {activeTab === 'bids' && <BidsTab />}
        {activeTab === 'offers' && <OffersTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'referrals' && <ReferralsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
};

export default DashboardPage;
