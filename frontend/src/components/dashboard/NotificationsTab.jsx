import React, { useState, useEffect } from 'react';
import { Loader, Bell, CheckCircle, TrendingUp, Gift, DollarSign } from 'lucide-react';
import { notificationsAPI } from '../../utils/api';
import { formatRelativeTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_bid: TrendingUp,
      new_offer: TrendingUp,
      bid_accepted: CheckCircle,
      offer_accepted: CheckCircle,
      referral_earning: Gift,
      boost_activated: DollarSign
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      new_bid: 'bg-blue-100 text-blue-600',
      new_offer: 'bg-green-100 text-green-600',
      bid_accepted: 'bg-green-100 text-green-600',
      offer_accepted: 'bg-green-100 text-green-600',
      referral_earning: 'bg-yellow-100 text-yellow-600',
      boost_activated: 'bg-purple-100 text-purple-600'
    };
    return colors[type] || 'bg-dark-100 text-dark-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-primary-600 mb-3" size={40} />
        <p className="text-dark-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark-900">
          Notifications ({notifications.filter(n => !n.isRead).length} unread)
        </h2>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 font-semibold"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-dark-50 rounded-2xl">
          <Bell className="text-dark-300 mb-3" size={48} />
          <p className="text-dark-600 font-medium mb-2">No notifications</p>
          <p className="text-dark-500 text-sm text-center">
            You'll see updates about your listings, bids, and offers here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);

            return (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`card-mobile cursor-pointer transition-all ${
                  !notification.isRead ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-dark-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-dark-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-dark-500">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  )}
                </div>

                {/* Quick Action Data */}
                {notification.data && (
                  <div className="mt-3 pt-3 border-t border-dark-200">
                    <div className="flex items-center justify-between text-sm">
                      {notification.data.companyName && (
                        <span className="text-dark-600">
                          <strong>{notification.data.companyName}</strong>
                        </span>
                      )}
                      {notification.data.fromUser && (
                        <span className="text-dark-600">
                          by @{notification.data.fromUser}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;