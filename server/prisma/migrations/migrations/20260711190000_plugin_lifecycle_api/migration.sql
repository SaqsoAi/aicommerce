-- Additive lifecycle settings persistence only.
CREATE TABLE IF NOT EXISTS "PluginSettingValue" (
  "id" TEXT NOT NULL,
  "pluginId" TEXT NOT NULL,
  "settingKey" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "tenantId" TEXT,
  "value" JSONB NOT NULL,
  "updatedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PluginSettingValue_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PluginSettingValue_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "PluginSettingValue_pluginId_settingKey_scope_tenantId_key" ON "PluginSettingValue"("pluginId","settingKey","scope","tenantId");
CREATE INDEX IF NOT EXISTS "PluginSettingValue_pluginId_tenantId_idx" ON "PluginSettingValue"("pluginId","tenantId");
