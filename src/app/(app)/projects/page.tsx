import Link from "next/link";
import { HardHat } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { NewProjectDialog } from "./new-project-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/services/projects";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_VARIANT } from "@/lib/projects";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Projekty" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const [projects, { data: customers }] = await Promise.all([
    getProjects(),
    supabase
      .from("customers")
      .select("id, company")
      .is("deleted_at", null)
      .order("company"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projekty"
        description="Stavební projekty — deník, rozpočet, doklady a vady na jednom místě."
      >
        <NewProjectDialog customers={customers ?? []} />
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <HardHat className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Zatím žádné projekty. Vytvořte projekt nebo jej zahajte z cenové
                nabídky.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Číslo</TableHead>
                  <TableHead>Název</TableHead>
                  <TableHead>Zákazník</TableHead>
                  <TableHead>Zahájeno</TableHead>
                  <TableHead className="text-right">Rozpočet</TableHead>
                  <TableHead>Stav</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      <Link href={`/projects/${p.id}`}>{p.number}</Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/projects/${p.id}`}>{p.name}</Link>
                    </TableCell>
                    <TableCell>{p.customers?.company ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(p.start_date)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(p.budget_amount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PROJECT_STATUS_VARIANT[p.status]}>
                        {PROJECT_STATUS_LABELS[p.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
