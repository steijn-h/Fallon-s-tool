"use client";

import { useActionState, useRef, useEffect } from "react";

import { addNote, type NoteFormState } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: NoteFormState = { error: null };

export function AddNoteForm({ profileId }: { profileId: string }) {
  const action = addNote.bind(null, profileId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <Textarea name="body" placeholder="Nieuwe notitie..." required rows={3} />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Toevoegen..." : "Notitie toevoegen"}
        </Button>
      </div>
    </form>
  );
}
