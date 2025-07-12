import { useApp } from '../context/AppContext';

export function useNotifications() {
  const { state, dispatch } = useApp();

  const getUserNotifications = (userId: string) => {
    return state.notifications.filter(n => n.userId === userId);
  };

  const getUnreadCount = (userId: string) => {
    return state.notifications.filter(n => n.userId === userId && !n.isRead).length;
  };

  const markAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const markAllAsRead = (userId: string) => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: userId });
  };

  const addNotification = (notification: Omit<import('../lib/types').Notification, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
    });
  };

  return {
    notifications: state.notifications,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };
}