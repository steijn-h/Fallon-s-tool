"use client";

import { useTransition } from "react";

import { setTaskStatus } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, TASK_STATUS_LABELS } from "@/lib/format";
import type { Database, TaskStatus } from "@/lib/supabase/database.types";

type Task = Pick<
  Database["public"]["Tables"]["tasks"]["Row"],
  "id" | "title" | "description" | "status" | "due_date" | "assigned_to"
>;

export function TaskRow({
  task,
  profileId,
  assigneeLabel,
}: {
  task: Task;
  profileId: string;
  assigneeLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div>
        <p className="text-sm font-medium">{task.title}</p>
        {task.description ? (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Deadline: {formatDate(task.due_date)} &middot; Eigenaar: {assigneeLabel}
        </p>
      </div>
      <Select
        defaultValue={task.status}
        disabled={pending}
        onValueChange={(value) =>
          startTransition(() => {
            void setTaskStatus(profileId, task.id, value as TaskStatus);
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {task.status === "done" ? <Badge>Afgerond</Badge> : null}
    </div>
  );
}
