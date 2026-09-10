import { AddNoteForm } from "@/components/shared/add-note-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function NotesTab({ profileId }: { profileId: string }) {
  const supabase = await createClient();

  const [{ data: notes }, { data: members }] = await Promise.all([
    supabase
      .from("notes")
      .select("id, body, author_id, created_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false }),
    supabase.from("organization_members").select("user_id, email, full_name"),
  ]);

  const authorLabelById = new Map(
    (members ?? []).map((m) => [m.user_id, m.full_name || m.email || m.user_id]),
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <AddNoteForm profileId={profileId} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {(notes ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen notities.</p>
        ) : (
          (notes ?? []).map((note) => (
            <div key={note.id} className="rounded-md border border-border bg-card p-3">
              <p className="whitespace-pre-wrap text-sm">{note.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {note.author_id ? authorLabelById.get(note.author_id) ?? "Onbekend" : "Onbekend"}
                {" · "}
                {formatDateTime(note.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
