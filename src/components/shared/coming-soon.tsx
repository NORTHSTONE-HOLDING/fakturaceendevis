import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
}

/**
 * Elegant placeholder for modules whose data model & architecture are ready,
 * with the UI layer scheduled for a later iteration.
 */
export function ComingSoon({
  title,
  description,
  icon: Icon,
  features = [],
}: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Badge variant="warning">In progress</Badge>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              The data model, API layer and routing for this module are already
              in place. The full interface is being built on top of the shared
              architecture.
            </p>
          </div>
          {features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {features.map((f) => (
                <Badge key={f} variant="outline">
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
