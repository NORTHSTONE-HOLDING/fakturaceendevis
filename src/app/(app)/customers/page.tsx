import Link from "next/link";
import { Building2, Mail, Phone } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CustomerFormDialog } from "./customer-form-dialog";
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

export const metadata = { title: "Zákazníci" };

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const list = customers ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zákazníci"
        description={`${list.length} firem ve vaší databázi`}
      >
        <CustomerFormDialog />
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Zatím žádní zákazníci. Přidejte svou první firmu.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>IČO / DIČ</TableHead>
                  <TableHead>Štítky</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary-foreground">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <Link
                            href={`/customers/${c.id}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {c.company}
                          </Link>
                          {c.contact_person && (
                            <p className="text-xs text-muted-foreground">
                              {c.contact_person}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-sm">
                        {c.email && (
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" /> {c.email}
                          </p>
                        )}
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" /> {c.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.ico ?? "—"}
                      {c.dic ? ` / ${c.dic}` : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <Badge key={t} variant="outline">
                            {t}
                          </Badge>
                        ))}
                      </div>
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
