"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteTask, toggleTask, updateTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

type Task = Pick<
  Database["public"]["Tables"]["tasks"]["Row"],
  "id" | "title" | "description" | "due_date" | "priority" | "completed"
>;

export function ProspectTaskRow({ prospectId, task }: { prospectId: string; task: Task }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const router = useRouter();
  const days = relativeDays(task.due_date);
  const overdue = !task.completed && days !== null && days < 0;

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          disabled={pending}
          onCheckedChange={(checked) =>
            startTransition(async () => {
              await toggleTask(prospectId, task.id, checked === true);
              router.refresh();
            })
          }
          className="mt-0.5"
        />
        <button type="button" className="text-left" onClick={() => setOpen(true)}>
          <p className={cn("text-sm font-medium hover:underline", task.completed && "text-muted-foreground line-through")}>
            {task.title}
          </p>
          {task.description ? <p className="text-sm text-muted-foreground">{task.description}</p> : null}
          <p className={cn("text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
            {task.priority} · Deadline: {formatDate(task.due_date)}
            {overdue ? " · Te laat" : ""}
          </p>
        </button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteTask(prospectId, task.id);
            router.refresh();
          })
        }
      >
        <Trash2 className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Taak bewerken</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`title-${task.id}`}>Titel</Label>
              <Input id={`title-${task.id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`description-${task.id}`}>Omschrijving</Label>
              <Textarea
                id={`description-${task.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`dueDate-${task.id}`}>Deadline</Label>
                <Input
                  id={`dueDate-${task.id}`}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`priority-${task.id}`}>Prioriteit</Label>
                <select
                  id={`priority-${task.id}`}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                >
                  <option value="laag">Laag</option>
                  <option value="normaal">Normaal</option>
                  <option value="hoog">Hoog</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={pending || !title.trim()}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await updateTask(prospectId, task.id, {
                      title,
                      description: description || null,
                      dueDate: dueDate || null,
                      priority,
                    });
                    toast.success("Taak bijgewerkt");
                    setOpen(false);
                    router.refresh();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Bijwerken is mislukt.");
                  }
                })
              }
            >
              {pending ? "Bezig..." : "Opslaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
