import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './NotificationToast.css';

const NotificationToast = () => {
    const [notifications, setNotifications] = useState([]);
    const [seenNotifications, setSeenNotifications] = useState(new Set());

    useEffect(() => {
        const url = 'http://localhost:8083/ws-notifications';
        console.log('📡 Attempting to connect to Notification Service at:', url);
        const socket = new SockJS(url);
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            console.log('✅ Connected to Notification WebSocket');

            // Subscribe to global notifications
            stompClient.subscribe('/topic/notifications', (message) => {
                console.log('📥 Received notification:', message.body);
                const notification = JSON.parse(message.body);
                addNotification(notification);
            });

            // Subscribe to user-specific notifications if user is logged in
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.id) {
                stompClient.subscribe(`/topic/user/${user.id}/notifications`, (message) => {
                    console.log('📥 Received user notification:', message.body);
                    const notification = JSON.parse(message.body);
                    addNotification(notification);
                });
                console.log(`✅ Subscribed to user #${user.id} notifications`);
            }
        }, (error) => {
            console.error('❌ Notification WebSocket Error:', error);
            // Try reconnecting after 5 seconds
            setTimeout(() => {
                console.log('🔄 Attempting to reconnect to Notification WebSocket...');
            }, 5000);
        });

        return () => {
            if (stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);

    const getNotificationStyle = (eventType) => {
        if (!eventType) return 'default';

        if (eventType.includes('success') || eventType.includes('completed') || eventType.includes('accepted')) {
            return 'success';
        } else if (eventType.includes('failed') || eventType.includes('cancelled')) {
            return 'error';
        } else if (eventType.includes('created') || eventType.includes('updated')) {
            return 'info';
        }
        return 'default';
    };

    const getNotificationIcon = (eventType) => {
        if (!eventType) return '🔔';

        if (eventType.includes('booking')) return '🚕';
        if (eventType.includes('payment')) return '💳';
        if (eventType.includes('driver') || eventType.includes('cab')) return '🚗';
        if (eventType.includes('ride')) return '🛣️';
        return '🔔';
    };

    const addNotification = (notif) => {
        // BLOCK driver.location.updated - only show during active rides
        if (notif.eventType === 'driver.location.updated') {
            console.log('⏭️ Blocking location update notification (use map for real-time tracking)');
            return;
        }

        // Create a unique key for this notification to prevent duplicates
        const notifKey = `${notif.eventType}-${notif.message}-${notif.entityId}`;
        
        // Skip if we've already shown this notification recently
        if (seenNotifications.has(notifKey)) {
            console.log('⏭️ Skipping duplicate notification:', notifKey);
            return;
        }

        const id = Date.now();
        const style = getNotificationStyle(notif.eventType);
        const icon = getNotificationIcon(notif.eventType);

        // Mark this notification as seen
        setSeenNotifications(prev => new Set([...prev, notifKey]));

        setNotifications(prev => [...prev, { ...notif, id, style, icon }]);

        // Remove from seen set after 10 seconds to allow it to show again if needed
        setTimeout(() => {
            setSeenNotifications(prev => {
                const newSet = new Set(prev);
                newSet.delete(notifKey);
                return newSet;
            });
        }, 10000);

        // Auto-remove after 6 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 6000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="notification-toast-container">
            {notifications.map(notif => (
                <div key={notif.id} className={`notification-toast ${notif.style}`}>
                    <div className="notif-icon">{notif.icon}</div>
                    <div className="notif-content">
                        <div className="notif-title">{notif.message || notif.title || 'Notification'}</div>
                        <div className="notif-type">{notif.eventType}</div>
                        <div className="notif-time">{new Date(notif.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <button className="notif-close" onClick={() => removeNotification(notif.id)}>×</button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
