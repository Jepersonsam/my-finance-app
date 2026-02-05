import { createContext, useContext, useState, useCallback } from 'react';
import Notification from '@/components/Notification';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null);

    const notify = useCallback((message, type = 'info', duration = 3000) => {
        setNotification({ message, type, duration });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const success = useCallback((message, duration) => notify(message, 'success', duration), [notify]);
    const error = useCallback((message, duration) => notify(message, 'error', duration), [notify]);
    const info = useCallback((message, duration) => notify(message, 'info', duration), [notify]);
    const warning = useCallback((message, duration) => notify(message, 'warning', duration), [notify]);

    return (
        <NotificationContext.Provider value={{ notify: { success, error, info, warning } }}>
            {children}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    onClose={hideNotification}
                />
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
