import {
Request,
Response,
} from "express";

import {
getIntegrationConfigService,
getIntegrationConfigByIdService,
createIntegrationConfigService,
updateIntegrationConfigService,
deleteIntegrationConfigService,
barcodeLookupService,
styleLookupService,
autoFillByBarcodeService,
autoFillByStyleService,
syncStockService,
syncProductsService,
} from "./integration-engine.service";

// ================= CONFIG =================

export const getIntegrationConfigs =
async (
req: Request,
res: Response
) => {
try {
const data =
await getIntegrationConfigService();


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

export const getIntegrationConfig =
async (
req: Request,
res: Response
) => {
try {
const data =
await getIntegrationConfigByIdService(
req.params.id as string
);


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

export const createIntegrationConfig =
async (
req: Request,
res: Response
) => {
try {
const data =
await createIntegrationConfigService(
req.body
);


  return res.status(201).json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

export const updateIntegrationConfig =
async (
req: Request,
res: Response
) => {
try {
const data =
await updateIntegrationConfigService(
req.params.id as string,
req.body
);


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

export const deleteIntegrationConfig =
async (
req: Request,
res: Response
) => {
try {
await deleteIntegrationConfigService(
req.params.id as string
);


  return res.json({
    success: true,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

// ================= LOOKUP =================

export const barcodeLookup =
async (
req: Request,
res: Response
) => {
try {
const data =
await barcodeLookupService(
req.params.barcode as string
);


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

export const styleLookup =
async (
req: Request,
res: Response
) => {
try {
const data =
await styleLookupService(
req.params.styleNo as string
);


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

// ================= AUTO FILL =================

export const autoFillByBarcode =
async (
req: Request,
res: Response
) => {
try {
const data =
await autoFillByBarcodeService(
req.params.barcode as string
);


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

export const autoFillByStyle =
async (
req: Request,
res: Response
) => {
try {
const data =
await autoFillByStyleService(
req.params.styleNo as string
);


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

// ================= SYNC =================

export const syncStock =
async (
req: Request,
res: Response
) => {
try {
const data =
await syncStockService();


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};

export const syncProducts =
async (
req: Request,
res: Response
) => {
try {
const data =
await syncProductsService();


  return res.json({
    success: true,
    data,
  });
} catch (error: any) {
  console.error(error);

  return res.status(500).json({
    success: false,
  });
}


};
