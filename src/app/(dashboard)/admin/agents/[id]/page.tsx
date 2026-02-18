import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModerationActionButton } from "@/components/admin/moderation-action-button";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: { id: string };
};

type AgentDetail = {
  id: string;
  status: string;
  company_name: string | null;
  license_number: string | null;
  document_url: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
};

function normalizeStoragePath(path: string) {
  return path.startsWith("agent-documents/") ? path.replace(/^agent-documents\//, "") : path;
}

export default async function AdminAgentDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("agents")
    .select(
      `
      id, status, company_name, license_number, document_url, rejection_reason, reviewed_at,
      profiles:profile_id(full_name, email, phone)
    `
    )
    .eq("id", params.id)
    .single()) as { data: AgentDetail | null };

  if (!data) {
    notFound();
  }

  let signedDocUrl: string | null = null;
  if (data.document_url) {
    const { data: signed } = await supabase.storage
      .from("agent-documents")
      .createSignedUrl(normalizeStoragePath(data.document_url), 60 * 5);
    signedDocUrl = signed?.signedUrl || null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Agent Detail</h1>
        <p className="text-sm text-muted-foreground">Review submitted information and documents.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <p><span className="font-medium">Name:</span> {data.profiles?.full_name || "—"}</p>
          <p><span className="font-medium">Email:</span> {data.profiles?.email || "—"}</p>
          <p><span className="font-medium">Phone:</span> {data.profiles?.phone || "—"}</p>
          <p><span className="font-medium">Company:</span> {data.company_name || "—"}</p>
          <p><span className="font-medium">License:</span> {data.license_number || "—"}</p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <Badge className="capitalize">{data.status}</Badge>
          </p>
          {data.rejection_reason ? (
            <p className="sm:col-span-2"><span className="font-medium">Rejection reason:</span> {data.rejection_reason}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document</CardTitle>
        </CardHeader>
        <CardContent>
          {signedDocUrl ? (
            <a href={signedDocUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Open submitted document (signed URL)
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No document uploaded.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <ModerationActionButton endpoint={`/api/admin/agents/${data.id}`} payload={{ status: "approved" }} label="Approve" />
        <ModerationActionButton endpoint={`/api/admin/agents/${data.id}`} payload={{ status: "rejected" }} label="Reject" variant="destructive" />
        <ModerationActionButton endpoint={`/api/admin/agents/${data.id}`} payload={{ status: "suspended" }} label="Suspend" variant="outline" />
      </div>
    </div>
  );
}
