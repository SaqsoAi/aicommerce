import prisma from "../../config/prisma";

type NotificationQuery = {
  userId?: string;
  take?: number;
  skip?: number;
  unreadOnly?: boolean;
};

const safeTake = (value?: number) => {
  if (!value || Number.isNaN(value)) return 20;
  return Math.min(Math.max(value, 1), 100);
};

export const getNotifications = async (
  query: NotificationQuery = {}
) => {
  const take = safeTake(query.take);

  return prisma.notification.findMany({
    where: {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.unreadOnly ? { isRead: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
    skip: query.skip || 0,
  });
};

export const getNotificationHistory = async (
  query: NotificationQuery = {}
) => {
  return getNotifications({
    ...query,
    take: query.take || 50,
  });
};

export const getUnreadNotificationCount = async (
  userId?: string
) => {
  return prisma.notification.count({
    where: {
      isRead: false,
      ...(userId ? { userId } : {}),
    },
  });
};

export const markNotificationRead = async (
  id: string,
  userId?: string
) => {
  return prisma.notification.updateMany({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
    data: {
      isRead: true,
    },
  });
};

export const markAllNotificationsRead = async (
  userId?: string
) => {
  return prisma.notification.updateMany({
    where: {
      isRead: false,
      ...(userId ? { userId } : {}),
    },
    data: {
      isRead: true,
    },
  });
};

export const createNotification = async (
  title: string,
  message: string,
  type: string,
  userId?: string
) => {
  return prisma.notification.create({
    data: {
      title,
      message,
      type,
      ...(userId ? { userId } : {}),
    },
  });
};