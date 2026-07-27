import { Bot, Sparkles, Zap } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "AI Assistant" };

const COMMANDS = [
  "Create invoice",
  "Create quotation",
  "Find overdue invoices",
  "Find customer",
  "Warehouse status",
  "Calculate VAT",
  "Find unpaid invoices",
  "Create reminder",
  "Analyze sales",
  "Predict stock shortages",
  "Generate reports",
];

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="Your ERP copilot — grounded in live business data."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> What can I ask?
            </CardTitle>
            <CardDescription>
              Use the floating assistant (bottom-right) anywhere in the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COMMANDS.map((c) => (
                <span
                  key={c}
                  className="rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Daily automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Unpaid &amp; overdue invoice checks</p>
            <p>• Warehouse shortage alerts</p>
            <p>• Expiring quotations</p>
            <p>• Missing customer data / VAT</p>
            <p>• Duplicate product detection</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Tip: the assistant answers from your live data even without an OpenAI
            key. Add <code className="font-mono">OPENAI_API_KEY</code> to enable
            the OpenAI Responses API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
