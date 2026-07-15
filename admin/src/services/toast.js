let nextToastId = 1;
const listeners = new Set();

const publish = (type, message, options = {}) => {
  const text = Array.isArray(message) ? message.join('; ') : String(message || '');
  if (!text) return null;
  const item = {
    id: nextToastId++,
    type,
    message: text,
    title: options.title,
    duration: options.duration ?? (type === 'error' ? 6000 : 4000),
  };
  listeners.forEach((listener) => listener(item));
  return item.id;
};

export const toast = {
  success: (message, options) => publish('success', message, options),
  error: (message, options) => publish('error', message, options),
  warning: (message, options) => publish('warning', message, options),
  info: (message, options) => publish('info', message, options),
};

export const subscribeToToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
