import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { CustomerTabs } from "./customer-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomerProfile } from "@/services/customers";
import { CUSTOMER_ENTITY_LABELS } from "@/lib/crm";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCustomerProfile(id);
  if (!profile) notFound();

  const { customer } = profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary-foreground">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {customer.company}
            </h1>
            <Badge variant="outline">
              {CUSTOMER_ENTITY_LABELS[customer.entity_type]}
            </Badge>
            {customer.tags.map((t) => (
              <Badge key={t} variant="default">
                {t}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {customer.ico ? `IČO ${customer.ico}` : "Bez IČO"}
            {customer.dic ? ` · DIČ ${customer.dic}` : ""}
          </p>
        </div>
      </div>

      <CustomerTabs profile={profile} />
    </div>
  );
}
