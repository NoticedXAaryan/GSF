'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (id) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-panel-alt transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5 text-fg" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-bento border border-line bg-panel shadow-soft z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="p-3 border-b border-line flex items-center justify-between bg-panel-alt">
            <h3 className="font-semibold text-fg">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => handleMarkAsRead()} className="text-xs text-primary hover:underline font-medium">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-fg-dim">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-line">
                {notifications.map(n => (
                  <div key={n.id} className={cn("p-4 transition-colors", n.isRead ? "bg-background" : "bg-primary/5")}>
                    <p className="text-sm text-fg mb-1">{n.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-fg-dim">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                      {!n.isRead && (
                        <button onClick={() => handleMarkAsRead(n.id)} className="text-xs text-primary hover:underline">
                          Mark read
                        </button>
                      )}
                    </div>
                    {n.link && (
                      <Link href={n.link} className="text-xs text-primary hover:underline mt-2 inline-block">
                        View details
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
