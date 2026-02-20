import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './NotificationBell.css';

const NotificationBell = () => {
    const [allNotifications, setAllNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const url = 'http://localhost:8083/ws-notifications';
        console.log('📡 Notification Bell: Connecting to', url);
        const socket = new SockJS(url);
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('✅ Notification Bell: Connected');

            // Subscribe to global notifications
            client.subscribe('/topic/notifications', (message) => {
                const notification = JSON.parse(message.body);
                addToHistory(notification);
            });

            // Subscribe to user-specific notifications
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.id) {
                client.subscribe(`/topic/user/${user.id}/notifications`, (message) => {
                    const notification = JSON.parse(message.body);
                    addToHistory(notification);
                });
            }

            setStompClient(client);
        });

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, []);

    const addToHistory = (notification) => {
        // Block location updates
        if (notification.eventType === 'driver.location.updated') {
            return;
        }

        setAllNotifications(prev => {
            const updated = [{ ...notification, id: Date.now(), read: false }, ...prev];
            // Keep only last 50 notifications
            return updated.slice(0, 50);
        });

        setUnreadCount(prev => prev + 1);
    };

    const markAsRead = (id) => {
        setAllNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setAllNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
    };

    const clearHistory = () => {
        setAllNotifications([]);
        setUnreadCount(0);
    };

    const getNotificationIcon = (eventType) => {
        if (!eventType) return '🔔';
        if (eventType.includes('booking')) return '🚕';
        if (eventType.includes('payment')) return '💳';
        if (eventType.includes('user') || eventType.includes('login') || eventType.includes('registered')) return '👤';
        if (eventType.includes('ride')) return '🛣️';
        if (eventType.includes('driver') || eventType.includes('cab')) return '🚗';
        return '🔔';
    };

    const getNotificationColor = (eventType) => {
        if (eventType.includes('success') || eventType.includes('completed') || eventType.includes('accepted') || eventType.includes('login') || eventType.includes('registered')) {
            return 'success';
        }
        if (eventType.includes('failed') || eventType.includes('cancelled')) {
            return 'error';
        }
        if (eventType.includes('created') || eventType.includes('updated')) {
            return 'info';
        }
        return 'default';
    };

    return (
        <div className="notification-bell-container">
            {/* Bell Icon Button */}
            <button 
                className="bell-icon-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="notification-panel">
                    <div className="panel-header">
                        <h3>Notifications</h3>
                        <div className="panel-actions">
                            {unreadCount > 0 && (
                                <button className="action-btn" onClick={markAllAsRead} title="Mark all as read">
                                    ✓
                                </button>
                            )}
                            {allNotifications.length > 0 && (
                                <button className="action-btn danger" onClick={clearHistory} title="Clear history">
                                    🗑️
                                </button>
                            )}
                            <button className="action-btn" onClick={() => setIsOpen(false)}>
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="panel-content">
                        {allNotifications.length === 0 ? (
                            <div className="empty-state">
                                <p>🔔 No notifications yet</p>
                            </div>
                        ) : (
                            <ul className="notification-list">
                                {allNotifications.map(notif => (
                                    <li
                                        key={notif.id}
                                        className={`notification-item ${getNotificationColor(notif.eventType)} ${notif.read ? 'read' : 'unread'}`}
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className="notif-icon">
                                            {getNotificationIcon(notif.eventType)}
                                        </div>
                                        <div className="notif-content">
                                            <div className="notif-message">
                                                {notif.message || notif.title || 'Notification'}
                                            </div>
                                            <div className="notif-type">
                                                {notif.eventType}
                                            </div>
                                            <div className="notif-time">
                                                {new Date(notif.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        {!notif.read && <div className="unread-indicator"></div>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="panel-footer">
                        <small>{allNotifications.length} total notifications</small>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
