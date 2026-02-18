import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type ActivityEntry = {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
};

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium capitalize">{entry.action.replaceAll("_", " ")}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.entity_type} • {entry.profiles?.full_name || "System"} • {formatDate(entry.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
