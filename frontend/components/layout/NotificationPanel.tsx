'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, Inbox, Loader2, X, Eye } from 'lucide-react';
import { useUnreadNotifications, useNotificationCounts, useMarkAsRead, useMarkAllAsRead } from '@/shared/hooks/useNotification';
import { Notification } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * Helper function to get notification title - falls back to payload if main field is null
 */
const getNotificationTitle = (notification: Notification): string => {
  if (notification.title) return notification.title;
  if (notification.payload?.title) return notification.payload.title;
  if (notification.typeDisplay) return notification.typeDisplay;
  // Generate title from type
  const typeLabels: Record<string, string> = {
    'PROJECT_REGISTERED': 'New Project Registration',
    'PROJECT_APPROVED': 'Project Approved',
    'PROJECT_REJECTED': 'Project Rejected',
    'GROUP_INVITE': 'Group Invitation',
    'GROUP_INVITE_RECEIVED': 'Group Invitation Received',
    'GROUP_INVITE_ACCEPTED': 'Invitation Accepted',
    'GROUP_INVITE_DECLINED': 'Invitation Declined',
    'SUPERVISOR_ASSIGNED': 'Supervisor Assigned',
    'SUBMISSION_REMINDER': 'Submission Reminder',
  };
  return typeLabels[notification.type] || 'Notification';
};

/**
 * Helper function to get notification message - falls back to payload if main field is null
 */
const getNotificationMessage = (notification: Notification): string => {
  if (notification.message) return notification.message;
  if (notification.payload?.message) return notification.payload.message;
  // Generate message from payload data
  const { payload } = notification;
  if (!payload) return 'You have a new notification';
  
  switch (notification.type) {
    case 'PROJECT_REJECTED':
      return payload.reason ? `Reason: ${payload.reason}` : 'Your project has been rejected';
    case 'PROJECT_APPROVED':
      return payload.project_title ? `Project "${payload.project_title}" has been approved` : 'Your project has been approved';
    case 'PROJECT_REGISTERED':
      return payload.project_title ? `Project "${payload.project_title}" is pending approval` : 'A new project has been registered';
    case 'GROUP_INVITE':
    case 'GROUP_INVITE_RECEIVED':
      return payload.inviter_name ? `${payload.inviter_name} invited you to join ${payload.group_name || 'a group'}` : 'You have been invited to a group';
    default:
      return 'You have a new notification';
  }
};

/**
 * NotificationPanel Component
 * Shows a bell icon with unread count badge and dropdown with notifications
 */
export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notificationsData, isLoading: loadingNotifications } = useUnreadNotifications();
  const { data: counts } = useNotificationCounts();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  // Handle both array and paginated response
  const notifications = Array.isArray(notificationsData) 
    ? notificationsData 
    : (notificationsData as any)?.content || [];
  
  const unreadCount = counts?.unread || 0;

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsRead.mutate([id]);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_APPROVED':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'PROJECT_REJECTED':
        return <X className="h-4 w-4 text-destructive" />;
      case 'GROUP_INVITE':
      case 'GROUP_INVITE_RECEIVED':
        return <Bell className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary transition-colors duration-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-96 p-0 shadow-lg border-primary/20 overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[320px]">
          {loadingNotifications ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getNotificationTitle(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {getNotificationMessage(notification)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          disabled={markAsRead.isPending}
                        >
                          {markAsRead.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Mark Read
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <div className="border-t px-4 py-3 bg-muted/30 space-y-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                Mark All as Read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-primary"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/notifications';
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationPanel;

