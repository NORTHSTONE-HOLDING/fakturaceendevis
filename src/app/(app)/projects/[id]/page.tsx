import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { ProjectTabs } from "./project-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectById } from "@/services/projects";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_VARIANT } from "@/lib/projects";
import { formatDate } from "@/lib/utils";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProjectById(id);
  if (!detail) notFound();

  const { project, customer } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {project.number}
              </span>
              <Badge variant={PROJECT_STATUS_VARIANT[project.status]}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
              <span>{customer?.company ?? "Bez zákazníka"}</span>
              {project.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {project.address}
                </span>
              )}
              <span>Zahájeno {formatDate(project.start_date)}</span>
            </p>
          </div>
        </div>
      </div>

      <ProjectTabs detail={detail} />
    </div>
  );
}
