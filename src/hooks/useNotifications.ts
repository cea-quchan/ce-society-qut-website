import { useState, useEffect } from 'react';
import { Notification } from '@/types/dashboard.types';
import { useSession } from 'next-auth/react';

export const useNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notifications');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'خطا در دریافت اعلان‌ها');
        }

        setNotifications(data.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در دریافت اعلان‌ها');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'خطا در بروزرسانی وضعیت اعلان');
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'خطا در بروزرسانی وضعیت اعلان');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'خطا در حذف اعلان');
      }

      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'خطا در حذف اعلان');
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    deleteNotification
  };
}; 