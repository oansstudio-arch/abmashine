export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const notificationPermission = () => {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return 'denied';
  }
};

export const scheduleSupported = notificationsSupported() && notificationPermission() === 'granted';