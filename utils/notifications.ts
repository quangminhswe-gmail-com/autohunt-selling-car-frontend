import { notification } from 'antd';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const showNotification = (
  type: NotificationType,
  title: string,
  description?: string,
  duration: number = 4.5
) => {
  notification[type]({
    title,
    description,
    duration,
    placement: 'topRight',
  });
};

export const showSuccessNotification = (title: string, description?: string) => {
  showNotification('success', title, description);
};

export const showErrorNotification = (title: string, description?: string) => {
  showNotification('error', title, description);
};

export const showInfoNotification = (title: string, description?: string) => {
  showNotification('info', title, description);
};

export const showWarningNotification = (title: string, description?: string) => {
  showNotification('warning', title, description);
};