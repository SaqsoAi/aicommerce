import {
  Request,
  Response,
} from "express";

import {
  getNotifications,
  getNotificationHistory,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notifications.service";

const getAuthUserId = (req: Request) => {
  return (req as any).user?.id || (req as any).userId || undefined;
};

const getNumberQuery = (
  value: unknown,
  fallback: number
) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const fetchNotifications =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getNotifications({
          userId: getAuthUserId(req),
          take: getNumberQuery(req.query.take, 20),
          skip: getNumberQuery(req.query.skip, 0),
        });

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  };

export const fetchNotificationHistory =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getNotificationHistory({
          userId: getAuthUserId(req),
          take: getNumberQuery(req.query.take, 50),
          skip: getNumberQuery(req.query.skip, 0),
        });

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch notification history",
      });
    }
  };

export const fetchUnreadNotificationCount =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const count =
        await getUnreadNotificationCount(
          getAuthUserId(req)
        );

      return res.json({
        success: true,
        data: {
          count,
        },
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch unread notification count",
      });
    }
  };

export const readNotification =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const result =
        await markNotificationRead(
          String(req.params.id),
          getAuthUserId(req)
        );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }
  };

export const readAllNotifications =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const result =
        await markAllNotificationsRead(
          getAuthUserId(req)
        );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  };