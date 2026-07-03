import {
  Request,
  Response,
} from 'express';

import {
  getStoreSettingsService,
  updateStoreSettingsService,
} from './store-settings.service';

import {
  storeSettingsSchema,
} from './store-settings.validation';

export const getStoreSettings =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const data =
        await getStoreSettingsService();

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const updateStoreSettings =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const body =
        storeSettingsSchema.parse(
          req.body
        );

      const data =
        await updateStoreSettingsService(
          body
        );

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const uploadStoreLogo =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const baseUrl =
        process.env.SERVER_URL ||
        `${req.protocol}://${req.get('host')}`;

      const logoUrl =
        `${baseUrl}/uploads/store/${file.filename}`;

      const data =
        await updateStoreSettingsService({
          logoUrl,
        });

      return res.json({
        success: true,
        data,
        logoUrl,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
