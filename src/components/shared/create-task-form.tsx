"use client";

import { useActionState } from "react";

import { createTask, type TaskFormState } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: TaskFormState = { error: null };

export function CreateTaskForm({
  profileId,
  members,
}: {
  profileId: string;
  members: { user_id: string; email: string | null; full_name: string | null }[];
}) {
  const action = createTask.bind(null, profileId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Nieuwe taak</Label>
        <Input id="title" name="title" placeholder="Bijv. Contract opsturen" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="due_date">Deadline</Label>
        <Input id="due_date" name="due_date" type="date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="assigned_to">Eigenaar</Label>
        <select
          id="assigned_to"
          name="assigned_to"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.full_name || member.email || member.user_id}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Bezig..." : "Toevoegen"}
      </Button>
      {state.error ? (
        <p className="col-span-full text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
