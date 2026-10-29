"use client";

import { useActionState, useRef, useEffect } from "react";

import { addTask, type TaskFormState, type TaskParent } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: TaskFormState = { error: null };

export function AddTaskForm({ parent }: { parent: TaskParent }) {
  const action = addTask.bind(null, parent);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Nieuwe taak</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dueDate">Deadline</Label>
        <Input id="dueDate" name="dueDate" type="date" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="priority">Prioriteit</Label>
        <select
          id="priority"
          name="priority"
          defaultValue="normaal"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
        >
          <option value="laag">Laag</option>
          <option value="normaal">Normaal</option>
          <option value="hoog">Hoog</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Bezig..." : "Toevoegen"}
      </Button>
      {state.error ? <p className="col-span-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
