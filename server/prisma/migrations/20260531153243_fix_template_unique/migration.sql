/*
  Warnings:

  - A unique constraint covering the columns `[template]` on the table `TemplateSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TemplateSettings_template_key" ON "TemplateSettings"("template");
