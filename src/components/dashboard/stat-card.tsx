import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: number | string;
  description?: string;
};

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
