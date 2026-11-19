-- Aligne les clés étrangères des migrations écrites à la main (report_snapshot,
-- personal_dashboard, team_tasks) sur schema.prisma : Prisma attend ON UPDATE CASCADE.
-- Écart relevé le 19/11 par `prisma migrate diff` sur une copie de la production ;
-- sans effet sur les données (identifiants jamais modifiés).
ALTER TABLE "PersonalDashboard" DROP CONSTRAINT "PersonalDashboard_userId_fkey";
ALTER TABLE "ReportSnapshot" DROP CONSTRAINT "ReportSnapshot_userId_fkey";
ALTER TABLE "TeamTask" DROP CONSTRAINT "TeamTask_organizationId_fkey";
ALTER TABLE "TeamTaskEvent" DROP CONSTRAINT "TeamTaskEvent_taskId_fkey";
ALTER TABLE "ReportSnapshot" ADD CONSTRAINT "ReportSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalDashboard" ADD CONSTRAINT "PersonalDashboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamTask" ADD CONSTRAINT "TeamTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamTaskEvent" ADD CONSTRAINT "TeamTaskEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TeamTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
