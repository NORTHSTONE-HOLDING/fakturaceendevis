import { requireProfile } from "@/lib/auth";

export default async function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfile();
  return <div className="min-h-screen bg-white">{children}</div>;
}
