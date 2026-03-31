/**
 * ============================================================================
 * Notification Service
 * ============================================================================
 * Manages in-app notifications for parents and staff.
 * Notifications are automatically created by other services (intake, review,
 * seat allocation) but this service handles retrieval and status management.
 * ============================================================================
 */

import { prisma } from '@/lib/prisma';

/**
 * Retrieves all notifications for a user, ordered by most recent first.
 * @param userId - User ID to fetch notifications for
 * @param unreadOnly - If true, only returns unread notifications
 * @returns Array of notifications with related application info
 */
export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  const where: Record<string, unknown> = { userId };
  if (unreadOnly) where.isRead = false;

  return prisma.notification.findMany({
    where,
    include: {
      application: {
        select: { id: true, studentName: true, type: true, status: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

/**
 * Returns the count of unread notifications for a user.
 * Used for the notification badge in the header.
 * @param userId - User ID
 * @returns Count of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

/**
 * Marks a single notification as read.
 * @param notificationId - Notification ID to mark as read
 * @param userId - User ID for ownership verification
 */
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

/**
 * Marks all notifications as read for a given user.
 * @param userId - User ID
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Creates a notification (used internally by other services).
 * @param params - Notification parameters
 * @returns Created notification
 */
export async function createNotification(params: {
  userId: string;
  applicationId?: string;
  title: string;
  message: string;
  type?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      applicationId: params.applicationId,
      title: params.title,
      message: params.message,
      type: params.type || 'INFO',
    },
  });
}
